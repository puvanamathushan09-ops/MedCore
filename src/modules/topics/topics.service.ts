import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { QueryTopicDto } from './dto/query-topic.dto';
import { Prisma } from '@prisma/client';
import { generateUniqueSlug, slugify } from '../../common/utils/slug.util';

const TOPIC_RELATION_INCLUDE = {
  subject: true,
  parent: true,
  children: {
    orderBy: [{ orderIndex: 'asc' as const }, { title: 'asc' as const }],
  },
  _count: {
    select: {
      articles: true,
      children: true,
    },
  },
};

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTopicDto: CreateTopicDto) {
    const { subjectId, parentId, title, slug: customSlug, description, orderIndex } = createTopicDto;

    // 1. Verify Subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new BadRequestException(`Subject with ID '${subjectId}' not found`);
    }

    // 2. Verify Parent Topic if provided
    if (parentId) {
      const parentTopic = await this.prisma.topic.findUnique({
        where: { id: parentId },
      });
      if (!parentTopic) {
        throw new BadRequestException(`Parent Topic with ID '${parentId}' not found`);
      }
      if (parentTopic.subjectId !== subjectId) {
        throw new BadRequestException(
          `Parent Topic belongs to subject '${parentTopic.subjectId}', which does not match subject '${subjectId}'`,
        );
      }
    }

    // 3. Generate or validate Slug
    let slug: string;
    if (customSlug && customSlug.trim()) {
      const sanitizedSlug = slugify(customSlug);
      const existing = await this.prisma.topic.findUnique({
        where: { slug: sanitizedSlug },
      });
      if (existing) {
        throw new ConflictException(`Topic with slug '${sanitizedSlug}' already exists`);
      }
      slug = sanitizedSlug;
    } else {
      slug = await generateUniqueSlug(title, async (candidateSlug) => {
        const found = await this.prisma.topic.findUnique({
          where: { slug: candidateSlug },
        });
        return !!found;
      });
    }

    return this.prisma.topic.create({
      data: {
        subjectId,
        parentId,
        title,
        slug,
        description,
        orderIndex: orderIndex ?? 0,
      },
      include: TOPIC_RELATION_INCLUDE,
    });
  }

  async findAll(query: QueryTopicDto) {
    const { subjectId, parentId, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TopicWhereInput = {};

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    if (search && search.trim() !== '') {
      const searchTrimmed = search.trim();
      where.OR = [
        { title: { contains: searchTrimmed, mode: 'insensitive' } },
        { description: { contains: searchTrimmed, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.topic.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
        include: TOPIC_RELATION_INCLUDE,
      }),
      this.prisma.topic.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      include: TOPIC_RELATION_INCLUDE,
    });

    if (!topic) {
      throw new NotFoundException(`Topic with slug '${slug}' not found`);
    }

    return topic;
  }

  async findById(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: TOPIC_RELATION_INCLUDE,
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID '${id}' not found`);
    }

    return topic;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto) {
    const existingTopic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!existingTopic) {
      throw new NotFoundException(`Topic with ID '${id}' not found`);
    }

    const {
      subjectId: newSubjectId,
      parentId: newParentId,
      title,
      slug: customSlug,
      description,
      orderIndex,
    } = updateTopicDto;

    const targetSubjectId = newSubjectId ?? existingTopic.subjectId;

    // Validate Subject if updated
    if (newSubjectId && newSubjectId !== existingTopic.subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: newSubjectId },
      });
      if (!subject) {
        throw new BadRequestException(`Subject with ID '${newSubjectId}' not found`);
      }
    }

    // Validate Parent Topic if updated or if subject updated
    const targetParentId = newParentId !== undefined ? newParentId : existingTopic.parentId;
    if (targetParentId) {
      if (targetParentId === id) {
        throw new BadRequestException('A topic cannot be its own parent topic');
      }
      const parentTopic = await this.prisma.topic.findUnique({
        where: { id: targetParentId },
      });
      if (!parentTopic) {
        throw new BadRequestException(`Parent Topic with ID '${targetParentId}' not found`);
      }
      if (parentTopic.subjectId !== targetSubjectId) {
        throw new BadRequestException(
          `Parent Topic belongs to subject '${parentTopic.subjectId}', which does not match subject '${targetSubjectId}'`,
        );
      }
    }

    // Generate or validate Slug
    let slug = existingTopic.slug;
    if (customSlug && customSlug.trim()) {
      const sanitizedSlug = slugify(customSlug);
      if (sanitizedSlug !== existingTopic.slug) {
        const found = await this.prisma.topic.findUnique({
          where: { slug: sanitizedSlug },
        });
        if (found) {
          throw new ConflictException(`Topic with slug '${sanitizedSlug}' already exists`);
        }
        slug = sanitizedSlug;
      }
    } else if (title && title !== existingTopic.title) {
      slug = await generateUniqueSlug(title, async (candidateSlug) => {
        const found = await this.prisma.topic.findUnique({
          where: { slug: candidateSlug },
        });
        return !!found && found.id !== id;
      });
    }

    return this.prisma.topic.update({
      where: { id },
      data: {
        ...(newSubjectId ? { subjectId: newSubjectId } : {}),
        ...(newParentId !== undefined ? { parentId: newParentId } : {}),
        ...(title ? { title } : {}),
        slug,
        ...(description !== undefined ? { description } : {}),
        ...(orderIndex !== undefined ? { orderIndex } : {}),
      },
      include: TOPIC_RELATION_INCLUDE,
    });
  }

  async remove(id: string) {
    const existingTopic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!existingTopic) {
      throw new NotFoundException(`Topic with ID '${id}' not found`);
    }

    await this.prisma.topic.delete({
      where: { id },
    });

    return { message: 'Topic deleted successfully' };
  }
}

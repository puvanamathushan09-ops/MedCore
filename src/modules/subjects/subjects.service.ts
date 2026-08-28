import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { QuerySubjectDto } from './dto/query-subject.dto';
import { Prisma } from '@prisma/client';
import { generateUniqueSlug, slugify } from '../../common/utils/slug.util';

const SUBJECT_COUNT_SELECT = {
  select: {
    topics: true,
    articles: true,
  },
};

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const { title, slug: customSlug, description, iconUrl, orderIndex } = createSubjectDto;

    let slug: string;

    if (customSlug && customSlug.trim()) {
      const sanitizedSlug = slugify(customSlug);
      const existing = await this.prisma.subject.findUnique({
        where: { slug: sanitizedSlug },
      });
      if (existing) {
        throw new ConflictException(`Subject with slug '${sanitizedSlug}' already exists`);
      }
      slug = sanitizedSlug;
    } else {
      slug = await generateUniqueSlug(title, async (candidateSlug) => {
        const found = await this.prisma.subject.findUnique({
          where: { slug: candidateSlug },
        });
        return !!found;
      });
    }

    return this.prisma.subject.create({
      data: {
        title,
        slug,
        description,
        iconUrl,
        orderIndex: orderIndex ?? 0,
      },
      include: {
        _count: SUBJECT_COUNT_SELECT,
      },
    });
  }

  async findAll(query: QuerySubjectDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SubjectWhereInput = {};

    if (search && search.trim() !== '') {
      const searchTrimmed = search.trim();
      where.OR = [
        { title: { contains: searchTrimmed, mode: 'insensitive' } },
        { description: { contains: searchTrimmed, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
        include: {
          _count: SUBJECT_COUNT_SELECT,
        },
      }),
      this.prisma.subject.count({ where }),
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
    const subject = await this.prisma.subject.findUnique({
      where: { slug },
      include: {
        topics: {
          orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
        },
        _count: SUBJECT_COUNT_SELECT,
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with slug '${slug}' not found`);
    }

    return subject;
  }

  async findById(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
        },
        _count: SUBJECT_COUNT_SELECT,
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID '${id}' not found`);
    }

    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const existingSubject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      throw new NotFoundException(`Subject with ID '${id}' not found`);
    }

    const { title, slug: customSlug, description, iconUrl, orderIndex } = updateSubjectDto;

    let slug = existingSubject.slug;

    if (customSlug && customSlug.trim()) {
      const sanitizedSlug = slugify(customSlug);
      if (sanitizedSlug !== existingSubject.slug) {
        const found = await this.prisma.subject.findUnique({
          where: { slug: sanitizedSlug },
        });
        if (found) {
          throw new ConflictException(`Subject with slug '${sanitizedSlug}' already exists`);
        }
        slug = sanitizedSlug;
      }
    } else if (title && title !== existingSubject.title) {
      slug = await generateUniqueSlug(title, async (candidateSlug) => {
        const found = await this.prisma.subject.findUnique({
          where: { slug: candidateSlug },
        });
        return !!found && found.id !== id;
      });
    }

    return this.prisma.subject.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        slug,
        ...(description !== undefined ? { description } : {}),
        ...(iconUrl !== undefined ? { iconUrl } : {}),
        ...(orderIndex !== undefined ? { orderIndex } : {}),
      },
      include: {
        _count: SUBJECT_COUNT_SELECT,
      },
    });
  }

  async remove(id: string) {
    const existingSubject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      throw new NotFoundException(`Subject with ID '${id}' not found`);
    }

    await this.prisma.subject.delete({
      where: { id },
    });

    return { message: 'Subject deleted successfully' };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { ArticleStatus, Role, Prisma } from '@prisma/client';
import { generateUniqueSlug } from '../../common/utils/slug.util';

const AUTHOR_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
};

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createArticleDto: CreateArticleDto, authorId: string) {
    const { subjectId, topicId, title, status, ...rest } = createArticleDto;

    // Verify Author exists
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
    });
    if (!author) {
      throw new BadRequestException(`Author with ID '${authorId}' not found`);
    }

    // Verify Subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new BadRequestException(`Subject with ID '${subjectId}' not found`);
    }

    // Verify Topic exists if provided
    if (topicId) {
      const topic = await this.prisma.topic.findUnique({
        where: { id: topicId },
      });
      if (!topic) {
        throw new BadRequestException(`Topic with ID '${topicId}' not found`);
      }
    }

    // Generate Unique Slug
    const slug = await generateUniqueSlug(title, async (candidateSlug) => {
      const existing = await this.prisma.article.findUnique({
        where: { slug: candidateSlug },
      });
      return !!existing;
    });

    const articleStatus = status || ArticleStatus.DRAFT;
    const publishedAt =
      articleStatus === ArticleStatus.PUBLISHED ? new Date() : null;

    return this.prisma.article.create({
      data: {
        title,
        slug,
        status: articleStatus,
        authorId,
        subjectId,
        topicId,
        publishedAt,
        ...rest,
      },
      include: {
        author: { select: AUTHOR_SELECT },
        subject: true,
        topic: true,
      },
    });
  }

  async findAll(query: QueryArticleDto, userRole?: Role) {
    const {
      subjectId,
      topicId,
      status,
      search,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.ArticleWhereInput = {};

    // Permission filter: Students and unauthenticated users only see PUBLISHED articles
    if (!userRole || userRole === Role.STUDENT) {
      where.status = ArticleStatus.PUBLISHED;
    } else if (status) {
      where.status = status;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (topicId) {
      where.topicId = topicId;
    }

    if (search && search.trim() !== '') {
      const searchTrimmed = search.trim();
      where.OR = [
        { title: { contains: searchTrimmed, mode: 'insensitive' } },
        { summary: { contains: searchTrimmed, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: AUTHOR_SELECT },
          subject: true,
          topic: true,
        },
      }),
      this.prisma.article.count({ where }),
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

  async findBySlug(slug: string, userRole?: Role) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: AUTHOR_SELECT },
        subject: true,
        topic: true,
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with slug '${slug}' not found`);
    }

    // Role-based visibility check
    if (
      (!userRole || userRole === Role.STUDENT) &&
      article.status !== ArticleStatus.PUBLISHED
    ) {
      throw new NotFoundException(`Article with slug '${slug}' not found`);
    }

    return article;
  }

  async findById(id: string, userRole?: Role) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: AUTHOR_SELECT },
        subject: true,
        topic: true,
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID '${id}' not found`);
    }

    // Role-based visibility check
    if (
      (!userRole || userRole === Role.STUDENT) &&
      article.status !== ArticleStatus.PUBLISHED
    ) {
      throw new NotFoundException(`Article with ID '${id}' not found`);
    }

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw new NotFoundException(`Article with ID '${id}' not found`);
    }

    const { subjectId, topicId, title, status, ...rest } = updateArticleDto;

    if (subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });
      if (!subject) {
        throw new BadRequestException(`Subject with ID '${subjectId}' not found`);
      }
    }

    if (topicId) {
      const topic = await this.prisma.topic.findUnique({
        where: { id: topicId },
      });
      if (!topic) {
        throw new BadRequestException(`Topic with ID '${topicId}' not found`);
      }
    }

    let slug = existingArticle.slug;
    if (title && title !== existingArticle.title) {
      slug = await generateUniqueSlug(title, async (candidateSlug) => {
        const found = await this.prisma.article.findUnique({
          where: { slug: candidateSlug },
        });
        return !!found && found.id !== id;
      });
    }

    let publishedAt = existingArticle.publishedAt;
    if (
      status === ArticleStatus.PUBLISHED &&
      existingArticle.status !== ArticleStatus.PUBLISHED
    ) {
      publishedAt = new Date();
    }

    return this.prisma.article.update({
      where: { id },
      data: {
        ...(title ? { title, slug } : {}),
        ...(status ? { status, publishedAt } : {}),
        ...(subjectId ? { subjectId } : {}),
        ...(topicId !== undefined ? { topicId } : {}),
        ...rest,
      },
      include: {
        author: { select: AUTHOR_SELECT },
        subject: true,
        topic: true,
      },
    });
  }
  async remove(id: string, userRole: Role) {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw new NotFoundException(`Article with ID '${id}' not found`);
    }

    // Medical Reviewers can delete only Draft articles.
    // Admins can delete both Draft and Published articles.
    if (
      userRole === Role.MEDICAL_REVIEWER &&
      existingArticle.status !== ArticleStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Medical Reviewers can delete only draft articles.',
      );
    }

    await this.prisma.article.delete({
      where: { id },
    });

    return { message: 'Article deleted successfully' };
  }
}

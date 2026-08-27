import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateArticleDto } from './create-article.dto';
import { UpdateArticleDto } from './update-article.dto';
import { ArticleStatus } from '@prisma/client';

describe('Articles DTO Validation', () => {
  describe('CreateArticleDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(CreateArticleDto, {
        title: 'Understanding Appendicitis',
        content: 'Full article text...',
        summary: 'Brief overview',
        featuredImageUrl: 'https://example.com/image.jpg',
        status: ArticleStatus.DRAFT,
        subjectId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        topicId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when required fields are missing', async () => {
      const dto = plainToInstance(CreateArticleDto, {});

      const errors = await validate(dto);
      const errorProperties = errors.map((e) => e.property);

      expect(errorProperties).toContain('title');
      expect(errorProperties).toContain('content');
      expect(errorProperties).toContain('subjectId');
    });

    it('should fail validation when subjectId is not a valid UUID', async () => {
      const dto = plainToInstance(CreateArticleDto, {
        title: 'Title',
        content: 'Content',
        subjectId: 'invalid-uuid-format',
      });

      const errors = await validate(dto);
      const subjectIdError = errors.find((e) => e.property === 'subjectId');

      expect(subjectIdError).toBeDefined();
      expect(subjectIdError?.constraints).toHaveProperty('isUuid');
    });

    it('should fail validation when status is not a valid ArticleStatus enum', async () => {
      const dto = plainToInstance(CreateArticleDto, {
        title: 'Title',
        content: 'Content',
        subjectId: '11111111-1111-1111-1111-111111111111',
        status: 'INVALID_STATUS' as any,
      });

      const errors = await validate(dto);
      const statusError = errors.find((e) => e.property === 'status');

      expect(statusError).toBeDefined();
      expect(statusError?.constraints).toHaveProperty('isEnum');
    });

    it('should fail validation when featuredImageUrl is not a valid URL', async () => {
      const dto = plainToInstance(CreateArticleDto, {
        title: 'Title',
        content: 'Content',
        subjectId: '11111111-1111-1111-1111-111111111111',
        featuredImageUrl: 'not-a-valid-url',
      });

      const errors = await validate(dto);
      const imageError = errors.find((e) => e.property === 'featuredImageUrl');

      expect(imageError).toBeDefined();
      expect(imageError?.constraints).toHaveProperty('isUrl');
    });
  });

  describe('UpdateArticleDto', () => {
    it('should pass validation with valid partial data', async () => {
      const dto = plainToInstance(UpdateArticleDto, {
        title: 'Updated Title Only',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty object (all fields optional)', async () => {
      const dto = plainToInstance(UpdateArticleDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when subjectId is an invalid UUID', async () => {
      const dto = plainToInstance(UpdateArticleDto, {
        subjectId: 'not-a-uuid',
      });

      const errors = await validate(dto);
      const subjectIdError = errors.find((e) => e.property === 'subjectId');

      expect(subjectIdError).toBeDefined();
    });

    it('should fail validation when status is an invalid enum value', async () => {
      const dto = plainToInstance(UpdateArticleDto, {
        status: 'PUBLISH_NOW' as any,
      });

      const errors = await validate(dto);
      const statusError = errors.find((e) => e.property === 'status');

      expect(statusError).toBeDefined();
    });
  });
});

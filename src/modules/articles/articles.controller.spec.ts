import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ArticleStatus, Role } from '@prisma/client';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: jest.Mocked<ArticlesService>;

  const mockArticle = {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'Understanding Acute Appendicitis',
    slug: 'understanding-acute-appendicitis',
    content: 'Full article content...',
    summary: 'Summary...',
    featuredImageUrl: null,
    status: ArticleStatus.PUBLISHED,
    authorId: '11111111-1111-1111-1111-111111111111',
    subjectId: '22222222-2222-2222-2222-222222222222',
    topicId: null,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get(ArticlesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate create call to ArticlesService', async () => {
      service.create.mockResolvedValue(mockArticle as any);

      const dto = {
        title: 'Understanding Acute Appendicitis',
        content: 'Full article content...',
        subjectId: '22222222-2222-2222-2222-222222222222',
      };

      const result = await controller.create(dto, { id: 'user-id' });

      expect(service.create).toHaveBeenCalledWith(dto, 'user-id');
      expect(result).toEqual(mockArticle);
    });
  });

  describe('findAll', () => {
    it('should delegate list call to ArticlesService with query and user role', async () => {
      const mockResult = { data: [mockArticle], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      service.findAll.mockResolvedValue(mockResult as any);

      const query = { page: 1, limit: 10 };
      const user = { role: Role.STUDENT };

      const result = await controller.findAll(query, user);

      expect(service.findAll).toHaveBeenCalledWith(query, Role.STUDENT);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findBySlug', () => {
    it('should delegate findBySlug to ArticlesService', async () => {
      service.findBySlug.mockResolvedValue(mockArticle as any);

      const result = await controller.findBySlug('understanding-acute-appendicitis', { role: Role.STUDENT });

      expect(service.findBySlug).toHaveBeenCalledWith('understanding-acute-appendicitis', Role.STUDENT);
      expect(result).toEqual(mockArticle);
    });
  });

  describe('findById', () => {
    it('should delegate findById to ArticlesService', async () => {
      service.findById.mockResolvedValue(mockArticle as any);

      const result = await controller.findById(mockArticle.id, { role: Role.STUDENT });

      expect(service.findById).toHaveBeenCalledWith(mockArticle.id, Role.STUDENT);
      expect(result).toEqual(mockArticle);
    });
  });

  describe('update', () => {
    it('should delegate update call to ArticlesService', async () => {
      service.update.mockResolvedValue(mockArticle as any);

      const updateDto = { title: 'Updated Title' };
      const result = await controller.update(mockArticle.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockArticle.id, updateDto);
      expect(result).toEqual(mockArticle);
    });
  });

  describe('remove', () => {
    it('should delegate remove call to ArticlesService', async () => {
      service.remove.mockResolvedValue({ message: 'Article deleted successfully' });

      const result = await controller.remove(mockArticle.id);

      expect(service.remove).toHaveBeenCalledWith(mockArticle.id);
      expect(result).toEqual({ message: 'Article deleted successfully' });
    });
  });

  describe('Role-Based Authorization (RolesGuard)', () => {
    let rolesGuard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      rolesGuard = new RolesGuard(reflector);
    });

    const createMockContext = (handler: Function, role?: Role): ExecutionContext => {
      return {
        getHandler: () => handler,
        getClass: () => ArticlesController,
        switchToHttp: () => ({
          getRequest: () => ({ user: role ? { id: 'user-1', role } : null }),
        }),
      } as any;
    };

    describe('Create Article Permissions (POST /articles)', () => {
      it('should forbid STUDENT from creating articles', () => {
        const context = createMockContext(controller.create, Role.STUDENT);
        expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('should allow MEDICAL_REVIEWER to create articles', () => {
        const context = createMockContext(controller.create, Role.MEDICAL_REVIEWER);
        expect(rolesGuard.canActivate(context)).toBe(true);
      });

      it('should allow ADMIN to create articles', () => {
        const context = createMockContext(controller.create, Role.ADMIN);
        expect(rolesGuard.canActivate(context)).toBe(true);
      });
    });

    describe('Update Article Permissions (PATCH /articles/:id)', () => {
      it('should forbid STUDENT from updating articles', () => {
        const context = createMockContext(controller.update, Role.STUDENT);
        expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('should allow MEDICAL_REVIEWER to update articles', () => {
        const context = createMockContext(controller.update, Role.MEDICAL_REVIEWER);
        expect(rolesGuard.canActivate(context)).toBe(true);
      });

      it('should allow ADMIN to update articles', () => {
        const context = createMockContext(controller.update, Role.ADMIN);
        expect(rolesGuard.canActivate(context)).toBe(true);
      });
    });

    describe('Delete Article Permissions (DELETE /articles/:id)', () => {
      it('should forbid STUDENT from deleting articles', () => {
        const context = createMockContext(controller.remove, Role.STUDENT);
        expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('should forbid MEDICAL_REVIEWER from deleting articles', () => {
        const context = createMockContext(controller.remove, Role.MEDICAL_REVIEWER);
        expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('should allow ADMIN to delete articles', () => {
        const context = createMockContext(controller.remove, Role.ADMIN);
        expect(rolesGuard.canActivate(context)).toBe(true);
      });
    });
  });
});

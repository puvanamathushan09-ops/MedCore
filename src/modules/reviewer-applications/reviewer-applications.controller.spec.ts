import { Test, TestingModule } from '@nestjs/testing';
import { ReviewerApplicationsController } from './reviewer-applications.controller';
import { ReviewerApplicationsService } from './reviewer-applications.service';
import { ApplicationStatus } from '@prisma/client';

describe('ReviewerApplicationsController', () => {
  let controller: ReviewerApplicationsController;
  let service: ReviewerApplicationsService;

  const mockService = {
    registerAndApply: jest.fn(),
    apply: jest.fn(),
    getMyApplication: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewerApplicationsController],
      providers: [
        {
          provide: ReviewerApplicationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ReviewerApplicationsController>(
      ReviewerApplicationsController,
    );
    service = module.get<ReviewerApplicationsService>(
      ReviewerApplicationsService,
    );
    jest.clearAllMocks();
  });

  describe('registerAndApply', () => {
    it('delegates to reviewerApplicationsService.registerAndApply with dto', async () => {
      const registerDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'password123',
        professionalTitle: 'MD',
        specialty: 'Neurology',
        qualifications: 'MD',
        institution: 'Mayo Clinic',
      };
      mockService.registerAndApply.mockResolvedValue({ message: 'Success' });

      const result = await controller.registerAndApply(registerDto);

      expect(service.registerAndApply).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({ message: 'Success' });
    });
  });

  describe('apply', () => {
    it('delegates to reviewerApplicationsService.apply with currentUser.id', async () => {
      const applyDto = {
        professionalTitle: 'MD',
        specialty: 'Neurology',
        qualifications: 'MD',
        institution: 'Mayo Clinic',
      };
      mockService.apply.mockResolvedValue({ id: 'app-1', status: ApplicationStatus.PENDING });

      const result = await controller.apply({ id: 'user-1' }, applyDto);

      expect(service.apply).toHaveBeenCalledWith('user-1', applyDto);
      expect(result).toEqual({ id: 'app-1', status: ApplicationStatus.PENDING });
    });
  });

  describe('getMyApplication', () => {
    it('delegates to reviewerApplicationsService.getMyApplication with currentUser.id', async () => {
      mockService.getMyApplication.mockResolvedValue({ id: 'app-1', status: ApplicationStatus.PENDING });

      const result = await controller.getMyApplication({ id: 'user-1' });

      expect(service.getMyApplication).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ id: 'app-1', status: ApplicationStatus.PENDING });
    });
  });

  describe('findAll', () => {
    it('delegates to reviewerApplicationsService.findAll with query parameters', async () => {
      const query = { status: ApplicationStatus.PENDING, page: 1, limit: 10 };
      mockService.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [], meta: { total: 0 } });
    });
  });

  describe('approve', () => {
    it('delegates to reviewerApplicationsService.approve with application ID and admin ID', async () => {
      mockService.approve.mockResolvedValue({ id: 'app-1', status: ApplicationStatus.APPROVED });

      const result = await controller.approve('app-1', { id: 'admin-1' });

      expect(service.approve).toHaveBeenCalledWith('app-1', 'admin-1');
      expect(result).toEqual({ id: 'app-1', status: ApplicationStatus.APPROVED });
    });
  });

  describe('reject', () => {
    it('delegates to reviewerApplicationsService.reject with application ID, admin ID, and rejectionReason', async () => {
      mockService.reject.mockResolvedValue({ id: 'app-1', status: ApplicationStatus.REJECTED });

      const result = await controller.reject(
        'app-1',
        { id: 'admin-1' },
        { rejectionReason: 'Incomplete documents' },
      );

      expect(service.reject).toHaveBeenCalledWith(
        'app-1',
        'admin-1',
        'Incomplete documents',
      );
      expect(result).toEqual({ id: 'app-1', status: ApplicationStatus.REJECTED });
    });
  });
});

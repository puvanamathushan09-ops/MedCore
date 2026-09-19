import { ReviewerApplicationsApiClient } from './reviewer-applications.api';
import type { ReviewerApplication } from '../types/reviewer-application.types';

describe('ReviewerApplicationsApiClient', () => {
  const mockToken = 'mock-jwt-bearer-token';
  const mockApplication: ReviewerApplication = {
    id: 'app-uuid-1',
    userId: 'user-uuid-1',
    professionalTitle: 'MD',
    specialty: 'Cardiology',
    qualifications: 'MBBS, MD',
    institution: 'General Hospital',
    bio: 'Cardiologist bio',
    expertise: 'Heart failure',
    status: 'PENDING',
    rejectionReason: null,
    reviewedByAdminId: null,
    reviewedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('registerAndApply', () => {
    it('sends POST /reviewer-applications/register-and-apply without bearer token', async () => {
      const mockResponse = {
        message: 'Success',
        user: { id: 'u-1', email: 'doc@example.com', firstName: 'Doc', lastName: 'House', role: 'STUDENT' },
        application: mockApplication,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const input = {
        firstName: 'Doc',
        lastName: 'House',
        email: 'doc@example.com',
        password: 'password123',
        professionalTitle: 'MD',
        specialty: 'Diagnostics',
        qualifications: 'MD',
        institution: 'Princeton-Plainsboro',
      };

      const result = await ReviewerApplicationsApiClient.registerAndApply(input);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviewer-applications/register-and-apply'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(input),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('apply', () => {
    it('sends POST /reviewer-applications/apply with bearer token and body', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(mockApplication),
      } as any);

      const input = {
        professionalTitle: 'MD',
        specialty: 'Cardiology',
        qualifications: 'MBBS, MD',
        institution: 'General Hospital',
      };

      const result = await ReviewerApplicationsApiClient.apply(input, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviewer-applications/apply'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
          body: JSON.stringify(input),
        }),
      );
      expect(result).toEqual(mockApplication);
    });
  });

  describe('getMyApplication', () => {
    it('sends GET /reviewer-applications/me with bearer token', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockApplication),
      } as any);

      const result = await ReviewerApplicationsApiClient.getMyApplication(mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviewer-applications/me'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        }),
      );
      expect(result).toEqual(mockApplication);
    });
  });

  describe('getAllApplications', () => {
    it('sends GET /admin/reviewer-applications with query params and bearer token', async () => {
      const mockResponse = {
        data: [mockApplication],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await ReviewerApplicationsApiClient.getAllApplications(
        { status: 'PENDING', page: 1, limit: 10 },
        mockToken,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/reviewer-applications?status=PENDING&page=1&limit=10'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('approveApplication', () => {
    it('sends PATCH /admin/reviewer-applications/:id/approve with bearer token', async () => {
      const approvedApp = { ...mockApplication, status: 'APPROVED' as const };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(approvedApp),
      } as any);

      const result = await ReviewerApplicationsApiClient.approveApplication('app-uuid-1', mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/reviewer-applications/app-uuid-1/approve'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        }),
      );
      expect(result).toEqual(approvedApp);
    });
  });

  describe('rejectApplication', () => {
    it('sends PATCH /admin/reviewer-applications/:id/reject with rejection reason body', async () => {
      const rejectedApp = {
        ...mockApplication,
        status: 'REJECTED' as const,
        rejectionReason: 'Docs incomplete',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(rejectedApp),
      } as any);

      const result = await ReviewerApplicationsApiClient.rejectApplication(
        'app-uuid-1',
        { rejectionReason: 'Docs incomplete' },
        mockToken,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/reviewer-applications/app-uuid-1/reject'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
          body: JSON.stringify({ rejectionReason: 'Docs incomplete' }),
        }),
      );
      expect(result).toEqual(rejectedApp);
    });
  });
});

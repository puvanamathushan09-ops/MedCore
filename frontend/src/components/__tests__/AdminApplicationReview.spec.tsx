import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AdminApplicationReview } from '../AdminApplicationReview';
import { ReviewerApplicationsApiClient } from '../../../../src/client/api/reviewer-applications.api';
import * as AuthStorageModule from '../../auth/auth-storage';

vi.mock('../../../../src/client/api/reviewer-applications.api', () => ({
  ReviewerApplicationsApiClient: {
    getAllApplications: vi.fn(),
    approveApplication: vi.fn(),
    rejectApplication: vi.fn(),
  },
}));

describe('AdminApplicationReview Component', () => {
  const mockApplication = {
    id: 'app-1',
    userId: 'u-1',
    professionalTitle: 'Dr.',
    specialty: 'Cardiology',
    qualifications: 'MBBS, MD',
    institution: 'General Hospital',
    bio: 'Cardiologist bio',
    expertise: 'Heart disease',
    status: 'PENDING' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: 'u-1',
      email: 'applicant@medcore.edu',
      firstName: 'John',
      lastName: 'Smith',
      role: 'STUDENT' as const,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthStorageModule, 'getAccessToken').mockReturnValue('mock-admin-token');
  });

  it('renders pending applications and handles approve action', async () => {
    (ReviewerApplicationsApiClient.getAllApplications as any).mockResolvedValue({
      data: [mockApplication],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    (ReviewerApplicationsApiClient.approveApplication as any).mockResolvedValue({
      ...mockApplication,
      status: 'APPROVED',
    });

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AdminApplicationReview />);

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
    expect(screen.getByText('applicant@medcore.edu')).toBeInTheDocument();

    const approveBtn = screen.getByTestId('approve-btn-app-1');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(ReviewerApplicationsApiClient.approveApplication).toHaveBeenCalledWith(
        'app-1',
        'mock-admin-token',
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('admin-review-success')).toBeInTheDocument();
    });
  });

  it('handles reject action with rejection modal', async () => {
    (ReviewerApplicationsApiClient.getAllApplications as any).mockResolvedValue({
      data: [mockApplication],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    (ReviewerApplicationsApiClient.rejectApplication as any).mockResolvedValue({
      ...mockApplication,
      status: 'REJECTED',
      rejectionReason: 'Incomplete documentation.',
    });

    render(<AdminApplicationReview />);

    await waitFor(() => {
      expect(screen.getByTestId('admin-application-review')).toBeInTheDocument();
    });

    const rejectBtn = screen.getByTestId('reject-btn-app-1');
    fireEvent.click(rejectBtn);

    expect(screen.getByTestId('reject-modal')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Enter rejection reason/i);
    fireEvent.change(textarea, { target: { value: 'Incomplete documentation.' } });

    fireEvent.click(screen.getByTestId('confirm-reject-btn'));

    await waitFor(() => {
      expect(ReviewerApplicationsApiClient.rejectApplication).toHaveBeenCalledWith(
        'app-1',
        { rejectionReason: 'Incomplete documentation.' },
        'mock-admin-token',
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('admin-review-success')).toBeInTheDocument();
    });
  });
});

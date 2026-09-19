import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ReviewerApplication } from '../ReviewerApplication';
import { ReviewerApplicationsApiClient } from '../../../../src/client/api/reviewer-applications.api';
import * as AuthContextModule from '../../auth/AuthContext';
import * as AuthStorageModule from '../../auth/auth-storage';

vi.mock('../../../../src/client/api/reviewer-applications.api', () => ({
  ReviewerApplicationsApiClient: {
    apply: vi.fn(),
    getMyApplication: vi.fn(),
  },
}));

describe('ReviewerApplication Component', () => {
  const mockOnNavigateToLogin = vi.fn();
  const mockOnNavigateToRegister = vi.fn();
  const mockOnNavigateToReviewerDashboard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthStorageModule, 'getAccessToken').mockReturnValue('mock-jwt-token');
  });

  it('renders auth gate card if user is not authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(
      <ReviewerApplication
        onNavigateToLogin={mockOnNavigateToLogin}
        onNavigateToRegister={mockOnNavigateToRegister}
        onNavigateToReviewerDashboard={mockOnNavigateToReviewerDashboard}
      />,
    );

    expect(screen.getByTestId('reviewer-app-auth-gate')).toBeInTheDocument();
    expect(screen.getByText(/To apply as a Medical Reviewer, you must have an active MedCore account/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('reviewer-app-login-btn'));
    expect(mockOnNavigateToLogin).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('reviewer-app-register-btn'));
    expect(mockOnNavigateToRegister).toHaveBeenCalled();
  });

  it('renders PENDING status view if student user has a pending application', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u-1', email: 'student@medcore.edu', firstName: 'Alex', lastName: 'Student', role: 'STUDENT' },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    (ReviewerApplicationsApiClient.getMyApplication as any).mockResolvedValue({
      id: 'app-1',
      status: 'PENDING',
      professionalTitle: 'Dr.',
      specialty: 'Cardiology',
      qualifications: 'MD',
      institution: 'St. Jude',
      createdAt: new Date().toISOString(),
    });

    render(
      <ReviewerApplication
        onNavigateToLogin={mockOnNavigateToLogin}
        onNavigateToRegister={mockOnNavigateToRegister}
        onNavigateToReviewerDashboard={mockOnNavigateToReviewerDashboard}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('reviewer-app-pending')).toBeInTheDocument();
    });

    expect(screen.getByText(/Application Under Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr./i)).toBeInTheDocument();
    expect(screen.getByText(/Cardiology/i)).toBeInTheDocument();
  });

  it('renders application form and submits successfully', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u-1', email: 'student@medcore.edu', firstName: 'Alex', lastName: 'Student', role: 'STUDENT' },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    (ReviewerApplicationsApiClient.getMyApplication as any).mockResolvedValue(null);
    (ReviewerApplicationsApiClient.apply as any).mockResolvedValue({
      id: 'app-new',
      status: 'PENDING',
      professionalTitle: 'Dr.',
      specialty: 'Neurology',
      qualifications: 'MD, PhD',
      institution: 'Hopkins',
      createdAt: new Date().toISOString(),
    });

    render(
      <ReviewerApplication
        onNavigateToLogin={mockOnNavigateToLogin}
        onNavigateToRegister={mockOnNavigateToRegister}
        onNavigateToReviewerDashboard={mockOnNavigateToReviewerDashboard}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('reviewer-app-form-card')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Professional Title/i), { target: { value: 'Dr.' } });
    fireEvent.change(screen.getByLabelText(/Primary Specialty/i), { target: { value: 'Neurology' } });
    fireEvent.change(screen.getByLabelText(/Qualifications/i), { target: { value: 'MD, PhD' } });
    fireEvent.change(screen.getByLabelText(/Institution /i), { target: { value: 'Hopkins' } });

    fireEvent.click(screen.getByTestId('submit-reviewer-app-btn'));

    await waitFor(() => {
      expect(ReviewerApplicationsApiClient.apply).toHaveBeenCalledWith(
        {
          professionalTitle: 'Dr.',
          specialty: 'Neurology',
          qualifications: 'MD, PhD',
          institution: 'Hopkins',
          bio: undefined,
          expertise: undefined,
        },
        'mock-jwt-token',
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('reviewer-app-pending')).toBeInTheDocument();
    });
  });
});

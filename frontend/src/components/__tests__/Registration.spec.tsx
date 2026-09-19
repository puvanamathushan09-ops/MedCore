import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Registration } from '../Registration';
import { AuthApiClient } from '../../../../src/client/api/auth.api';
import { ReviewerApplicationsApiClient } from '../../../../src/client/api/reviewer-applications.api';

vi.mock('../../../../src/client/api/auth.api', () => ({
  AuthApiClient: {
    register: vi.fn(),
  },
}));

vi.mock('../../../../src/client/api/reviewer-applications.api', () => ({
  ReviewerApplicationsApiClient: {
    registerAndApply: vi.fn(),
  },
}));

describe('Registration Component (Dual Portals)', () => {
  const mockOnNavigateToLogin = vi.fn();
  const mockOnNavigateHome = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student registration form by default and submits successfully', async () => {
    (AuthApiClient.register as any).mockResolvedValue({
      message: 'Registration successful',
      user: {
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
      },
    });

    render(
      <Registration
        onNavigateToLogin={mockOnNavigateToLogin}
        onNavigateHome={mockOnNavigateHome}
      />
    );

    expect(screen.getByRole('heading', { name: /Create Student Account/i })).toBeInTheDocument();
    expect(screen.getByTestId('portal-tab-switcher')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByTestId('registration-submit-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('registration-success')).toBeInTheDocument();
    });

    expect(AuthApiClient.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    });
  });

  it('switches to Medical Reviewer tab, displays verification notice banner, and submits reviewer application', async () => {
    (ReviewerApplicationsApiClient.registerAndApply as any).mockResolvedValue({
      message: 'Account created and reviewer application submitted for Admin verification',
      user: {
        id: 'user-2',
        email: 'doctor@hospital.org',
        firstName: 'Sarah',
        lastName: 'Smith',
        role: 'STUDENT',
      },
      application: {
        id: 'app-1',
        status: 'PENDING',
      },
    });

    render(
      <Registration
        onNavigateToLogin={mockOnNavigateToLogin}
        onNavigateHome={mockOnNavigateHome}
      />
    );

    // Switch tab to Medical Reviewer Registration
    fireEvent.click(screen.getByTestId('tab-reviewer'));

    expect(screen.getByRole('heading', { name: /Medical Reviewer Registration/i })).toBeInTheDocument();
    expect(screen.getByTestId('reviewer-notice-banner')).toBeInTheDocument();
    expect(screen.getByText(/Admin Verification Required/i)).toBeInTheDocument();
    expect(screen.getByTestId('reviewer-extra-fields')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Sarah' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'doctor@hospital.org' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.change(screen.getByLabelText(/Professional Title/i), { target: { value: 'Dr.' } });
    fireEvent.change(screen.getByLabelText(/Primary Specialty/i), { target: { value: 'Cardiology' } });
    fireEvent.change(screen.getByLabelText(/Qualifications/i), { target: { value: 'MBBS, MD' } });
    fireEvent.change(screen.getByLabelText(/Institution /i), { target: { value: 'Johns Hopkins Hospital' } });

    fireEvent.click(screen.getByTestId('registration-submit-btn'));

    await waitFor(() => {
      expect(ReviewerApplicationsApiClient.registerAndApply).toHaveBeenCalledWith({
        firstName: 'Sarah',
        lastName: 'Smith',
        email: 'doctor@hospital.org',
        password: 'password123',
        professionalTitle: 'Dr.',
        specialty: 'Cardiology',
        qualifications: 'MBBS, MD',
        institution: 'Johns Hopkins Hospital',
        bio: undefined,
        expertise: undefined,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('registration-success')).toBeInTheDocument();
    });

    expect(screen.getByText(/Application Submitted for Verification!/i)).toBeInTheDocument();
    expect(screen.getByText(/pending Admin verification/i)).toBeInTheDocument();
  });
});

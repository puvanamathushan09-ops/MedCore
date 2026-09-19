import React, { useState, useEffect, useCallback } from 'react';
import { ReviewerApplicationsApiClient } from '../../../src/client/api/reviewer-applications.api';
import { getAccessToken } from '../auth/auth-storage';
import { useAuth } from '../auth/AuthContext';
import type { ReviewerApplication as IReviewerApplication } from '../../../src/client/types/reviewer-application.types';
import './ReviewerApplication.css';

export interface ReviewerApplicationProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToReviewerDashboard?: () => void;
}

export const ReviewerApplication: React.FC<ReviewerApplicationProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToReviewerDashboard,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [existingApp, setExistingApp] = useState<IReviewerApplication | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showReapplyForm, setShowReapplyForm] = useState<boolean>(false);

  // Form State
  const [professionalTitle, setProfessionalTitle] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('');
  const [qualifications, setQualifications] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [expertise, setExpertise] = useState<string>('');

  const fetchApplication = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const app = await ReviewerApplicationsApiClient.getMyApplication(token);
      setExistingApp(app);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch application status.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!professionalTitle.trim()) {
      setError('Professional title is required.');
      return;
    }
    if (!specialty.trim()) {
      setError('Specialty is required.');
      return;
    }
    if (!qualifications.trim()) {
      setError('Qualifications are required.');
      return;
    }
    if (!institution.trim()) {
      setError('Institution is required.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('You must be signed in to submit an application.');
      return;
    }

    setSubmitting(true);
    try {
      const newApp = await ReviewerApplicationsApiClient.apply(
        {
          professionalTitle: professionalTitle.trim(),
          specialty: specialty.trim(),
          qualifications: qualifications.trim(),
          institution: institution.trim(),
          bio: bio.trim() || undefined,
          expertise: expertise.trim() || undefined,
        },
        token,
      );

      setExistingApp(newApp);
      setShowReapplyForm(false);
    } catch (err: any) {
      let errorMessage = 'Failed to submit application. Please try again.';
      if (err?.message) {
        if (Array.isArray(err.message)) {
          errorMessage = err.message.join(', ');
        } else if (typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Unauthenticated Guard View
  if (!isAuthenticated) {
    return (
      <div className="medcore-reviewer-app-container">
        <div className="reviewer-app-card auth-gated-card" data-testid="reviewer-app-auth-gate">
          <div className="auth-gated-icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="reviewer-app-title">Medical Reviewer Application</h1>
          <p className="auth-gated-message">
            To apply as a Medical Reviewer, you must have an active MedCore account. Please sign in to your account or register as a Student first.
          </p>
          <div className="auth-gated-actions">
            <button
              type="button"
              className="btn-auth-gate-login"
              onClick={onNavigateToLogin}
              data-testid="reviewer-app-login-btn"
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn-auth-gate-register"
              onClick={onNavigateToRegister}
              data-testid="reviewer-app-register-btn"
            >
              Create Student Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="medcore-reviewer-app-container">
        <div className="reviewer-app-card loading-card">
          <div className="loading-spinner"></div>
          <p>Loading reviewer application status...</p>
        </div>
      </div>
    );
  }

  // 3. Approved State
  if (user?.role === 'MEDICAL_REVIEWER' || user?.role === 'ADMIN' || existingApp?.status === 'APPROVED') {
    return (
      <div className="medcore-reviewer-app-container">
        <div className="reviewer-app-card status-card approved-card" data-testid="reviewer-app-approved">
          <div className="status-icon-wrapper approved">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="status-title">Medical Reviewer Status Active</h2>
          <p className="status-description">
            Congratulations! You have verified Medical Reviewer privileges on MedCore. You can create, edit, and review clinical educational articles.
          </p>
          {onNavigateToReviewerDashboard && (
            <button
              type="button"
              className="btn-status-action"
              onClick={onNavigateToReviewerDashboard}
              data-testid="go-to-reviewer-dashboard-btn"
            >
              Go to Reviewer Portal
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. Pending State
  if (existingApp?.status === 'PENDING') {
    return (
      <div className="medcore-reviewer-app-container">
        <div className="reviewer-app-card status-card pending-card" data-testid="reviewer-app-pending">
          <div className="status-icon-wrapper pending">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="status-title">Application Under Review</h2>
          <p className="status-description">
            Your application to become a Medical Reviewer has been submitted and is currently being evaluated by a MedCore Administrator.
          </p>

          <div className="application-summary-box">
            <h3>Application Summary</h3>
            <div className="summary-grid">
              <div><strong>Applicant Name:</strong> {user?.firstName} {user?.lastName} ({user?.email})</div>
              <div><strong>Professional Title:</strong> {existingApp.professionalTitle}</div>
              <div><strong>Specialty:</strong> {existingApp.specialty}</div>
              <div><strong>Qualifications:</strong> {existingApp.qualifications}</div>
              <div><strong>Institution:</strong> {existingApp.institution}</div>
              <div><strong>Submitted Date:</strong> {new Date(existingApp.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <p className="pending-notice">
            You will maintain Student privileges until your application is verified and approved.
          </p>
        </div>
      </div>
    );
  }

  // 5. Rejected State (option to re-apply)
  if (existingApp?.status === 'REJECTED' && !showReapplyForm) {
    return (
      <div className="medcore-reviewer-app-container">
        <div className="reviewer-app-card status-card rejected-card" data-testid="reviewer-app-rejected">
          <div className="status-icon-wrapper rejected">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="status-title">Application Not Approved</h2>
          <p className="status-description">
            Thank you for applying. Unfortunately, your previous application to become a Medical Reviewer was not approved.
          </p>

          {existingApp.rejectionReason && (
            <div className="rejection-reason-box">
              <strong>Admin Feedback / Reason:</strong>
              <p>{existingApp.rejectionReason}</p>
            </div>
          )}

          <button
            type="button"
            className="btn-reapply"
            onClick={() => setShowReapplyForm(true)}
            data-testid="reapply-reviewer-btn"
          >
            Submit New Application
          </button>
        </div>
      </div>
    );
  }

  // 6. Application Form View (New Application or Re-applying)
  return (
    <div className="medcore-reviewer-app-container">
      <div className="reviewer-app-card" data-testid="reviewer-app-form-card">
        <div className="reviewer-app-header">
          <h1 className="reviewer-app-title">Apply as a Medical Reviewer</h1>
          <p className="reviewer-app-subtitle">
            Submit your clinical background and credentials for Admin verification to join MedCore's peer-review board.
          </p>
        </div>

        {error && (
          <div className="reviewer-app-error" data-testid="reviewer-app-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reviewer-app-form">
          <div className="applicant-badge-info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Applying as: <strong>{user?.firstName} {user?.lastName}</strong> ({user?.email})</span>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="rev-title" className="field-label">
                Professional Title <span className="required-star">*</span>
              </label>
              <input
                id="rev-title"
                type="text"
                className="form-input"
                placeholder="e.g. Dr., MD, FRCS, Associate Professor"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="rev-specialty" className="field-label">
                Primary Specialty <span className="required-star">*</span>
              </label>
              <input
                id="rev-specialty"
                type="text"
                className="form-input"
                placeholder="e.g. Cardiology, Internal Medicine, Neurology"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="rev-qualifications" className="field-label">
                Qualifications <span className="required-star">*</span>
              </label>
              <input
                id="rev-qualifications"
                type="text"
                className="form-input"
                placeholder="e.g. MBBS, MD, Board Certified in Cardiology"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="rev-institution" className="field-label">
                Institution / Hospital <span className="required-star">*</span>
              </label>
              <input
                id="rev-institution"
                type="text"
                className="form-input"
                placeholder="e.g. Johns Hopkins Hospital, Mayo Clinic"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="rev-bio" className="field-label">
              Professional Bio
            </label>
            <textarea
              id="rev-bio"
              className="form-textarea"
              rows={3}
              placeholder="Brief summary of your clinical practice, teaching experience, or academic background..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="field-group">
            <label htmlFor="rev-expertise" className="field-label">
              Areas of Expertise
            </label>
            <textarea
              id="rev-expertise"
              className="form-textarea"
              rows={2}
              placeholder="e.g. Interventional Cardiology, Electrocardiography, Heart Failure Management..."
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn-submit-reviewer-app"
            disabled={submitting}
            data-testid="submit-reviewer-app-btn"
          >
            {submitting ? 'Submitting Application...' : 'Submit Application for Admin Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

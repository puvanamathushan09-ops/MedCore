import React, { useState } from 'react';
import { AuthApiClient } from '../../../src/client/api/auth.api';
import { ReviewerApplicationsApiClient } from '../../../src/client/api/reviewer-applications.api';
import './Registration.css';

export interface RegistrationProps {
  onNavigateToLogin: () => void;
  onNavigateHome: () => void;
}

export type AccountPortalType = 'STUDENT' | 'MEDICAL_REVIEWER';

export const Registration: React.FC<RegistrationProps> = ({
  onNavigateToLogin,
  onNavigateHome,
}) => {
  const [accountType, setAccountType] = useState<AccountPortalType>('STUDENT');

  // Shared Identity Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Medical Reviewer Specific Fields
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [institution, setInstitution] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = (): string | null => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName) {
      return 'First name is required.';
    }
    if (!trimmedLastName) {
      return 'Last name is required.';
    }
    if (!trimmedEmail) {
      return 'Email address is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return 'Please enter a valid email address format.';
    }

    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    if (accountType === 'MEDICAL_REVIEWER') {
      if (!professionalTitle.trim()) {
        return 'Professional title is required.';
      }
      if (!specialty.trim()) {
        return 'Specialty is required.';
      }
      if (!qualifications.trim()) {
        return 'Qualifications are required.';
      }
      if (!institution.trim()) {
        return 'Institution is required.';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      if (accountType === 'STUDENT') {
        await AuthApiClient.register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        });
      } else {
        await ReviewerApplicationsApiClient.registerAndApply({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          professionalTitle: professionalTitle.trim(),
          specialty: specialty.trim(),
          qualifications: qualifications.trim(),
          institution: institution.trim(),
          bio: bio.trim() || undefined,
          expertise: expertise.trim() || undefined,
        });
      }
      setSuccess(true);
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please check your information and try again.';
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

  return (
    <div className="medcore-registration-page-wrapper">
      <div className="medcore-registration-split-card">
        {/* LEFT PANEL: MEDICAL VISUAL SHOWCASE */}
        <div
          className="registration-visual-panel"
          style={{ backgroundImage: "url('/images/medical-hero-3.jpg')" }}
        >
          <div className="registration-visual-scrim" />
          <div className="registration-visual-content">
            <div className="registration-visual-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              <span>Global Medical Network</span>
            </div>

            <h2 className="registration-visual-title">
              Join 50,000+ Healthcare Leaders &amp; Scholars.
            </h2>
            <p className="registration-visual-desc">
              Whether you are preparing for USMLE board examinations or verifying surgical protocols as a credentialed reviewer, MedCore supports your clinical journey.
            </p>

            <div className="registration-visual-features">
              <div className="reg-feature-item">
                <span className="reg-feature-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <strong>Zero-Paywall Medical Education</strong>
                  <span>Always free, open-access for every healthcare worker</span>
                </div>
              </div>
              <div className="reg-feature-item">
                <span className="reg-feature-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <strong>Verified Reviewer Accreditation</strong>
                  <span>Contribute peer reviews to high-yield clinical literature</span>
                </div>
              </div>
              <div className="reg-feature-item">
                <span className="reg-feature-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <strong>Interactive Case Quizzes</strong>
                  <span>Test diagnostic acumen with instant evidence rationales</span>
                </div>
              </div>
            </div>

            <div className="reg-stat-pill-row">
              <div className="reg-stat-card">
                <strong>100%</strong>
                <span>Peer-Reviewed</span>
              </div>
              <div className="reg-stat-card">
                <strong>500+</strong>
                <span>Clinical Guides</span>
              </div>
              <div className="reg-stat-card">
                <strong>50k+</strong>
                <span>Active Learners</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: FORM */}
        <div className="registration-form-panel">
          {/* BRAND HEADER */}
          <div className="registration-brand-header">
            <div
              className="registration-logo-wrapper"
              onClick={onNavigateHome}
              role="button"
              tabIndex={0}
              title="Return to MedCore Home"
            >
            <svg
              className="registration-brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1 className="registration-title">
            {accountType === 'STUDENT' ? 'Create Student Account' : 'Medical Reviewer Registration'}
          </h1>
          <p className="registration-subtitle">
            {accountType === 'STUDENT'
              ? 'Join MedCore to access peer-reviewed clinical learning & medical study materials.'
              : 'Register as a clinical expert to apply for Medical Reviewer verification on MedCore.'}
          </p>
        </div>

        {/* PORTAL TAB SWITCHER */}
        {!success && (
          <div className="registration-portal-tabs" data-testid="portal-tab-switcher">
            <button
              type="button"
              className={`portal-tab ${accountType === 'STUDENT' ? 'active' : ''}`}
              onClick={() => {
                setAccountType('STUDENT');
                setError(null);
              }}
              data-testid="tab-student"
            >
              Create Student Account
            </button>
            <button
              type="button"
              className={`portal-tab ${accountType === 'MEDICAL_REVIEWER' ? 'active' : ''}`}
              onClick={() => {
                setAccountType('MEDICAL_REVIEWER');
                setError(null);
              }}
              data-testid="tab-reviewer"
            >
              Medical Reviewer Registration
            </button>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {success ? (
          <div className="registration-success-card" data-testid="registration-success">
            <div className="success-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="success-title">
              {accountType === 'STUDENT'
                ? 'Registration Successful!'
                : 'Application Submitted for Verification!'}
            </h2>
            <p className="success-message">
              {accountType === 'STUDENT'
                ? 'Your account has been created. You can now sign in with your credentials.'
                : 'Your MedCore account has been created with Student access. Your Medical Reviewer application is pending Admin verification. Once approved by an Admin, your reviewer privileges will be activated.'}
            </p>
            <button
              type="button"
              className="btn-go-login"
              onClick={onNavigateToLogin}
              data-testid="go-to-login-btn"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* NOTICE BANNER FOR REVIEWER PORTAL */}
            {accountType === 'MEDICAL_REVIEWER' && (
              <div className="reviewer-verification-notice" data-testid="reviewer-notice-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  <strong>Admin Verification Required:</strong> Medical Reviewer accounts require Admin verification before reviewer privileges are granted. Your account will be created with Student access while your application is pending review.
                </span>
              </div>
            )}

            {/* ERROR BANNER */}
            {error ? (
              <div className="registration-error-banner" data-testid="registration-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            ) : null}

            {/* REGISTRATION FORM */}
            <form onSubmit={handleSubmit} className="registration-form">
              {/* USER IDENTITY FIELDS */}
              <div className="form-row">
                <div className="registration-field-group">
                  <label htmlFor="reg-firstname" className="registration-field-label">
                    First Name <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      id="reg-firstname"
                      type="text"
                      className="registration-input"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div className="registration-field-group">
                  <label htmlFor="reg-lastname" className="registration-field-label">
                    Last Name <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      id="reg-lastname"
                      type="text"
                      className="registration-input"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="registration-field-group">
                <label htmlFor="reg-email" className="registration-field-label">
                  Email Address <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    id="reg-email"
                    type="email"
                    className="registration-input"
                    placeholder={accountType === 'STUDENT' ? 'student@medcore.edu' : 'reviewer@hospital.org'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="registration-field-group">
                <label htmlFor="reg-password" className="registration-field-label">
                  Password <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="reg-password"
                    type="password"
                    className="registration-input"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {/* MEDICAL REVIEWER EXTRA FIELDS */}
              {accountType === 'MEDICAL_REVIEWER' && (
                <div className="reviewer-fields-section" data-testid="reviewer-extra-fields">
                  <div className="section-divider-title">Clinical Credentials & Institution</div>

                  <div className="form-row">
                    <div className="registration-field-group">
                      <label htmlFor="reg-title" className="registration-field-label">
                        Professional Title <span className="required-star">*</span>
                      </label>
                      <input
                        id="reg-title"
                        type="text"
                        className="registration-input plain-input"
                        placeholder="e.g. Dr., MD, FRCS"
                        value={professionalTitle}
                        onChange={(e) => setProfessionalTitle(e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div className="registration-field-group">
                      <label htmlFor="reg-specialty" className="registration-field-label">
                        Primary Specialty <span className="required-star">*</span>
                      </label>
                      <input
                        id="reg-specialty"
                        type="text"
                        className="registration-input plain-input"
                        placeholder="e.g. Cardiology, Neurology"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="registration-field-group">
                      <label htmlFor="reg-qualifications" className="registration-field-label">
                        Qualifications <span className="required-star">*</span>
                      </label>
                      <input
                        id="reg-qualifications"
                        type="text"
                        className="registration-input plain-input"
                        placeholder="e.g. MBBS, MD, Board Certified"
                        value={qualifications}
                        onChange={(e) => setQualifications(e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div className="registration-field-group">
                      <label htmlFor="reg-institution" className="registration-field-label">
                        Institution / Hospital <span className="required-star">*</span>
                      </label>
                      <input
                        id="reg-institution"
                        type="text"
                        className="registration-input plain-input"
                        placeholder="e.g. Johns Hopkins Hospital"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="registration-field-group">
                    <label htmlFor="reg-bio" className="registration-field-label">
                      Professional Bio
                    </label>
                    <textarea
                      id="reg-bio"
                      className="registration-textarea"
                      rows={3}
                      placeholder="Brief clinical background or academic experience..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="registration-field-group">
                    <label htmlFor="reg-expertise" className="registration-field-label">
                      Areas of Expertise
                    </label>
                    <textarea
                      id="reg-expertise"
                      className="registration-textarea"
                      rows={2}
                      placeholder="e.g. Heart Failure, Interventional Cardiology..."
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="registration-submit-btn"
                disabled={submitting}
                data-testid="registration-submit-btn"
              >
                {submitting ? (
                  <span className="submit-loading">
                    <svg className="spinner-icon" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    {accountType === 'STUDENT' ? 'Creating Account...' : 'Submitting Application...'}
                  </span>
                ) : accountType === 'STUDENT' ? (
                  'Create Student Account'
                ) : (
                  'Submit Medical Reviewer Application'
                )}
              </button>
            </form>
          </>
        )}

        {/* FOOTER INFO */}
        <div className="registration-footer-info">
          <p className="auth-switch-text">
            Already have a MedCore account?{' '}
            <button
              type="button"
              className="btn-auth-switch"
              onClick={onNavigateToLogin}
              data-testid="login-link-btn"
            >
              Sign In
            </button>
          </p>
          <p className="student-badge-hint">
            {accountType === 'STUDENT'
              ? 'Self-registration automatically registers your account with Student privileges.'
              : 'Medical Reviewer applications are pending until verified by an Admin.'}
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

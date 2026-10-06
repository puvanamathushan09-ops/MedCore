import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../../../src/client/types/auth.types';
import './Login.css';

export interface LoginProps {
  onLoginSuccess: (role: UserRole) => void;
  onNavigateHome: () => void;
  onNavigateToRegister?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onNavigateHome,
  onNavigateToRegister,
}) => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already authenticated, notify success
  React.useEffect(() => {
    if (user?.role) {
      onLoginSuccess(user.role);
    }
  }, [user, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);

    try {
      await login({ email: trimmedEmail, password });
      // Upon successful login, the AuthContext state will update and trigger useEffect
    } catch (err: any) {
      setError(
        err?.message ||
          'Authentication failed. Please verify your email and password credentials.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="medcore-login-page-wrapper">
      <div className="medcore-login-split-card">
        {/* LEFT PANEL: MEDICAL VISUAL SHOWCASE */}
        <div
          className="login-visual-panel"
          style={{ backgroundImage: "url('/images/medical-hero-2.jpg')" }}
        >
          <div className="login-visual-scrim" />
          <div className="login-visual-content">
            <div className="login-visual-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>Accredited Clinical Portal</span>
            </div>

            <h2 className="login-visual-title">
              Empowering Healthcare Minds Worldwide.
            </h2>
            <p className="login-visual-desc">
              Access high-yield anatomical guides, peer-reviewed clinical correlations, and interactive USMLE preparation modules.
            </p>

            <div className="login-visual-features">
              <div className="visual-feature-item">
                <span className="visual-feature-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>Over 500+ Board-Verified Clinical Guides</span>
              </div>
              <div className="visual-feature-item">
                <span className="visual-feature-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>Continuously updated peer-reviewed evidence</span>
              </div>
              <div className="visual-feature-item">
                <span className="visual-feature-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>Comprehensive USMLE Step 1 &amp; 2 Case Quizzes</span>
              </div>
            </div>

            <div className="login-quote-card">
              <p className="quote-text">
                "MedCore delivers the exact clinical depth textbooks lack and emergency wards demand daily."
              </p>
              <div className="quote-author">
                <div className="author-avatar-dot" />
                <div>
                  <strong>Dr. Robert Vance, MD, FACS</strong>
                  <span>Chief of Surgical Education</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AUTH FORM */}
        <div className="login-form-panel">
          {/* BRAND HEADER */}
          <div className="login-brand-header">
            <div className="login-logo-wrapper" onClick={onNavigateHome} role="button" tabIndex={0} title="Return to MedCore Home">
              <svg
                className="login-brand-icon"
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
            <h1 className="login-title">Sign in to MedCore</h1>
            <p className="login-subtitle">
              Enter your clinical credentials to access your dashboard.
            </p>
          </div>

          {/* ERROR BANNER */}
          {error ? (
            <div className="login-error-banner" data-testid="login-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          ) : null}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field-group">
              <label htmlFor="login-email" className="login-field-label">
                Email Address <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder="doctor@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-field-group">
              <label htmlFor="login-password" className="login-field-label">
                Password <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="login-password"
                  type="password"
                  className="login-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={submitting}
              data-testid="login-submit-btn"
            >
              {submitting ? (
                <span className="submit-loading">
                  <svg className="spinner-icon" width="18" height="18" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Sign In to MedCore'
              )}
            </button>
          </form>

          {/* FOOTER INFO */}
          <div className="login-footer-info">
            {onNavigateToRegister && (
              <p className="auth-switch-text">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="btn-auth-switch"
                  onClick={onNavigateToRegister}
                  data-testid="register-link-btn"
                >
                  Create Free Account
                </button>
              </p>
            )}
            <div className="login-portal-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
              <span>Authorized access for Students, Reviewers, and System Administrators.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

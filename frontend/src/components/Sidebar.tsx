import React from 'react';
import type { RouteState } from './route-utils';
import type { UserRole } from '../../../src/client/types/auth.types';
import './Sidebar.css';

export interface SidebarProps {
  activeRoute: RouteState;
  onNavigate: (type: 'dashboard' | 'reviewer-dashboard' | 'apply-reviewer' | 'article-list' | 'subject-list' | 'topic-list' | 'quiz-list') => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  onNavigate,
  isOpen,
  onCloseMobile,
  currentRole,
}) => {
  const isDashboardActive = activeRoute.type === 'dashboard';
  const isReviewerActive = activeRoute.type === 'reviewer-dashboard' || activeRoute.type === 'create-article' || activeRoute.type === 'edit-article';
  const isApplyReviewerActive = activeRoute.type === 'apply-reviewer';
  const isArticlesActive = activeRoute.type === 'article-list' || activeRoute.type === 'article-detail';
  const isSubjectsActive = activeRoute.type === 'subject-list' || activeRoute.type === 'subject-detail';
  const isTopicsActive = activeRoute.type === 'topic-list';
  const isQuizzesActive = activeRoute.type === 'quiz-list' || activeRoute.type === 'quiz-detail' || activeRoute.type === 'quiz-attempts';

  const isReviewerOrAdmin = currentRole === 'MEDICAL_REVIEWER' || currentRole === 'ADMIN';

  const handleSelectNav = (type: 'dashboard' | 'reviewer-dashboard' | 'apply-reviewer' | 'article-list' | 'subject-list' | 'topic-list' | 'quiz-list') => {
    onNavigate(type);
    onCloseMobile();
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      <div
        className={`medcore-sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* SIDEBAR NAVIGATION */}
      <aside className={`medcore-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-nav-container">
          {/* MAIN CLINICAL NAVIGATION GROUP */}
          <div className="sidebar-section-group">
            <div className="sidebar-section-header">Core Navigation</div>

            <button
              type="button"
              className={`sidebar-nav-item ${isDashboardActive ? 'active' : ''}`}
              onClick={() => handleSelectNav('dashboard')}
            >
              <svg
                className="nav-item-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className="nav-item-label">Dashboard</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${isArticlesActive ? 'active' : ''}`}
              onClick={() => handleSelectNav('article-list')}
            >
              <svg
                className="nav-item-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
              <span className="nav-item-label">Articles</span>
              <span className="nav-item-badge">Verified</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${isSubjectsActive ? 'active' : ''}`}
              onClick={() => handleSelectNav('subject-list')}
            >
              <svg
                className="nav-item-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span className="nav-item-label">Subjects</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${isTopicsActive ? 'active' : ''}`}
              onClick={() => handleSelectNav('topic-list')}
            >
              <svg
                className="nav-item-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span className="nav-item-label">Topics</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${isQuizzesActive ? 'active' : ''}`}
              onClick={() => handleSelectNav('quiz-list')}
              data-testid="sidebar-quizzes-btn"
            >
              <svg
                className="nav-item-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="nav-item-label">Quizzes</span>
            </button>
          </div>

          {/* MEDICAL REVIEWER AUTHORING SECTION */}
          {isReviewerOrAdmin ? (
            <div className="sidebar-section-group" style={{ marginTop: '16px' }}>
              <div className="sidebar-section-header">Reviewer Workspace</div>

              <button
                type="button"
                className={`sidebar-nav-item ${isReviewerActive ? 'active' : ''}`}
                onClick={() => handleSelectNav('reviewer-dashboard')}
              >
                <svg
                  className="nav-item-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="nav-item-label">Reviewer Workspace</span>
                <span className="nav-item-badge" style={{ background: 'var(--teal-500)', color: '#ffffff' }}>
                  Review
                </span>
              </button>
            </div>
          ) : (
            <div className="sidebar-section-group" style={{ marginTop: '16px' }}>
              <div className="sidebar-section-header">Become a Reviewer</div>

              <button
                type="button"
                className={`sidebar-nav-item ${isApplyReviewerActive ? 'active' : ''}`}
                onClick={() => handleSelectNav('apply-reviewer')}
                data-testid="sidebar-apply-reviewer-btn"
              >
                <svg
                  className="nav-item-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="17" y1="11" x2="23" y2="11" />
                </svg>
                <span className="nav-item-label">Apply as Reviewer</span>
              </button>
            </div>
          )}
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">
          <div className="footer-info-row">
            <span className="platform-version">MedCore Platform</span>
            <span className="nav-item-badge">v1.0</span>
          </div>
          <div className="platform-subtitle">Clinical Learning System</div>
        </div>
      </aside>
    </>
  );
};

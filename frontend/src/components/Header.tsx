import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../../../src/client/types/auth.types';
import './Header.css';

export interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onNavigateHome: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToArticles?: () => void;
  onNavigateToSubjects?: () => void;
  onNavigateToQuizzes?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onSwitchToWorkspace?: () => void;
  isWorkspaceView?: boolean;
  activeRouteType?: string;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateHome,
  onNavigateToLogin,
  onNavigateToProfile,
  onNavigateToArticles,
  onNavigateToSubjects,
  onNavigateToQuizzes,
  onNavigateToAbout,
  onNavigateToContact,
  onSwitchToWorkspace,
  isWorkspaceView = false,
  activeRouteType = 'home',
  currentRole = 'STUDENT',
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeRole: UserRole = user?.role || currentRole;

  const getRoleBadgeLabel = () => {
    switch (activeRole) {
      case 'MEDICAL_REVIEWER':
        return 'Medical Reviewer';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'Medical Student';
    }
  };

  const handleProfileClick = () => {
    if (user && onNavigateToProfile) {
      onNavigateToProfile();
    } else if (!user && onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  const handleBrandClick = () => {
    setMobileMenuOpen(false);
    if (isWorkspaceView && onNavigateHome) {
      onNavigateHome();
    } else if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleNavClick = (callback?: () => void) => {
    setMobileMenuOpen(false);
    if (callback) callback();
  };

  return (
    <header className="medcore-header">
      <div className="header-container">
        {/* LEFT SECTION: BRAND & (OPTIONAL) SIDEBAR TOGGLE */}
        <div className="header-left">
          {isWorkspaceView ? (
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              aria-label="Toggle Navigation Sidebar"
              title="Toggle Sidebar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          <div
            className="brand-logo"
            onClick={handleBrandClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBrandClick();
              }
            }}
          >
            <div className="brand-icon-wrapper">
              <svg
                className="brand-icon"
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
            <div className="brand-text-block">
              <span className="brand-title">MedCore</span>
              <span className="brand-tagline">Explore. Learn. Discover.</span>
            </div>
          </div>
        </div>

        {/* CENTER SECTION: PUBLIC NAVIGATION LINKS (Styled like reference) */}
        {!isWorkspaceView ? (
          <nav className="header-nav-tabs" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateHome)}
            >
              Home
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'article-list' || activeRouteType === 'article-detail' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateToArticles)}
            >
              Articles
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'subject-list' || activeRouteType === 'subject-detail' || activeRouteType === 'topic-list' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateToSubjects)}
            >
              Specialties
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'quiz-list' || activeRouteType === 'quiz-detail' || activeRouteType === 'quiz-attempts' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateToQuizzes)}
            >
              Quizzes
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'about' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateToAbout)}
            >
              About Us
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'contact' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateToContact)}
            >
              Contact
            </button>
          </nav>
        ) : null}

        {/* RIGHT SECTION: PORTAL SWITCHER & PROFILE */}
        {/* RIGHT SECTION: CLEAN ACTION ICONS & PROFILE (Matching reference exactly) */}
        <div className="header-right">
          {/* Quick Action Icon: Search */}
          <button
            type="button"
            className="header-action-icon-btn"
            onClick={onNavigateToArticles}
            title="Search clinical library"
            aria-label="Search articles"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Quick Action Icon: Favorites */}
          <button
            type="button"
            className="header-action-icon-btn"
            onClick={onNavigateToArticles}
            title="Saved & Bookmarked Guides"
            aria-label="Bookmarked Guides"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* 9-dot Grid Icon for Clinical Workspace */}
          <button
            type="button"
            className="header-action-icon-btn grid-menu-btn"
            onClick={isWorkspaceView ? onNavigateHome : onSwitchToWorkspace}
            title={isWorkspaceView ? "Return to Public View" : "Clinical Admin Workspace"}
            aria-label="Switch Workspace"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="5" r="2" />
              <circle cx="12" cy="5" r="2" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
              <circle cx="5" cy="19" r="2" />
              <circle cx="12" cy="19" r="2" />
              <circle cx="19" cy="19" r="2" />
            </svg>
          </button>

          {/* If in workspace view, show return button */}
          {isWorkspaceView ? (
            <button
              type="button"
              className="btn-switch-portal to-public"
              onClick={onNavigateHome}
              title="Return to Public Medical Website"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Public View</span>
            </button>
          ) : null}

          {/* User profile / Sign in button */}
          {user ? (
            <div
              className="user-profile-pill clickable"
              onClick={handleProfileClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProfileClick();
                }
              }}
              title={`Logged in as ${user.firstName || ''} ${user.lastName || ''} (${getRoleBadgeLabel()})`}
            >
              <div className="user-avatar">
                {user?.firstName ? user.firstName[0].toUpperCase() : activeRole[0]}
              </div>
              <span className="user-role-label">{getRoleBadgeLabel()}</span>
            </div>
          ) : null}

          {user ? (
            <button
              type="button"
              className="btn-header-logout"
              onClick={logout}
              title="Sign out of your MedCore account"
              data-testid="logout-button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              className="btn-header-login"
              onClick={onNavigateToLogin}
              title="Sign in to MedCore"
              data-testid="login-nav-button"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && !isWorkspaceView ? (
        <div className="mobile-nav-dropdown">
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateHome)}
          >
            Home
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'article-list' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateToArticles)}
          >
            Articles
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'subject-list' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateToSubjects)}
          >
            Specialties
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'quiz-list' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateToQuizzes)}
          >
            Clinical Quizzes
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'about' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateToAbout)}
          >
            About Us
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'contact' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateToContact)}
          >
            Contact
          </button>
          <button
            type="button"
            className="mobile-nav-item workspace-link"
            onClick={() => handleNavClick(onSwitchToWorkspace)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Clinical Admin Workspace
          </button>
        </div>
      ) : null}
    </header>
  );
};

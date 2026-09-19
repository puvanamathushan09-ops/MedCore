import React from 'react';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../../../src/client/types/auth.types';
import './Header.css';

export interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onNavigateHome: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToProfile?: () => void;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateHome,
  onNavigateToLogin,
  onNavigateToProfile,
  currentRole = 'STUDENT',
}) => {
  const { user, logout } = useAuth();
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

  return (
    <header className="medcore-header">
      <div className="header-container">
        {/* LEFT SECTION: BRAND & TOGGLE */}
        <div className="header-left">
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

          <div
            className="brand-logo"
            onClick={onNavigateHome}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigateHome();
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
            <span className="brand-title">MedCore</span>
            <span className="brand-badge">Clinical</span>
          </div>
        </div>

        {/* CENTER SECTION: SEARCH BAR */}
        <div className="header-center">
          <div className="header-search-wrapper">
            <svg
              className="header-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="header-search-input"
              placeholder="Search clinical guides, topics, or subjects..."
              aria-label="Search clinical platform"
            />
          </div>
        </div>

        {/* RIGHT SECTION: STATUS & PROFILE ROLE DISPLAY / LOGOUT */}
        <div className="header-right">
          <div className="system-status-pill" title="Connected to NestJS API & PostgreSQL">
            <span className="status-dot" />
            API Connected
          </div>

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
            title={
              user
                ? `Logged in as ${user.firstName || ''} ${user.lastName || ''} (${getRoleBadgeLabel()}) - Click to view profile`
                : `User Profile - ${getRoleBadgeLabel()}`
            }
          >
            <div className="user-avatar">
              {user?.firstName ? user.firstName[0].toUpperCase() : activeRole[0]}
            </div>
            <span className="user-role-label">{getRoleBadgeLabel()}</span>
          </div>


          {user ? (
            <button
              type="button"
              className="btn-header-logout"
              onClick={logout}
              title="Sign out of your MedCore account"
              data-testid="logout-button"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    </header>

  );
};

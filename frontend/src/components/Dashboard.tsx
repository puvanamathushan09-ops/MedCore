import React, { useState, useEffect } from 'react';
import { SubjectsApiClient } from '../../../src/client/api/subjects.api';
import { TopicsApiClient } from '../../../src/client/api/topics.api';
import { ArticlesApiClient } from '../../../src/client/api/articles.api';
import './Dashboard.css';

export interface DashboardProps {
  onNavigateToSubjects: () => void;
  onNavigateToTopics: () => void;
  onNavigateToArticles: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToSubjects,
  onNavigateToTopics,
  onNavigateToArticles,
}) => {
  const [stats, setStats] = useState({
    subjectsCount: 0,
    topicsCount: 0,
    articlesCount: 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardStats() {
      try {
        const [subjectsRes, topicsRes, articlesRes] = await Promise.allSettled([
          SubjectsApiClient.getSubjects({ limit: 1 }),
          TopicsApiClient.getTopics({ limit: 1 }),
          ArticlesApiClient.getArticles({ limit: 1 }),
        ]);

        if (!isMounted) return;

        const subjectsCount =
          subjectsRes.status === 'fulfilled' ? subjectsRes.value.meta?.total || subjectsRes.value.data?.length || 0 : 0;
        const topicsCount =
          topicsRes.status === 'fulfilled' ? topicsRes.value.meta?.total || topicsRes.value.data?.length || 0 : 0;
        const articlesCount =
          articlesRes.status === 'fulfilled' ? articlesRes.value.meta?.total || articlesRes.value.data?.length || 0 : 0;

        setStats({
          subjectsCount,
          topicsCount,
          articlesCount,
          loading: false,
        });
      } catch {
        if (isMounted) {
          setStats((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="medcore-dashboard-container">
      {/* HERO BANNER */}
      <section className="dashboard-hero-card">
        <div className="hero-pill-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Clinical Learning Platform
        </div>
        <h1 className="hero-title">Welcome to MedCore Workspace</h1>
        <p className="hero-subtitle">
          Explore structured medical subjects, core anatomical topics, and peer-reviewed clinical articles designed for medical students, clinicians, and reviewers.
        </p>

        <div className="hero-actions">
          <button type="button" className="btn-hero-primary" onClick={onNavigateToSubjects}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Explore Subjects
          </button>
          <button type="button" className="btn-hero-secondary" onClick={onNavigateToArticles}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            </svg>
            Browse Peer-Reviewed Articles
          </button>
        </div>
      </section>

      {/* METRICS CARDS GRID */}
      <section className="dashboard-metrics-grid">
        <div className="metric-card" onClick={onNavigateToSubjects} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <span className="metric-title">Medical Subjects</span>
            <span className="metric-value">
              {stats.loading ? '...' : stats.subjectsCount}
            </span>
            <span className="metric-description">Curriculum Core Modules</span>
          </div>
          <div className="metric-icon-box sky">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        </div>

        <div className="metric-card" onClick={onNavigateToTopics} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <span className="metric-title">Clinical Topics</span>
            <span className="metric-value">
              {stats.loading ? '...' : stats.topicsCount}
            </span>
            <span className="metric-description">Anatomical & Physiological</span>
          </div>
          <div className="metric-icon-box teal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
        </div>

        <div className="metric-card" onClick={onNavigateToArticles} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <span className="metric-title">Peer-Reviewed Articles</span>
            <span className="metric-value">
              {stats.loading ? '...' : stats.articlesCount}
            </span>
            <span className="metric-description">Published Guides</span>
          </div>
          <div className="metric-icon-box sky">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-title">API Connection</span>
            <span className="metric-value" style={{ color: '#10b981', fontSize: '20px' }}>
              Online
            </span>
            <span className="metric-description">NestJS & PostgreSQL Active</span>
          </div>
          <div className="metric-icon-box green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS SECTION */}
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="section-title">Core Sections</h2>
        </div>

        <div className="quick-action-grid">
          <div className="quick-card" onClick={onNavigateToSubjects}>
            <div className="quick-card-header">
              <div className="quick-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <span className="quick-card-title">Medical Subjects</span>
            </div>
            <p className="quick-card-desc">
              Browse foundational medical subjects such as Anatomy, Physiology, Pathology, and Pharmacology.
            </p>
            <div className="quick-card-footer">
              Explore Subjects
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          <div className="quick-card" onClick={onNavigateToTopics}>
            <div className="quick-card-header">
              <div className="quick-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className="quick-card-title">Clinical Topics</span>
            </div>
            <p className="quick-card-desc">
              Dive into specific anatomical structures, physiological concepts, and organ system topics.
            </p>
            <div className="quick-card-footer">
              Explore Topics
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          <div className="quick-card" onClick={onNavigateToArticles}>
            <div className="quick-card-header">
              <div className="quick-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <span className="quick-card-title">Peer-Reviewed Articles</span>
            </div>
            <p className="quick-card-desc">
              Read comprehensive clinical guides, articles, and peer-reviewed reference materials.
            </p>
            <div className="quick-card-footer">
              Read Articles
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

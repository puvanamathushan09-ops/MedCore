import React, { useState, useEffect, useCallback } from 'react';
import { ArticlesApiClient } from '../../../src/client/api/articles.api';
import { getAccessToken } from '../auth/auth-storage';
import { useAuth } from '../auth/AuthContext';
import type { Article, ArticleStatus } from '../../../src/client/types/article.types';
import './ReviewerDashboard.css';

export interface ReviewerDashboardProps {
  onCreateArticle: () => void;
  onEditArticle: (articleId: string) => void;
}

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({
  onCreateArticle,
  onEditArticle,
}) => {
  const { user } = useAuth();

  const isReviewerOrAdmin = user?.role === 'MEDICAL_REVIEWER' || user?.role === 'ADMIN';

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'ALL' | ArticleStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAccessToken() || undefined;

    try {
      const response = await ArticlesApiClient.getArticles(
        {
          limit: 100,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: searchTerm || undefined,
        },
        token,
      );
      setArticles(response.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load reviewer articles.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    if (isReviewerOrAdmin) {
      fetchArticles();
    }
  }, [isReviewerOrAdmin, fetchArticles]);

  const handleDelete = async (articleId: string, articleTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${articleTitle}"?`)) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert('Authentication required. Only ADMIN roles can delete articles.');
      return;
    }

    try {
      await ArticlesApiClient.deleteArticle(articleId, token);
      fetchArticles();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete article. Admin permissions required.');
    }
  };

  // If user is STUDENT or unauthenticated, show restricted access card
  if (!isReviewerOrAdmin) {
    return (
      <div className="reviewer-dashboard-container">
        <div className="reviewer-restricted-card">
          <div className="restricted-icon-box">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2>Reviewer Workspace Restricted</h2>
          <p>
            You are currently viewing as <strong>{user?.role || 'Student / Guest'}</strong>. Access to Medical Reviewer authoring and workflow management requires <strong>MEDICAL_REVIEWER</strong> or <strong>ADMIN</strong> role credentials.
          </p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalCount = articles.length;
  const draftCount = articles.filter((a) => a.status === 'DRAFT').length;
  const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;

  return (
    <div className="reviewer-dashboard-container">
      {/* REVIEWER HEADER */}
      <div className="reviewer-header">
        <div className="reviewer-title-group">
          <span className="reviewer-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Reviewer Workspace
          </span>
          <h1 className="reviewer-title">Medical Reviewer Dashboard</h1>
          <p className="reviewer-subtitle">
            Manage, author, review, and publish peer-reviewed clinical articles and anatomical guides.
          </p>
        </div>

        <button type="button" className="btn-create-article" onClick={onCreateArticle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create New Article
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="reviewer-stats-grid">
        <div className="reviewer-stat-card">
          <span className="stat-label">Total Articles</span>
          <span className="stat-value">{totalCount}</span>
          <span className="stat-subtext">In Reviewer Database</span>
        </div>

        <div className="reviewer-stat-card">
          <span className="stat-label">Drafts</span>
          <span className="stat-value" style={{ color: '#d97706' }}>
            {draftCount}
          </span>
          <span className="stat-subtext">Work in Progress</span>
        </div>

        <div className="reviewer-stat-card">
          <span className="stat-label">Published</span>
          <span className="stat-value" style={{ color: 'var(--teal-500)' }}>
            {publishedCount}
          </span>
          <span className="stat-subtext">Live for Students</span>
        </div>
      </div>

      {/* ARTICLES TABLE SECTION */}
      <div className="reviewer-table-card">
        <div className="table-toolbar">
          <div className="filter-pills">
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'DRAFT' ? 'active' : ''}`}
              onClick={() => setStatusFilter('DRAFT')}
            >
              Drafts ({draftCount})
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'PUBLISHED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PUBLISHED')}
            >
              Published ({publishedCount})
            </button>
          </div>

          <input
            type="text"
            className="table-search-input"
            placeholder="Search articles by title or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error ? (
          <div style={{ padding: '24px', color: '#ef4444', fontWeight: 600 }}>{error}</div>
        ) : null}

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading Reviewer Articles...
          </div>
        ) : !loading && articles.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No articles found matching the current filter.
          </div>
        ) : (
          <div className="reviewer-table-wrapper">
            <table className="reviewer-table">
              <thead>
                <tr>
                  <th>Article Title & Summary</th>
                  <th>Subject / Topic</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <div className="article-row-title">{article.title}</div>
                      <div className="article-row-summary">
                        {article.summary || 'No summary provided.'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                        {article.subject?.title || 'Unassigned Subject'}
                      </div>
                      {article.topic?.title ? (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {article.topic.title}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${article.status === 'PUBLISHED' ? 'published' : 'draft'
                          }`}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {new Date(article.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => onEditArticle(article.id)}
                        >
                          Edit
                        </button>
                        {user?.role === 'ADMIN' ? (
                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => handleDelete(article.id, article.title)}
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

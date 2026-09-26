import React, { useState, useEffect } from 'react';
import { ArticlesApiClient } from '../../../src/client/api/articles.api';
import { getAccessToken } from '../auth/auth-storage';
import type { ArticleStatus } from '../../../src/client/types/article.types';
import './ArticleEditor.css';

export interface ArticleEditorProps {
  articleId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  articleId,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = Boolean(articleId);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('DRAFT');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If in edit mode, fetch article details
  useEffect(() => {
    if (!articleId) return;

    async function fetchArticleDetails() {
      setLoading(true);
      const token = getAccessToken() || undefined;

      try {
        const article = await ArticlesApiClient.getArticleById(articleId!, token);
        setTitle(article.title || '');
        setSummary(article.summary || '');
        setContent(article.content || '');
        setFeaturedImageUrl(article.featuredImageUrl || '');
        setStatus(article.status || 'DRAFT');
      } catch (err: any) {
        setError(err?.message || 'Failed to load article for editing.');
      } finally {
        setLoading(false);
      }
    }

    fetchArticleDetails();
  }, [articleId]);

  const handleSubmit = async (targetStatus?: ArticleStatus) => {
    setError(null);

    if (!title.trim()) {
      setError('Article Title is required.');
      return;
    }

    if (!content.trim()) {
      setError('Article Content is required.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Authentication required. Please log in as a Medical Reviewer.');
      return;
    }

    setSubmitting(true);
    const finalStatus = targetStatus || status;

    try {
      if (isEditMode && articleId) {
        await ArticlesApiClient.updateArticle(
          articleId,
          {
            title: title.trim(),
            summary: summary.trim() || undefined,
            content: content.trim(),
            featuredImageUrl: featuredImageUrl.trim() || undefined,
            status: finalStatus,
          },
          token,
        );
      } else {
        await ArticlesApiClient.createArticle(
          {
            title: title.trim(),
            summary: summary.trim() || undefined,
            content: content.trim(),
            featuredImageUrl: featuredImageUrl.trim() || undefined,
            status: finalStatus,
          },
          token,
        );
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to save article. Please check your inputs and permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="article-editor-container">
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          Loading Article Data...
        </div>
      </div>
    );
  }

  return (
    <div className="article-editor-container">
      {/* EDITOR HEADER */}
      <div className="editor-header">
        <div className="editor-title-group">
          <h1 className="editor-title">
            {isEditMode ? 'Edit Medical Article' : 'Create New Clinical Article'}
          </h1>
          <p className="editor-subtitle">
            {isEditMode
              ? 'Update clinical content, subject classification, and publication status.'
              : 'Author and submit peer-reviewed clinical articles, anatomical guides, or literature.'}
          </p>
        </div>

        <button type="button" className="btn-back-link" onClick={onCancel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* ERROR BANNER */}
      {error ? <div className="editor-error-banner">{error}</div> : null}

      {/* EDITOR FORM */}
      <div className="editor-form-card">
        {/* TITLE */}
        <div className="form-field">
          <label className="field-label">
            Article Title <span className="field-required">*</span>
          </label>
          <input
            type="text"
            className="field-input"
            placeholder="e.g., Upper Limb Brachial Plexus Anatomy & Clinical Correlates"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* SUMMARY */}
        <div className="form-field">
          <label className="field-label">Executive Summary</label>
          <input
            type="text"
            className="field-input"
            placeholder="Brief high-level summary for medical students and reviewers..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        {/* CONTENT */}
        <div className="form-field">
          <label className="field-label">
            Full Clinical Content <span className="field-required">*</span>
          </label>
          <textarea
            className="field-textarea"
            placeholder="Detailed clinical text, anatomy, physiological mechanisms, or diagnosis pathways..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* IMAGE URL & STATUS ROW */}
        <div className="form-group-row">
          <div className="form-field">
            <label className="field-label">Featured Image URL (Optional)</label>
            <input
              type="url"
              className="field-input"
              placeholder="https://example.com/medical-diagram.jpg"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label">Publication Status</label>
            <select
              className="field-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as ArticleStatus)}
            >
              <option value="DRAFT">Draft (Reviewer Workspace only)</option>
              <option value="PUBLISHED">Published (Visible to all Students)</option>
            </select>
          </div>
        </div>

        {/* ACTIONS BAR */}
        <div className="editor-actions-bar">
          <button type="button" className="btn-editor-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-editor-save-draft"
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            className="btn-editor-publish"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={submitting}
          >
            {submitting ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </div>
    </div>
  );
};

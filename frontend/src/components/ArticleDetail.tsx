import React, { useState, useEffect, useCallback } from 'react';
import { ArticlesApiClient } from '../../../src/client/api/articles.api';
import type { Article } from '../../../src/client/types/article.types';
import {
  formatDate,
  getAuthorDisplayName,
  parsePlainTextParagraphs,
} from './article-utils';
import './ArticleDetail.css';

export interface ArticleDetailProps {
  slug: string;
  onBack: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ slug, onBack }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(async () => {
    if (!slug) {
      setError('Article slug is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedArticle = await ArticlesApiClient.getArticleBySlug(slug);
      if (!fetchedArticle) {
        setError('Article not found.');
      } else {
        setArticle(fetchedArticle);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to load article. The article may not exist or has been removed.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const authorName = article ? getAuthorDisplayName(article) : '';
  const formattedDate = article ? formatDate(article.publishedAt || article.createdAt) : '';
  const contentParagraphs = article ? parsePlainTextParagraphs(article.content) : [];

  const wordCount = (article?.content || '').trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(2, Math.ceil(wordCount / 200));

  return (
    <div className="medcore-reader-wrapper">
      <article className="medcore-article-detail-container">
        {/* Breadcrumb Navigation & Top Action Bar */}
        <div className="article-detail-topbar">
          <nav className="article-breadcrumbs" aria-label="Breadcrumbs">
            <button type="button" className="breadcrumb-link" onClick={onBack}>
              Clinical Library
            </button>
            <span className="breadcrumb-separator">›</span>
            {article?.subject ? (
              <>
                <span className="breadcrumb-subject">{article.subject.title}</span>
                <span className="breadcrumb-separator">›</span>
              </>
            ) : null}
            <span className="breadcrumb-current">
              {article ? article.title : 'Loading article...'}
            </span>
          </nav>

          <button
            type="button"
            className="btn btn-secondary back-btn"
            onClick={onBack}
            data-testid="back-button"
          >
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Articles
          </button>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="article-detail-skeleton" data-testid="detail-loading-state">
            <div className="skeleton-main-title" />
            <div className="skeleton-meta-row" />
            <div className="skeleton-hero-image" />
            <div className="skeleton-paragraph" />
            <div className="skeleton-paragraph" />
            <div className="skeleton-paragraph short" />
          </div>
        ) : null}

        {/* ERROR / NOT FOUND STATE */}
        {error && !loading ? (
          <div className="state-card error-state" data-testid="detail-error-state">
            <div className="error-icon-wrapper">
              <svg
                className="error-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="error-title">Article Not Found</h3>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button
                type="button"
                className="btn btn-primary retry-btn"
                onClick={fetchArticle}
                data-testid="detail-retry-button"
              >
                <svg
                  className="btn-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Try Again
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onBack}
              >
                Return to Article List
              </button>
            </div>
          </div>
        ) : null}

        {/* ARTICLE CONTENT DISPLAY */}
        {!loading && !error && article ? (
          <div className="article-detail-content" data-testid="article-detail-body">
            {/* Header Metadata */}
            <header className="article-header">
              <div className="article-badges-row">
                <span className="reader-specialty-badge">
                  {article.subject?.title || 'Clinical Anatomy'}
                </span>
                {article.topic?.title ? (
                  <span className="reader-topic-badge">{article.topic.title}</span>
                ) : null}
                <span className="reader-verified-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Peer-Reviewed Clinical Guide
                </span>
              </div>

              <h1 className="article-title">{article.title}</h1>

              <div className="article-author-card">
                <div className="author-card-left">
                  {article.author?.avatarUrl ? (
                    <img
                      src={article.author.avatarUrl}
                      alt={authorName}
                      className="author-avatar-img"
                    />
                  ) : (
                    <div className="author-avatar-fallback">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="author-details">
                    <span className="author-name">{authorName}</span>
                    <span className="author-title-sub">Medical Reviewer · MedCore Clinical Board</span>
                  </div>
                </div>

                <div className="article-meta-right">
                  <span className="published-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formattedDate}
                  </span>
                  <span className="read-time-pill">
                    ⏱️ {readTimeMinutes} min read
                  </span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {article.featuredImageUrl ? (
              <div className="article-featured-image-wrapper">
                <img
                  src={article.featuredImageUrl}
                  alt={article.title}
                  className="article-featured-image"
                />
              </div>
            ) : null}

            {/* Summary / Clinical Takeaway Box */}
            {article.summary ? (
              <div className="article-summary-lead">
                <div className="summary-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <strong>Clinical Overview &amp; Key Takeaways</strong>
                </div>
                <p className="summary-text">{article.summary}</p>
              </div>
            ) : null}

            {/* Body Content */}
            <div className="article-body-text">
              {contentParagraphs.length > 0 ? (
                contentParagraphs.map((paragraph, index) => (
                  <p key={index} className="article-paragraph">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="article-paragraph">{article.content}</p>
              )}
            </div>

            {/* Clinical Review Verification Callout Box */}
            <div className="clinical-verification-footer">
              <div className="verification-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className="verification-copy">
                <h4>Peer-Reviewed Medical Accuracy</h4>
                <p>
                  This article has been prepared and reviewed in accordance with MedCore clinical editorial standards. Content is intended for educational purposes and medical student preparation.
                </p>
              </div>
            </div>

            {/* Return action button */}
            <div className="article-bottom-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onBack}
              >
                ← Return to All Articles
              </button>
            </div>
          </div>
        ) : null}
      </article>
    </div>
  );
};

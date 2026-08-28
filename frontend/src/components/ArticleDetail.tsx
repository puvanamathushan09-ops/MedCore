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

  return (
    <article className="medcore-article-detail-container">
      {/* Top Action Bar */}
      <div className="article-detail-topbar">
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
          <div className="skeleton-badge-group">
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
          </div>
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
            <div className="article-badges">
              {article.subject ? (
                <span className="badge subject-badge">{article.subject.title}</span>
              ) : null}
              {article.topic ? (
                <span className="badge topic-badge">{article.topic.title}</span>
              ) : null}
            </div>

            <h1 className="article-title">{article.title}</h1>

            <div className="article-author-card">
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
                <span className="published-date">Published on {formattedDate}</span>
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

          {/* Summary / Lead Quote */}
          {article.summary ? (
            <div className="article-summary-lead">
              <p className="summary-text">{article.summary}</p>
            </div>
          ) : null}

          {/* Body Content (Rendered safely as plain text paragraphs) */}
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
        </div>
      ) : null}
    </article>
  );
};

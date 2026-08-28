import React from 'react';
import type { Article } from '../../../src/client/types/article.types';
import { formatDate, getAuthorDisplayName } from './article-utils';

export interface ArticleCardProps {
  article: Article;
  onArticleClick?: (article: Article) => void;
}

export { formatDate, getAuthorDisplayName };

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onArticleClick }) => {
  const authorName = getAuthorDisplayName(article);
  const formattedDate = formatDate(article.publishedAt || article.createdAt);

  const handleClick = () => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  return (
    <article
      className="medcore-article-card"
      onClick={handleClick}
      data-testid={`article-card-${article.id}`}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {article.featuredImageUrl ? (
        <div className="card-image-container">
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="card-featured-image"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="card-content">
        <div className="card-badges">
          {article.subject ? (
            <span className="badge subject-badge">{article.subject.title}</span>
          ) : null}
          {article.topic ? (
            <span className="badge topic-badge">{article.topic.title}</span>
          ) : null}
        </div>

        <h3 className="card-title">{article.title}</h3>

        {article.summary ? <p className="card-summary">{article.summary}</p> : null}

        <div className="card-meta">
          <span className="card-author">
            <svg
              className="meta-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {authorName}
          </span>
          <span className="card-date">
            <svg
              className="meta-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formattedDate}
          </span>
        </div>
      </div>
    </article>
  );
};

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

  // Calculate estimated reading time (approx 200 words per minute)
  const wordCount = (article.content || '').trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(2, Math.ceil(wordCount / 200));

  const subjectTitle = article.subject?.title || 'Clinical Medicine';
  const topicTitle = article.topic?.title;

  const handleClick = () => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  // Determine specialty theme icon and accent
  const isCardio = /heart|cardio|valve|vascular/i.test(article.title + ' ' + (article.summary || ''));
  const isNeuro = /plexus|nerve|brain|neuro/i.test(article.title + ' ' + (article.summary || ''));
  const isThorax = /thorax|rib|lung|respirat/i.test(article.title + ' ' + (article.summary || ''));

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
      {/* Featured visual banner or specialty clinical illustration */}
      {article.featuredImageUrl ? (
        <div className="card-image-container">
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="card-featured-image"
            loading="lazy"
          />
          <span className="card-read-badge">{readTimeMinutes} min read</span>
        </div>
      ) : (
        <div className={`card-visual-banner ${isCardio ? 'banner-cardio' : isNeuro ? 'banner-neuro' : isThorax ? 'banner-thorax' : 'banner-general'}`}>
          <div className="banner-top-row">
            <span className="specialty-pill">{subjectTitle}</span>
            <span className="card-read-badge">{readTimeMinutes} min read</span>
          </div>
          <div className="banner-illustration">
            {isCardio ? (
              <svg className="banner-icon pulse-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            ) : isNeuro ? (
              <svg className="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2a4 4 0 0 0-4 4c0 1.1.45 2.1 1.17 2.83L6.5 11.5a3.5 3.5 0 0 0 0 5l4.5 4.5 4.5-4.5a3.5 3.5 0 0 0 0-5l-2.67-2.67C13.55 8.1 14 7.1 14 6a4 4 0 0 0-4-4z" />
                <path d="M9 14l3-3 3 3" />
              </svg>
            ) : isThorax ? (
              <svg className="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3v18M7 7h10M6 12h12M7 17h10" />
              </svg>
            ) : (
              <svg className="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            )}
          </div>
          {topicTitle ? <div className="banner-subtag">{topicTitle}</div> : null}
        </div>
      )}

      <div className="card-content">
        <div className="card-tags-row">
          <span className="clinical-verified-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Peer-Reviewed
          </span>
          {topicTitle && article.featuredImageUrl ? (
            <span className="card-topic-tag">{topicTitle}</span>
          ) : null}
        </div>

        <h3 className="card-title">{article.title}</h3>

        {article.summary ? <p className="card-summary">{article.summary}</p> : null}

        <div className="card-footer-meta">
          <div className="card-author-info">
            <div className="author-avatar-sm" title={authorName}>
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div className="author-details">
              <span className="author-name-text">{authorName}</span>
              <span className="author-role-subtext">Medical Reviewer</span>
            </div>
          </div>

          <div className="card-date-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formattedDate}
          </div>
        </div>

        <div className="card-read-action">
          <span>Read Clinical Guide</span>
          <svg className="arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </article>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { ArticlesApiClient } from '../../../src/client/api/articles.api';
import type { Article } from '../../../src/client/types/article.types';
import { ArticleCard } from './ArticleCard';
import { ArticleFilter } from './ArticleFilter';
import { buildQueryArticleParams } from './article-utils';
import './ArticleList.css';

export interface ArticleListProps {
  onArticleClick?: (article: Article) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({ onArticleClick }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = buildQueryArticleParams(search, page, 12);
      const response = await ArticlesApiClient.getArticles(params);
      setArticles(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalCount(response.meta?.total || 0);
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to load articles. Please check your network connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchArticles]);

  const handleResetFilters = () => {
    setSearch('');
    setPage(1);
  };

  const handleCardClick = (article: Article) => {
    console.log('Article clicked:', article.id, article.title);
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  return (
    <section className="medcore-article-list-container">
      <div className="article-list-header">
        <h2 className="article-list-title">Medical Articles</h2>
        <p className="article-list-subtitle">
          Explore peer-reviewed articles, clinical guides, and medical insights.
        </p>
      </div>

      <ArticleFilter
        search={search}
        onSearchChange={setSearch}
        onResetFilters={handleResetFilters}
      />

      {/* ERROR STATE */}
      {error && !loading ? (
        <div className="state-card error-state" data-testid="error-state">
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
          <h3 className="error-title">Unable to Load Articles</h3>
          <p className="error-message">{error}</p>
          <button
            type="button"
            className="btn btn-primary retry-btn"
            onClick={fetchArticles}
            data-testid="retry-button"
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
            Retry
          </button>
        </div>
      ) : null}

      {/* LOADING STATE */}
      {loading ? (
        <div className="article-grid-skeleton" data-testid="loading-state">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-card">
              <div className="skeleton-image" />
              <div className="skeleton-body">
                <div className="skeleton-title" />
                <div className="skeleton-text" />
                <div className="skeleton-text short" />
                <div className="skeleton-meta" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* EMPTY STATE */}
      {!loading && !error && articles.length === 0 ? (
        <div className="state-card empty-state" data-testid="empty-state">
          <div className="empty-icon-wrapper">
            <svg
              className="empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="empty-title">No Articles Found</h3>
          <p className="empty-message">
            {search
              ? 'No articles matched your search criteria. Try clearing the search.'
              : 'There are currently no published articles available.'}
          </p>
          {search ? (
            <button
              type="button"
              className="btn btn-secondary reset-btn"
              onClick={handleResetFilters}
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : null}

      {/* SUCCESS STATE / ARTICLE GRID */}
      {!loading && !error && articles.length > 0 ? (
        <>
          <div className="results-info">
            Showing {articles.length} of {totalCount} articles
          </div>

          <div className="article-grid" data-testid="article-grid">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onArticleClick={handleCardClick}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="pagination-bar">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
};

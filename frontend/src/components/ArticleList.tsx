import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArticlesApiClient } from '../../../src/client/api/articles.api';
import { SubjectsApiClient } from '../../../src/client/api/subjects.api';
import type { Article } from '../../../src/client/types/article.types';
import type { Subject } from '../../../src/client/types/subject.types';
import { ArticleCard } from './ArticleCard';
import { ArticleFilter } from './ArticleFilter';
import { buildQueryArticleParams } from './article-utils';
import './ArticleList.css';

export interface ArticleListProps {
  onArticleClick?: (article: Article) => void;
  onSelectSubject?: (subjectSlug: string) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({ onArticleClick, onSelectSubject }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch subjects once for the category pills
  useEffect(() => {
    let isMounted = true;
    SubjectsApiClient.getSubjects()
      .then((res) => {
        if (isMounted && res.data) {
          setSubjects(res.data);
        }
      })
      .catch((err) => {
        console.warn('Could not load subject filters', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
    setSelectedSubjectSlug('all');
    setPage(1);
  };

  const handleCardClick = (article: Article) => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  // Client-side filtering & sorting for smooth UX
  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Filter by subject if not 'all'
    if (selectedSubjectSlug !== 'all') {
      result = result.filter(
        (art) =>
          art.subject?.slug?.toLowerCase() === selectedSubjectSlug.toLowerCase() ||
          art.subjectId === selectedSubjectSlug,
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      if (sortBy === 'oldest') {
        return dateA - dateB;
      }
      return dateB - dateA;
    });

    return result;
  }, [articles, selectedSubjectSlug, sortBy]);

  // Featured article (first published article when viewing page 1 with no search filter)
  const featuredArticle = useMemo(() => {
    if (page === 1 && !search && selectedSubjectSlug === 'all' && filteredArticles.length > 0) {
      return filteredArticles[0];
    }
    return null;
  }, [page, search, selectedSubjectSlug, filteredArticles]);

  const gridArticles = useMemo(() => {
    if (featuredArticle) {
      return filteredArticles.slice(1);
    }
    return filteredArticles;
  }, [featuredArticle, filteredArticles]);

  const handleSelectSubject = (slug: string) => {
    setSelectedSubjectSlug(slug);
    setPage(1);
    if (onSelectSubject && slug !== 'all') {
      // Optional callback if parent wants to track subject changes
    }
  };

  return (
    <div className="medcore-public-wrapper">
      {/* HERO SECTION WITH CLINICAL VISUAL */}
      <section className="public-hero-section">
        <div
          className="public-hero-bg-image"
          style={{ backgroundImage: "url('/images/medical-hero-1.jpg')" }}
        />
        <div className="public-hero-scenic-overlay" />
        <div className="public-hero-wave-bg">
          <svg className="public-organic-wave" viewBox="0 0 1440 180" fill="none" preserveAspectRatio="none">
            <path
              d="M0,80 C320,160 540,20 900,100 C1200,160 1360,60 1440,110 L1440,180 L0,180 Z"
              fill="#fafaf7"
            />
          </svg>
        </div>

        <div className="public-hero-container">
          <div className="public-hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>Peer-Reviewed Medical Knowledge · Open Clinical Access</span>
          </div>

          <h1 className="public-hero-title">
            Authoritative Medical Guides &amp; Clinical Insights
          </h1>

          <p className="public-hero-subtitle">
            Explore clear, evidence-based clinical articles, surgical anatomy, and high-yield pathology correlations authored and reviewed by certified medical professionals.
          </p>

          {/* Quick Metrics Strip */}
          <div className="public-metrics-strip">
            <div className="metric-item">
              <span className="metric-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </span>
              <div className="metric-text">
                <strong>100% Peer-Reviewed</strong>
                <span>Clinically validated</span>
              </div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
              <div className="metric-text">
                <strong>{totalCount || 11}+ Published Guides</strong>
                <span>Continually updated</span>
              </div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <div className="metric-text">
                <strong>Open Access</strong>
                <span>Free for all learners</span>
              </div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </span>
              <div className="metric-text">
                <strong>Clinical Correlates</strong>
                <span>USMLE &amp; Ward ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <section className="medcore-article-list-container">
        {/* Search & Filter Component */}
        <div className="public-controls-card">
          <ArticleFilter
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            onResetFilters={handleResetFilters}
          />

          {/* Specialty Category Pills */}
          <div className="specialty-pills-scroll">
            <button
              type="button"
              className={`specialty-pill-btn ${selectedSubjectSlug === 'all' ? 'active' : ''}`}
              onClick={() => handleSelectSubject('all')}
            >
              All Articles
              <span className="pill-count">{totalCount || articles.length}</span>
            </button>

            {subjects.map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`specialty-pill-btn ${selectedSubjectSlug === sub.slug ? 'active' : ''}`}
                onClick={() => handleSelectSubject(sub.slug)}
              >
                {sub.title}
              </button>
            ))}
          </div>
        </div>

        {/* ERROR STATE */}
        {error && !loading ? (
          <div className="state-card error-state" data-testid="error-state">
            <div className="error-icon-wrapper">
              <svg
                className="error-icon"
                width="48"
                height="48"
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
                width="16"
                height="16"
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
        {!loading && !error && filteredArticles.length === 0 ? (
          <div className="state-card empty-state" data-testid="empty-state">
            <div className="empty-icon-wrapper">
              <svg
                className="empty-icon"
                width="48"
                height="48"
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
              {search || selectedSubjectSlug !== 'all'
                ? 'No articles matched your selected filters. Try clearing your search.'
                : 'There are currently no published articles available.'}
            </p>
            <button
              type="button"
              className="btn btn-secondary reset-btn"
              onClick={handleResetFilters}
            >
              Clear All Filters
            </button>
          </div>
        ) : null}

        {/* SUCCESS STATE */}
        {!loading && !error && filteredArticles.length > 0 ? (
          <>
            {/* FEATURED EDITORIAL SPOTLIGHT */}
            {featuredArticle ? (
              <div
                className="featured-spotlight-card"
                onClick={() => handleCardClick(featuredArticle)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(featuredArticle);
                  }
                }}
              >
                <div className="featured-banner-visual">
                  <div className="featured-badge-tag">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#ea580c">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>Featured Clinical Guide</span>
                  </div>
                  <div className="featured-art-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <span className="featured-specialty-tag">
                    {featuredArticle.subject?.title || 'Clinical Medicine'}
                  </span>
                </div>

                <div className="featured-details">
                  <div className="featured-meta-top">
                    <span className="clinical-badge-green">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Verified Peer Review
                    </span>
                    <span className="featured-read-time">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {Math.max(2, Math.ceil(((featuredArticle.content || '').split(/\s+/).length) / 200))} min read
                    </span>
                  </div>

                  <h2 className="featured-title">{featuredArticle.title}</h2>

                  {featuredArticle.summary ? (
                    <p className="featured-summary">{featuredArticle.summary}</p>
                  ) : null}

                  <div className="featured-footer-row">
                    <div className="featured-author-box">
                      <div className="author-avatar-md">
                        {(featuredArticle.author?.firstName || 'M')[0].toUpperCase()}
                      </div>
                      <div className="author-copy">
                        <span className="author-name">
                          {featuredArticle.author
                            ? `${featuredArticle.author.firstName} ${featuredArticle.author.lastName}`
                            : 'Medical Review Board'}
                        </span>
                        <span className="author-credential">Certified Clinical Reviewer</span>
                      </div>
                    </div>

                    <button type="button" className="btn-read-featured">
                      Read Complete Guide
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* BAR SHOWING RESULTS COUNT & SORTING */}
            <div className="results-toolbar">
              <div className="results-info">
                Showing <strong>{filteredArticles.length}</strong> {filteredArticles.length === 1 ? 'article' : 'articles'}
                {selectedSubjectSlug !== 'all' ? ` in ${selectedSubjectSlug}` : ''}
              </div>

              <div className="sort-dropdown-wrapper">
                <label htmlFor="article-sort-select" className="sort-label">Sort by:</label>
                <select
                  id="article-sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* ARTICLE GRID */}
            <div className="article-grid" data-testid="article-grid">
              {gridArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onArticleClick={handleCardClick}
                />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 ? (
              <div className="pagination-bar">
                <button
                  type="button"
                  className="btn btn-secondary pagination-btn"
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
                  className="btn btn-secondary pagination-btn"
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
    </div>
  );
};

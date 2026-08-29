import React, { useState, useEffect, useCallback } from 'react';
import { SubjectsApiClient } from '../../../src/client/api/subjects.api';
import { TopicsApiClient } from '../../../src/client/api/topics.api';
import { ArticlesApiClient } from '../../../src/client/api/articles.api';
import type { Subject } from '../../../src/client/types/subject.types';
import type { Topic } from '../../../src/client/types/topic.types';
import type { Article } from '../../../src/client/types/article.types';
import { ArticleCard } from './ArticleCard';
import './SubjectDetail.css';

export interface SubjectDetailProps {
  subjectSlug: string;
  topicSlug?: string;
  onSelectTopic: (subjectSlug: string, topicSlug: string | null) => void;
  onArticleClick: (article: Article) => void;
  onBackToSubjects: () => void;
}

export const SubjectDetail: React.FC<SubjectDetailProps> = ({
  subjectSlug,
  topicSlug,
  onSelectTopic,
  onArticleClick,
  onBackToSubjects,
}) => {
  // Subject & Topics State
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingSubject, setLoadingSubject] = useState<boolean>(true);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  // Articles & Pagination State
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState<boolean>(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Active selected topic object
  const activeTopic = topics.find((t) => t.slug === topicSlug) || null;

  // Load Subject details
  const fetchSubjectData = useCallback(async () => {
    setLoadingSubject(true);
    setSubjectError(null);

    try {
      const fetchedSubject = await SubjectsApiClient.getSubjectBySlug(subjectSlug);
      if (!fetchedSubject) {
        setSubjectError('Subject not found.');
      } else {
        setSubject(fetchedSubject);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to load subject. Please check your network connection.';
      setSubjectError(errorMessage);
    } finally {
      setLoadingSubject(false);
    }
  }, [subjectSlug]);

  useEffect(() => {
    fetchSubjectData();
  }, [fetchSubjectData]);

  // Load Topics when subject is loaded
  const fetchTopicsData = useCallback(async () => {
    if (!subject) return;

    setLoadingTopics(true);
    try {
      const res = await TopicsApiClient.getTopics({ subjectId: subject.id, limit: 100 });
      setTopics(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch topics:', err);
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  }, [subject]);

  useEffect(() => {
    if (subject) {
      fetchTopicsData();
    }
  }, [subject, fetchTopicsData]);

  // Reset page to 1 whenever active topic changes
  useEffect(() => {
    setPage(1);
  }, [topicSlug]);

  // Fetch articles for current subject + active topic
  const fetchArticlesData = useCallback(async () => {
    if (!subject) return;

    setLoadingArticles(true);
    setArticlesError(null);

    try {
      const params = {
        subjectId: subject.id,
        topicId: activeTopic ? activeTopic.id : undefined,
        page,
        limit: 12,
      };

      const res = await ArticlesApiClient.getArticles(params);
      setArticles(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to load articles for this topic. Please try again.';
      setArticlesError(errorMessage);
    } finally {
      setLoadingArticles(false);
    }
  }, [subject, activeTopic, page]);

  useEffect(() => {
    if (subject) {
      fetchArticlesData();
    }
  }, [subject, fetchArticlesData]);

  // Handle retry
  const handleRetryAll = () => {
    fetchSubjectData();
  };

  return (
    <section className="medcore-subject-detail-container">
      {/* Top Breadcrumb Navigation */}
      <nav className="subject-breadcrumb-nav" aria-label="Breadcrumb">
        <button
          type="button"
          className="breadcrumb-link-btn"
          onClick={onBackToSubjects}
          data-testid="back-to-subjects-btn"
        >
          Subjects
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {subject ? subject.title : subjectSlug}
        </span>
        {activeTopic ? (
          <>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current active">{activeTopic.title}</span>
          </>
        ) : null}
      </nav>

      {/* SUBJECT LOADING STATE */}
      {loadingSubject ? (
        <div className="subject-detail-skeleton" data-testid="subject-detail-loading">
          <div className="skeleton-subject-header" />
          <div className="skeleton-subject-sub" />
          <div className="skeleton-topics-bar" />
        </div>
      ) : null}

      {/* SUBJECT ERROR STATE */}
      {subjectError && !loadingSubject ? (
        <div className="state-card error-state" data-testid="subject-detail-error">
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
          <h3 className="error-title">Subject Not Found</h3>
          <p className="error-message">{subjectError}</p>
          <div className="error-actions">
            <button
              type="button"
              className="btn btn-primary retry-btn"
              onClick={handleRetryAll}
            >
              Retry
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBackToSubjects}
            >
              Return to Subjects
            </button>
          </div>
        </div>
      ) : null}

      {/* SUBJECT CONTENT */}
      {!loadingSubject && !subjectError && subject ? (
        <>
          <header className="subject-detail-header">
            <div className="subject-detail-badge">Medical Subject</div>
            <h1 className="subject-detail-title">{subject.title}</h1>
            <p className="subject-detail-description">
              {subject.description ||
                `Comprehensive medical guides, articles, and clinical resources for ${subject.title}.`}
            </p>
          </header>

          {/* TOPICS BAR / SELECTOR */}
          <div className="topics-section">
            <div className="topics-section-header">
              <h2 className="topics-section-title">Topics in {subject.title}</h2>
              {loadingTopics ? <span className="topics-loading-tag">Loading topics...</span> : null}
            </div>

            {!loadingTopics && topics.length === 0 ? (
              <p className="no-topics-notice">No topics created under this subject yet.</p>
            ) : (
              <div className="topics-pill-list" data-testid="topics-pill-list">
                <button
                  type="button"
                  className={`topic-pill ${!topicSlug ? 'active' : ''}`}
                  onClick={() => onSelectTopic(subject.slug, null)}
                  data-testid="all-topics-pill"
                >
                  All Topics ({topics.length})
                </button>

                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`topic-pill ${topicSlug === t.slug ? 'active' : ''}`}
                    onClick={() => onSelectTopic(subject.slug, t.slug)}
                    data-testid={`topic-pill-${t.slug}`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ARTICLES SECTION FOR SELECTED SUBJECT/TOPIC */}
          <div className="topic-articles-section">
            <div className="articles-section-header">
              <h3 className="articles-section-title">
                {activeTopic ? `Articles in ${activeTopic.title}` : `All Articles in ${subject.title}`}
              </h3>
              {!loadingArticles && !articlesError ? (
                <span className="results-count">
                  Showing {articles.length} of {totalCount} articles
                </span>
              ) : null}
            </div>

            {/* ARTICLES ERROR STATE */}
            {articlesError && !loadingArticles ? (
              <div className="state-card error-state">
                <p className="error-message">{articlesError}</p>
                <button
                  type="button"
                  className="btn btn-secondary retry-btn"
                  onClick={fetchArticlesData}
                >
                  Retry Loading Articles
                </button>
              </div>
            ) : null}

            {/* ARTICLES LOADING STATE */}
            {loadingArticles ? (
              <div className="article-grid-skeleton" data-testid="articles-loading-state">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="skeleton-card">
                    <div className="skeleton-image" />
                    <div className="skeleton-body">
                      <div className="skeleton-badge" />
                      <div className="skeleton-title" />
                      <div className="skeleton-text" />
                      <div className="skeleton-meta" />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* ARTICLES EMPTY STATE */}
            {!loadingArticles && !articlesError && articles.length === 0 ? (
              <div className="state-card empty-state" data-testid="topic-empty-articles">
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
                  {activeTopic
                    ? `There are currently no published articles under topic "${activeTopic.title}".`
                    : `There are currently no published articles under ${subject.title}.`}
                </p>
                {activeTopic ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onSelectTopic(subject.slug, null)}
                  >
                    View All Topics in {subject.title}
                  </button>
                ) : null}
              </div>
            ) : null}

            {/* ARTICLES GRID */}
            {!loadingArticles && !articlesError && articles.length > 0 ? (
              <>
                <div className="article-grid" data-testid="topic-article-grid">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onArticleClick={onArticleClick}
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
          </div>
        </>
      ) : null}
    </section>
  );
};

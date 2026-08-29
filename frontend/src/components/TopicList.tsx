import React, { useState, useEffect, useCallback } from 'react';
import { TopicsApiClient } from '../../../src/client/api/topics.api';
import { SubjectsApiClient } from '../../../src/client/api/subjects.api';
import type { Topic } from '../../../src/client/types/topic.types';
import type { Subject } from '../../../src/client/types/subject.types';
import './TopicList.css';

export interface TopicListProps {
  onSelectTopic: (subjectSlug: string, topicSlug: string) => void;
}

export const TopicList: React.FC<TopicListProps> = ({ onSelectTopic }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjectsMap, setSubjectsMap] = useState<Record<string, Subject>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopicsAndSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [topicsRes, subjectsRes] = await Promise.all([
        TopicsApiClient.getTopics({ limit: 100 }),
        SubjectsApiClient.getSubjects({ limit: 100 }),
      ]);

      const map: Record<string, Subject> = {};
      (subjectsRes.data || []).forEach((s) => {
        map[s.id] = s;
      });

      setSubjectsMap(map);
      setTopics(topicsRes.data || []);
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to load medical topics. Please check your network connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopicsAndSubjects();
  }, [fetchTopicsAndSubjects]);

  const handleCardClick = (topic: Topic) => {
    const subject = subjectsMap[topic.subjectId] || topic.subject;
    const subjectSlug = subject ? subject.slug : 'anatomy';
    onSelectTopic(subjectSlug, topic.slug);
  };

  return (
    <section className="medcore-topic-list-container">
      <div className="topic-list-header">
        <h2 className="topic-list-title">Medical Topics</h2>
        <p className="topic-list-subtitle">
          Browse clinical and anatomical topics across all medical subjects.
        </p>
      </div>

      {/* ERROR STATE */}
      {error && !loading ? (
        <div className="state-card error-state" data-testid="topic-error-state">
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
          <h3 className="error-title">Unable to Load Topics</h3>
          <p className="error-message">{error}</p>
          <button
            type="button"
            className="btn btn-primary retry-btn"
            onClick={fetchTopicsAndSubjects}
            data-testid="retry-topics-button"
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
        <div className="topic-grid-skeleton" data-testid="topic-loading-state">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-topic-card">
              <div className="skeleton-badge" />
              <div className="skeleton-title" />
              <div className="skeleton-text" />
              <div className="skeleton-meta" />
            </div>
          ))}
        </div>
      ) : null}

      {/* EMPTY STATE */}
      {!loading && !error && topics.length === 0 ? (
        <div className="state-card empty-state" data-testid="topic-empty-state">
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
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <h3 className="empty-title">No Topics Found</h3>
          <p className="empty-message">There are currently no topics created in the system.</p>
        </div>
      ) : null}

      {/* TOPICS GRID */}
      {!loading && !error && topics.length > 0 ? (
        <div className="topic-grid" data-testid="topic-grid">
          {topics.map((topic) => {
            const subject = subjectsMap[topic.subjectId] || topic.subject;
            const subjectTitle = subject ? subject.title : 'General';

            return (
              <div
                key={topic.id}
                className="medcore-topic-card"
                onClick={() => handleCardClick(topic)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(topic);
                  }
                }}
                data-testid={`topic-card-${topic.id}`}
              >
                <div className="topic-card-header">
                  <span className="badge subject-badge">{subjectTitle}</span>
                </div>

                <h3 className="topic-card-title">{topic.title}</h3>

                <p className="topic-card-description">
                  {topic.description ||
                    `Explore peer-reviewed medical articles and clinical insights under ${topic.title}.`}
                </p>

                <div className="topic-card-footer">
                  <span className="topic-article-count">
                    <svg
                      className="meta-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {topic._count?.articles !== undefined
                      ? `${topic._count.articles} ${topic._count.articles === 1 ? 'Article' : 'Articles'}`
                      : 'View Articles'}
                  </span>
                  <span className="topic-view-link">
                    View Articles
                    <svg
                      className="arrow-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

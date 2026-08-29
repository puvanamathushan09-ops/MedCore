import React, { useState, useEffect, useCallback } from 'react';
import { SubjectsApiClient } from '../../../src/client/api/subjects.api';
import type { Subject } from '../../../src/client/types/subject.types';
import './SubjectList.css';

export interface SubjectListProps {
  onSelectSubject: (subject: Subject) => void;
}

export const SubjectList: React.FC<SubjectListProps> = ({ onSelectSubject }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await SubjectsApiClient.getSubjects({ limit: 100 });
      setSubjects(response.data || []);
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to load medical subjects. Please check your network connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return (
    <section className="medcore-subject-list-container">
      <div className="subject-list-header">
        <h2 className="subject-list-title">Medical Subjects</h2>
        <p className="subject-list-subtitle">
          Select a subject to explore core medical topics, peer-reviewed articles, and clinical guides.
        </p>
      </div>

      {/* ERROR STATE */}
      {error && !loading ? (
        <div className="state-card error-state" data-testid="subject-error-state">
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
          <h3 className="error-title">Unable to Load Subjects</h3>
          <p className="error-message">{error}</p>
          <button
            type="button"
            className="btn btn-primary retry-btn"
            onClick={fetchSubjects}
            data-testid="retry-subjects-button"
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
        <div className="subject-grid-skeleton" data-testid="subject-loading-state">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-subject-card">
              <div className="skeleton-subject-icon" />
              <div className="skeleton-subject-body">
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
      {!loading && !error && subjects.length === 0 ? (
        <div className="state-card empty-state" data-testid="subject-empty-state">
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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h3 className="empty-title">No Subjects Found</h3>
          <p className="empty-message">There are currently no medical subjects available in the platform.</p>
        </div>
      ) : null}

      {/* SUBJECT GRID */}
      {!loading && !error && subjects.length > 0 ? (
        <div className="subject-grid" data-testid="subject-grid">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="medcore-subject-card"
              onClick={() => onSelectSubject(subject)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSubject(subject);
                }
              }}
              data-testid={`subject-card-${subject.id}`}
            >
              <div className="subject-card-header">
                <div className="subject-icon-box">
                  {subject.iconUrl ? (
                    <img src={subject.iconUrl} alt={subject.title} className="subject-custom-icon" />
                  ) : (
                    <svg
                      className="subject-default-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  )}
                </div>
                <div className="subject-badge-pill">Subject</div>
              </div>

              <h3 className="subject-card-title">{subject.title}</h3>

              <p className="subject-card-description">
                {subject.description || `Explore topics, anatomical structures, and clinical principles in ${subject.title}.`}
              </p>

              <div className="subject-card-footer">
                <span className="subject-topic-count">
                  <svg
                    className="meta-icon"
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
                  {subject._count?.topics !== undefined
                    ? `${subject._count.topics} ${subject._count.topics === 1 ? 'Topic' : 'Topics'}`
                    : 'Explore Topics'}
                </span>
                <span className="subject-explore-link">
                  Explore Topics
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
          ))}
        </div>
      ) : null}
    </section>
  );
};

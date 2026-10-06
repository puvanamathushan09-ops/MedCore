import React, { useState, useEffect } from 'react';
import { getAccessToken } from '../auth/auth-storage';
import { QuizzesApiClient } from '../client/api/quizzes.api';
import type { Quiz } from '../client/types/quiz.types';
import { ApiClientError } from '../client/api/api-client';
import './QuizList.css';

export interface QuizListProps {
  onSelectQuiz: (quizId: string) => void;
  onViewAttempts?: () => void;
  onNavigateToLogin?: () => void;
}

export const QuizList: React.FC<QuizListProps> = ({
  onSelectQuiz,
  onViewAttempts,
  onNavigateToLogin,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthenticated, setUnauthenticated] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);
      setUnauthenticated(false);

      const token = getAccessToken();
      if (!token) {
        if (isMounted) {
          setUnauthenticated(true);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await QuizzesApiClient.getQuizzes(token);
        if (isMounted) {
          setQuizzes(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          if (err instanceof ApiClientError) {
            setError(err.message || 'Failed to load quizzes. Please try again.');
          } else {
            setError('An unexpected error occurred while fetching quizzes.');
          }
          setLoading(false);
        }
      }
    };

    fetchQuizzes();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter quizzes by search query across title, description, and subject
  const filteredQuizzes = quizzes.filter((q) => {
    const query = searchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      (q.description && q.description.toLowerCase().includes(query)) ||
      (q.subject?.title && q.subject.title.toLowerCase().includes(query))
    );
  });

  return (
    <div className="medcore-quizzes-page-wrapper">
      {/* =========================================================================
          HERO BANNER (POMAII ORGANIC THEME WITH WAVE)
          ========================================================================= */}
      <section className="quizzes-hero-section">
        <div
          className="quizzes-hero-bg-image"
          style={{ backgroundImage: "url('/images/medical-hero-2.jpg')" }}
        />
        <div className="quizzes-hero-scenic-overlay" />
        <div className="quizzes-hero-wave-bg">
          <svg className="quizzes-organic-wave" viewBox="0 0 1440 180" fill="none" preserveAspectRatio="none">
            <path
              d="M0,80 C320,160 540,20 900,100 C1200,160 1360,60 1440,110 L1440,180 L0,180 Z"
              fill="#fafaf7"
            />
          </svg>
        </div>

        <div className="quizzes-hero-container">
          <div className="quizzes-hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polygon points="12 6 12 12 16 14" />
            </svg>
            <span>USMLE STEP 1 &amp; 2 PREPARATION · CASE EXAMS</span>
          </div>

          <h1 className="quizzes-hero-title">
            Diagnostic Quizzes &amp; Clinical Question Banks
          </h1>

          <p className="quizzes-hero-subtitle">
            Reinforce clinical reasoning, anatomical recall, and pharmacological mechanisms through peer-reviewed diagnostic assessments.
          </p>

          <div className="quizzes-metrics-strip">
            <div className="quiz-metric-item">
              <span className="quiz-metric-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </span>
              <div>
                <strong>USMLE High-Yield</strong>
                <span>Clinical correlates</span>
              </div>
            </div>
            <div className="quiz-metric-divider" />
            <div className="quiz-metric-item">
              <span className="quiz-metric-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <div>
                <strong>Detailed Rationales</strong>
                <span>For every option</span>
              </div>
            </div>
            <div className="quiz-metric-divider" />
            <div className="quiz-metric-item">
              <span className="quiz-metric-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </span>
              <div>
                <strong>Performance Tracking</strong>
                <span>Instant score breakdowns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN QUIZ CONTENT AREA
          ========================================================================= */}
      <section className="medcore-quiz-list-container">
        {/* UNAUTHENTICATED GUEST PREVIEW STATE */}
        {unauthenticated && (
          <div className="quiz-guest-preview-card">
            <div className="guest-icon-box">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#154734" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="guest-preview-title">Sign In to Unlock the Question Bank</h2>
            <p className="guest-preview-desc">
              MedCore quizzes feature full interactive clinical scenarios, timed USMLE question sets, and detailed explanation rationales with references to published guidelines.
            </p>

            <div className="guest-topics-sample">
              <span className="sample-topic-pill">Cardiovascular Hemodynamics (15 Qs)</span>
              <span className="sample-topic-pill">Brachial Plexus Lesions (12 Qs)</span>
              <span className="sample-topic-pill">Sepsis Resuscitation Protocols (10 Qs)</span>
              <span className="sample-topic-pill">Thoracic Wall Anatomy (10 Qs)</span>
            </div>

            <div className="guest-action-row">
              <button
                type="button"
                className="quiz-login-cta-btn"
                onClick={onNavigateToLogin || (() => (window.location.href = '/login'))}
              >
                <span>Sign In to Start Quiz</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="quiz-skeleton-grid" aria-label="Loading quizzes">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="quiz-skeleton-card">
                <div className="quiz-skeleton-badge-row">
                  <div className="quiz-skeleton-badge" />
                  <div className="quiz-skeleton-badge short" />
                </div>
                <div className="quiz-skeleton-title" />
                <div className="quiz-skeleton-text" />
                <div className="quiz-skeleton-text short" />
                <div className="quiz-skeleton-footer" />
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="quiz-state-card quiz-error-state" role="alert">
            <div className="quiz-state-icon-wrapper quiz-error-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="quiz-state-title">Unable to Load Quizzes</h2>
            <p className="quiz-state-message">{error}</p>
          </div>
        )}

        {/* AUTHENTICATED QUIZ LIST */}
        {!loading && !error && !unauthenticated && (
          <>
            <div className="quiz-controls-toolbar">
              <div className="quiz-search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search quiz topic or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {onViewAttempts && (
                <button
                  type="button"
                  className="quiz-history-btn"
                  onClick={onViewAttempts}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>My Attempts &amp; Scores</span>
                </button>
              )}
            </div>

            {filteredQuizzes.length === 0 ? (
              <div className="quiz-state-card quiz-empty-state">
                <div className="quiz-state-icon-wrapper quiz-empty-icon-wrapper">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h3 className="quiz-state-title">No Quizzes Found</h3>
                <p className="quiz-state-message">
                  {searchQuery ? 'No quizzes matched your search query.' : 'There are currently no published quizzes available.'}
                </p>
              </div>
            ) : (
              <div className="quiz-grid">
                {filteredQuizzes.map((quiz) => {
                  const questionCount = quiz.questions?.length ?? 0;
                  return (
                    <div key={quiz.id} className="quiz-card">
                      <div className="quiz-card-content">
                        <div className="quiz-badges">
                          {quiz.subject?.title && (
                            <span className="quiz-badge quiz-subject-badge">
                              {quiz.subject.title}
                            </span>
                          )}
                          {quiz.topic?.title && (
                            <span className="quiz-badge quiz-topic-badge">
                              {quiz.topic.title}
                            </span>
                          )}
                        </div>

                        <h2 className="quiz-card-title">{quiz.title}</h2>

                        {quiz.description && (
                          <p className="quiz-card-description">{quiz.description}</p>
                        )}

                        <div className="quiz-card-footer">
                          <div className="quiz-meta-count">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <span>
                              {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="quiz-start-btn"
                            onClick={() => onSelectQuiz(quiz.id)}
                            aria-label={`Start quiz: ${quiz.title}`}
                          >
                            <span>Start Quiz</span>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

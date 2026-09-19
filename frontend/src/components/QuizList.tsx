import React, { useState, useEffect } from 'react';
import { getAccessToken } from '../auth/auth-storage';
import { QuizzesApiClient } from '../client/api/quizzes.api';
import type { Quiz } from '../client/types/quiz.types';
import { ApiClientError } from '../client/api/api-client';
import './QuizList.css';

export interface QuizListProps {
  onSelectQuiz: (quizId: string) => void;
  onViewAttempts?: () => void;
}

export const QuizList: React.FC<QuizListProps> = ({ onSelectQuiz, onViewAttempts }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthenticated, setUnauthenticated] = useState<boolean>(false);

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

  if (unauthenticated) {
    return (
      <div className="medcore-quiz-list-container">
        <div className="quiz-state-card quiz-auth-state">
          <div className="quiz-state-icon-wrapper">
            <svg
              className="quiz-state-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="quiz-state-title">Authentication Required</h2>
          <p className="quiz-state-message">
            Please log in to view and participate in medical quizzes.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="medcore-quiz-list-container">
        <div className="quiz-list-header">
          <h1 className="quiz-list-title">Medical Quizzes</h1>
          <p className="quiz-list-subtitle">
            Test your knowledge across core medical subjects and topics.
          </p>
        </div>
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="medcore-quiz-list-container">
        <div className="quiz-list-header">
          <h1 className="quiz-list-title">Medical Quizzes</h1>
        </div>
        <div className="quiz-state-card quiz-error-state" role="alert">
          <div className="quiz-state-icon-wrapper quiz-error-icon-wrapper">
            <svg
              className="quiz-state-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="quiz-state-title">Unable to Load Quizzes</h2>
          <p className="quiz-state-message">{error}</p>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="medcore-quiz-list-container">
        <div className="quiz-list-header">
          <h1 className="quiz-list-title">Medical Quizzes</h1>
          <p className="quiz-list-subtitle">
            Test your knowledge across core medical subjects and topics.
          </p>
        </div>
        <div className="quiz-state-card quiz-empty-state">
          <div className="quiz-state-icon-wrapper quiz-empty-icon-wrapper">
            <svg
              className="quiz-state-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h2 className="quiz-state-title">No Quizzes Available</h2>
          <p className="quiz-state-message">
            There are currently no published quizzes available. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="medcore-quiz-list-container">
      <div className="quiz-list-header">
        <div className="quiz-list-title-area">
          <h1 className="quiz-list-title">Medical Quizzes</h1>
          <p className="quiz-list-subtitle">
            Test your knowledge across core medical subjects and topics.
          </p>
        </div>
        {onViewAttempts && (
          <button
            type="button"
            className="quiz-history-btn"
            onClick={onViewAttempts}
            aria-label="My Attempts"
          >
            <svg
              className="quiz-history-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            My Attempts
          </button>
        )}
      </div>

      <div className="quiz-grid">
        {quizzes.map((quiz) => {
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
                    <svg
                      className="quiz-meta-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
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
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

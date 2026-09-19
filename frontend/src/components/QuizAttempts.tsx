import React, { useState, useEffect, useCallback } from 'react';
import { getAccessToken } from '../auth/auth-storage';
import { QuizzesApiClient } from '../client/api/quizzes.api';
import type { QuizAttemptHistoryItem } from '../client/types/quiz.types';
import { ApiClientError } from '../client/api/api-client';
import './QuizAttempts.css';

export interface QuizAttemptsProps {
  onBackToQuizzes: () => void;
}

export const QuizAttempts: React.FC<QuizAttemptsProps> = ({ onBackToQuizzes }) => {
  const [attempts, setAttempts] = useState<QuizAttemptHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthenticated, setUnauthenticated] = useState<boolean>(false);

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnauthenticated(false);

    const token = getAccessToken();
    if (!token) {
      setUnauthenticated(true);
      setLoading(false);
      return;
    }

    try {
      const data = await QuizzesApiClient.getMyAttempts(token);
      setAttempts(data);
      setLoading(false);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message || 'Failed to load quiz attempts. Please try again.');
      } else {
        setError('An unexpected error occurred while fetching quiz attempts.');
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const formatDate = (dateValue: string | Date): string => {
    try {
      const date = new Date(dateValue);
      return date.toLocaleString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return String(dateValue);
    }
  };

  if (unauthenticated) {
    return (
      <div className="medcore-quiz-attempts-container">
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
            Please log in to view your quiz attempt history.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="medcore-quiz-attempts-container">
        <div className="quiz-attempts-header">
          <div className="quiz-attempts-title-area">
            <h1 className="quiz-attempts-title">My Quiz Attempts</h1>
            <p className="quiz-attempts-subtitle">
              Review your previous quiz submissions and test performance history.
            </p>
          </div>
        </div>
        <div className="quiz-skeleton-grid" aria-label="Loading quiz attempts">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="quiz-skeleton-card">
              <div className="quiz-skeleton-badge-row">
                <div className="quiz-skeleton-badge" />
                <div className="quiz-skeleton-badge short" />
              </div>
              <div className="quiz-skeleton-title" />
              <div className="quiz-skeleton-text" />
              <div className="quiz-skeleton-footer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medcore-quiz-attempts-container">
        <div className="quiz-attempts-header">
          <div className="quiz-attempts-title-area">
            <h1 className="quiz-attempts-title">My Quiz Attempts</h1>
          </div>
          <button
            type="button"
            className="quiz-back-btn"
            onClick={onBackToQuizzes}
            aria-label="Back to Quizzes"
          >
            <svg
              className="quiz-back-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Quizzes
          </button>
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
          <h2 className="quiz-state-title">Unable to Load Quiz Attempts</h2>
          <p className="quiz-state-message">{error}</p>
          <button
            type="button"
            className="quiz-retry-btn"
            onClick={fetchAttempts}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="medcore-quiz-attempts-container">
        <div className="quiz-attempts-header">
          <div className="quiz-attempts-title-area">
            <h1 className="quiz-attempts-title">My Quiz Attempts</h1>
            <p className="quiz-attempts-subtitle">
              Review your previous quiz submissions and test performance history.
            </p>
          </div>
          <button
            type="button"
            className="quiz-back-btn"
            onClick={onBackToQuizzes}
            aria-label="Back to Quizzes"
          >
            <svg
              className="quiz-back-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Quizzes
          </button>
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="quiz-state-title">No Quiz Attempts Yet</h2>
          <p className="quiz-state-message">
            No quiz attempts yet. Start a medical quiz to test your knowledge!
          </p>
          <button
            type="button"
            className="quiz-empty-back-btn"
            onClick={onBackToQuizzes}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medcore-quiz-attempts-container">
      <div className="quiz-attempts-header">
        <div className="quiz-attempts-title-area">
          <h1 className="quiz-attempts-title">My Quiz Attempts</h1>
          <p className="quiz-attempts-subtitle">
            Review your previous quiz submissions and test performance history.
          </p>
        </div>
        <button
          type="button"
          className="quiz-back-btn"
          onClick={onBackToQuizzes}
          aria-label="Back to Quizzes"
        >
          <svg
            className="quiz-back-btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Quizzes
        </button>
      </div>

      <div className="attempts-list">
        {attempts.map((attempt) => {
          const topicTitle = attempt.topic?.name ?? 'All topics';
          const subjectTitle = attempt.subject?.name ?? '';

          return (
            <div key={attempt.attemptId} className="attempt-card">
              <div className="attempt-card-main">
                <div className="attempt-info">
                  <div className="attempt-badges">
                    {subjectTitle && (
                      <span className="attempt-subject">{subjectTitle}</span>
                    )}
                    <span className="attempt-topic-separator">•</span>
                    <span className="attempt-topic">{topicTitle}</span>
                  </div>

                  <h2 className="attempt-quiz-title">{attempt.quizTitle}</h2>

                  <div className="attempt-completed-date">
                    <svg
                      className="attempt-date-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Completed {formatDate(attempt.completedAt)}</span>
                  </div>
                </div>

                <div className="attempt-results-summary">
                  <div className="attempt-score-box">
                    <span className="attempt-score-label">Score</span>
                    <span className="attempt-score-value">
                      {attempt.score} / {attempt.total}
                    </span>
                  </div>

                  <div className="attempt-percentage-box">
                    <span className="attempt-percentage-label">Percentage</span>
                    <span className="attempt-percentage-value">
                      {attempt.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

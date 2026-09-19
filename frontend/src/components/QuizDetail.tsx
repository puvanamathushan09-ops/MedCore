import React, { useState, useEffect, useCallback } from 'react';
import { getAccessToken } from '../auth/auth-storage';
import { QuizzesApiClient } from '../client/api/quizzes.api';
import type { Quiz, QuizSubmitResult, SubmitQuizInput } from '../client/types/quiz.types';
import { ApiClientError } from '../client/api/api-client';
import './QuizDetail.css';

export interface QuizDetailProps {
  quizId: string;
  onBackToQuizzes: () => void;
}

export const QuizDetail: React.FC<QuizDetailProps> = ({ quizId, onBackToQuizzes }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthenticated, setUnauthenticated] = useState<boolean>(false);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<QuizSubmitResult | null>(null);
  const [validationNotice, setValidationNotice] = useState<string | null>(null);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) {
      setError('Quiz ID is missing.');
      setLoading(false);
      return;
    }

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
      const fetchedQuiz = await QuizzesApiClient.getQuizById(quizId, token);
      if (!fetchedQuiz) {
        setError('Quiz not found.');
      } else {
        setQuiz(fetchedQuiz);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message || 'Failed to load quiz. The quiz may not exist or has been removed.');
      } else {
        setError('An unexpected error occurred while fetching the quiz.');
      }
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submitResult || submitting) return;
    const nextAnswers = {
      ...selectedAnswers,
      [questionId]: optionId,
    };
    setSelectedAnswers(nextAnswers);

    if (validationNotice && quiz?.questions) {
      const allAnswered = quiz.questions.every((q) => Boolean(nextAnswers[q.id]));
      if (allAnswered) {
        setValidationNotice(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!quiz || submitResult || submitting) return;

    const totalQuestionsCount = quiz.questions?.length ?? 0;
    const unansweredCount = quiz.questions?.filter((q) => !selectedAnswers[q.id]).length ?? totalQuestionsCount;

    if (unansweredCount > 0) {
      setValidationNotice('Please answer all questions before submitting the quiz.');
      return;
    }

    setValidationNotice(null);
    setSubmitting(true);
    setSubmitError(null);

    const token = getAccessToken();
    if (!token) {
      setSubmitError('Authentication token missing. Please log in.');
      setSubmitting(false);
      return;
    }

    const answers = Object.entries(selectedAnswers)
      .filter(([_, optionId]) => Boolean(optionId))
      .map(([questionId, optionId]) => ({ questionId, optionId }));

    const payload: SubmitQuizInput = { answers };

    try {
      const result = await QuizzesApiClient.submitQuiz(quiz.id, payload, token);
      setSubmitResult(result);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setSubmitError(err.message || 'Failed to submit quiz. Please try again.');
      } else {
        setSubmitError('An unexpected error occurred during submission.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuestions = quiz?.questions?.length ?? 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="medcore-quiz-detail-container">
      {/* Top Action Bar */}
      <div className="quiz-detail-topbar">
        <button
          type="button"
          className="btn btn-secondary back-btn"
          onClick={onBackToQuizzes}
          data-testid="back-to-quizzes-btn"
        >
          <svg
            className="btn-icon"
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

      {/* UNAUTHENTICATED STATE */}
      {unauthenticated ? (
        <div className="quiz-detail-state-card quiz-auth-state">
          <div className="state-icon-wrapper">
            <svg
              className="state-icon"
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
          <h2 className="state-title">Authentication Required</h2>
          <p className="state-message">
            Please log in to view and participate in this medical quiz.
          </p>
        </div>
      ) : null}

      {/* LOADING STATE */}
      {loading && !unauthenticated ? (
        <div className="quiz-detail-skeleton" data-testid="quiz-detail-loading">
          <div className="skeleton-badge-group">
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
          </div>
          <div className="skeleton-main-title" />
          <div className="skeleton-meta-row" />
          <div className="skeleton-question-box" />
          <div className="skeleton-question-box" />
        </div>
      ) : null}

      {/* ERROR STATE */}
      {error && !loading && !unauthenticated ? (
        <div className="quiz-detail-state-card quiz-error-state" role="alert">
          <div className="state-icon-wrapper quiz-error-icon-wrapper">
            <svg
              className="state-icon"
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
          <h2 className="state-title">Quiz Not Found</h2>
          <p className="state-message">{error}</p>
          <div className="state-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchQuiz}
            >
              Try Again
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBackToQuizzes}
            >
              Return to Quizzes List
            </button>
          </div>
        </div>
      ) : null}

      {/* QUIZ CONTENT & SUBMISSION */}
      {!loading && !error && !unauthenticated && quiz ? (
        <div className="quiz-detail-content">
          {/* Header */}
          <header className="quiz-header">
            <div className="quiz-badges">
              {quiz.subject?.title && (
                <span className="badge subject-badge">{quiz.subject.title}</span>
              )}
              {quiz.topic?.title && (
                <span className="badge topic-badge">{quiz.topic.title}</span>
              )}
            </div>

            <h1 className="quiz-title">{quiz.title}</h1>

            {quiz.description && (
              <p className="quiz-description">{quiz.description}</p>
            )}

            <div className="quiz-meta-info">
              <span className="meta-item">
                <svg
                  className="meta-icon"
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
                {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}
              </span>

              {!submitResult && (
                <span className="meta-item answered-status">
                  Answered: {answeredCount} of {totalQuestions}
                </span>
              )}
            </div>
          </header>

          {/* RESULTS CARD (AFTER SUBMISSION) */}
          {submitResult ? (
            <div className="quiz-result-card" data-testid="quiz-result-card">
              <div className="result-header">
                <div className="result-icon-box">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="result-title">Quiz Completed!</h2>
                  <p className="result-subtitle">
                    Your answers have been submitted and evaluated.
                  </p>
                </div>
              </div>

              <div className="result-metrics-grid">
                <div className="metric-box">
                  <span className="metric-label">Score</span>
                  <span className="metric-value">
                    {submitResult.score} / {submitResult.total}
                  </span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Percentage</span>
                  <span className="metric-value highlight">
                    {submitResult.percentage}%
                  </span>
                </div>

                <div className="metric-box full-width">
                  <span className="metric-label">Attempt ID</span>
                  <span className="metric-value code-font">
                    {submitResult.attemptId}
                  </span>
                </div>
              </div>

              <div className="result-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onBackToQuizzes}
                >
                  Return to Quizzes List
                </button>
              </div>
            </div>
          ) : null}

          {/* QUESTIONS LIST */}
          <div className="quiz-questions-list">
            {validationNotice && (
              <div className="quiz-validation-notice" role="alert" data-testid="quiz-validation-notice">
                <svg
                  className="notice-icon"
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
                <span>{validationNotice}</span>
              </div>
            )}
            {quiz.questions.map((question, qIdx) => {
              const selectedOptionId = selectedAnswers[question.id];
              const questionResult = submitResult?.results?.find(
                (r) => r.questionId === question.id,
              );

              return (
                <div key={question.id} className="quiz-question-card">
                  <div className="question-header">
                    <span className="question-number">Question {qIdx + 1}</span>
                    <h2 className="question-text">{question.question}</h2>
                  </div>

                  {question.explanation && submitResult && (
                    <div className="question-explanation">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}

                  <div className="options-group" role="radiogroup" aria-label={`Question ${qIdx + 1}`}>
                    {question.options.map((option, oIdx) => {
                      const isSelected = selectedOptionId === option.id;
                      let resultClass = '';
                      let statusText: string | null = null;

                      if (submitResult && isSelected && questionResult) {
                        if (questionResult.isCorrect) {
                          resultClass = 'correct';
                          statusText = 'Correct answer';
                        } else {
                          resultClass = 'wrong';
                          statusText = 'Your answer was incorrect';
                        }
                      }

                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`option-btn ${isSelected ? 'selected' : ''} ${resultClass}`.trim()}
                          onClick={() => handleSelectOption(question.id, option.id)}
                          disabled={Boolean(submitResult) || submitting}
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`Option ${oIdx + 1}: ${option.optionText}${statusText ? ` - ${statusText}` : ''}`}
                          data-testid={`option-${question.id}-${option.id}`}
                        >
                          <span className="option-indicator">
                            {resultClass === 'correct' ? (
                              <svg className="result-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : resultClass === 'wrong' ? (
                              <svg className="result-cross-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            ) : (
                              <span className="option-indicator-inner" />
                            )}
                          </span>
                          <span className="option-text">{option.optionText}</span>
                          {statusText && (
                            <span className={`option-status-badge ${resultClass}`}>
                              {statusText}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUBMIT SECTION */}
          {!submitResult ? (
            <div className="quiz-submit-section">
              {submitError && (
                <div className="submit-error-banner" role="alert">
                  <svg
                    className="error-banner-icon"
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
                  <span>{submitError}</span>
                </div>
              )}

              <button
                type="button"
                className="submit-quiz-btn"
                onClick={handleSubmit}
                disabled={submitting}
                data-testid="submit-quiz-btn"
              >
                {submitting ? 'Submitting Answers...' : 'Submit Quiz'}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

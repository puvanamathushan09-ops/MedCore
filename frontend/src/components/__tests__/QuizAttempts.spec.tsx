import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QuizAttempts } from '../QuizAttempts';
import { getAccessToken } from '../../auth/auth-storage';
import { QuizzesApiClient } from '../../client/api/quizzes.api';
import type { QuizAttemptHistoryItem } from '../../client/types/quiz.types';
import { ApiClientError } from '../../client/api/api-client';

vi.mock('../../auth/auth-storage', () => ({
  getAccessToken: vi.fn(),
}));

vi.mock('../../client/api/quizzes.api', () => ({
  QuizzesApiClient: {
    getMyAttempts: vi.fn(),
  },
}));

describe('QuizAttempts Component', () => {
  const mockOnBackToQuizzes = vi.fn();

  const mockAttempt1: QuizAttemptHistoryItem = {
    attemptId: 'att-1',
    quizId: 'quiz-1',
    quizTitle: 'Anatomy Test Quiz',
    subject: {
      id: 'sub-1',
      name: 'Anatomy',
    },
    topic: {
      id: 'top-1',
      name: 'Upper Limb',
    },
    score: 8,
    total: 10,
    percentage: 80,
    completedAt: '2026-09-15T10:30:00.000Z',
  };

  const mockAttemptNullTopic: QuizAttemptHistoryItem = {
    attemptId: 'att-2',
    quizId: 'quiz-2',
    quizTitle: 'General Pharmacology',
    subject: {
      id: 'sub-2',
      name: 'Pharmacology',
    },
    topic: null,
    score: 5,
    total: 5,
    percentage: 100,
    completedAt: '2026-09-16T08:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. No token -> authentication-required state and API is not called
  it('renders authentication state when user has no access token and does not call API', async () => {
    (getAccessToken as any).mockReturnValue(null);

    render(<QuizAttempts onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(
        screen.getByText('Please log in to view your quiz attempt history.'),
      ).toBeInTheDocument();
    });

    expect(QuizzesApiClient.getMyAttempts).not.toHaveBeenCalled();
  });

  // 2. Loading state
  it('renders loading skeleton state while fetching attempts', () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getMyAttempts as any).mockReturnValue(new Promise(() => {}));

    render(<QuizAttempts onBackToQuizzes={mockOnBackToQuizzes} />);

    expect(screen.getByLabelText('Loading quiz attempts')).toBeInTheDocument();
  });

  // 3-10. Successful loading & fields display
  it('renders successful attempt-history with quiz title, subject, topic, score, percentage, and date', async () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getMyAttempts as any).mockResolvedValue([mockAttempt1]);

    render(<QuizAttempts onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('My Quiz Attempts')).toBeInTheDocument();
      // 4. Quiz title displayed
      expect(screen.getByText('Anatomy Test Quiz')).toBeInTheDocument();
      // 5. Subject displayed
      expect(screen.getByText('Anatomy')).toBeInTheDocument();
      // 6. Topic displayed
      expect(screen.getByText('Upper Limb')).toBeInTheDocument();
      // 8. Score and total displayed correctly
      expect(screen.getByText('8 / 10')).toBeInTheDocument();
      // 9. Backend percentage displayed without recalculation
      expect(screen.getByText('80%')).toBeInTheDocument();
      // 10. Completed date/time displayed
      expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    });
  });

  // 7. Null topic displays fallback ("All topics")
  it('displays fallback "All topics" when topic is null', async () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getMyAttempts as any).mockResolvedValue([mockAttemptNullTopic]);

    render(<QuizAttempts onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('General Pharmacology')).toBeInTheDocument();
      expect(screen.getByText('Pharmacology')).toBeInTheDocument();
      expect(screen.getByText('All topics')).toBeInTheDocument();
      expect(screen.getByText('5 / 5')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  // 11. Empty attempt-history state
  it('renders empty attempt-history state when user has no attempts', async () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getMyAttempts as any).mockResolvedValue([]);

    render(<QuizAttempts onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('No Quiz Attempts Yet')).toBeInTheDocument();
      expect(
        screen.getByText('No quiz attempts yet. Start a medical quiz to test your knowledge!'),
      ).toBeInTheDocument();
    });

    const backButtons = screen.getAllByRole('button', { name: /Back to Quizzes/i });
    expect(backButtons.length).toBeGreaterThan(0);
    fireEvent.click(backButtons[0]);
    expect(mockOnBackToQuizzes).toHaveBeenCalledTimes(1);
  });

  // 12. API error state & Try Again action
  it('renders API error state and provides a Try Again action', async () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getMyAttempts as any).mockRejectedValue(
      new ApiClientError(500, 'Server unavailable'),
    );

    render(<QuizAttempts onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Quiz Attempts')).toBeInTheDocument();
      expect(screen.getByText('Server unavailable')).toBeInTheDocument();
    });

    // Test Try Again action
    (QuizzesApiClient.getMyAttempts as any).mockResolvedValue([mockAttempt1]);
    const tryAgainBtn = screen.getByRole('button', { name: 'Try Again' });
    fireEvent.click(tryAgainBtn);

    await waitFor(() => {
      expect(screen.getByText('Anatomy Test Quiz')).toBeInTheDocument();
    });
  });

  // 13. Back to Quizzes navigation
  it('calls onBackToQuizzes when Back to Quizzes button is clicked', async () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getMyAttempts as any).mockResolvedValue([mockAttempt1]);

    render(<QuizAttempts onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('Anatomy Test Quiz')).toBeInTheDocument();
    });

    const backBtn = screen.getByRole('button', { name: 'Back to Quizzes' });
    fireEvent.click(backBtn);
    expect(mockOnBackToQuizzes).toHaveBeenCalledTimes(1);
  });
});

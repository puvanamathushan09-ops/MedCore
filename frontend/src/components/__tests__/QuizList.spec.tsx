import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QuizList } from '../QuizList';
import { getAccessToken } from '../../auth/auth-storage';
import { QuizzesApiClient } from '../../client/api/quizzes.api';
import type { Quiz } from '../../client/types/quiz.types';

vi.mock('../../auth/auth-storage', () => ({
  getAccessToken: vi.fn(),
}));

vi.mock('../../client/api/quizzes.api', () => ({
  QuizzesApiClient: {
    getQuizzes: vi.fn(),
  },
}));

describe('QuizList Component', () => {
  const mockOnSelectQuiz = vi.fn();

  const mockQuiz: Quiz = {
    id: 'quiz-1',
    title: 'Cardiology Fundamentals',
    description: 'Test your understanding of basic cardiology.',
    subjectId: 'sub-1',
    topicId: 'top-1',
    isPublished: true,
    createdById: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subject: { id: 'sub-1', title: 'Internal Medicine' },
    topic: { id: 'top-1', title: 'Cardiology' },
    questions: [
      {
        id: 'q-1',
        question: 'What is normal resting heart rate?',
        orderIndex: 0,
        options: [
          { id: 'opt-1', optionText: '60-100 bpm', orderIndex: 0 },
          { id: 'opt-2', optionText: '120-160 bpm', orderIndex: 1 },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders authentication state when user has no access token', async () => {
    (getAccessToken as any).mockReturnValue(null);

    render(<QuizList onSelectQuiz={mockOnSelectQuiz} />);

    await waitFor(() => {
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(
        screen.getByText('Please log in to view and participate in medical quizzes.'),
      ).toBeInTheDocument();
    });

    expect(QuizzesApiClient.getQuizzes).not.toHaveBeenCalled();
  });

  it('renders loading skeleton initially when token exists', () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getQuizzes as any).mockReturnValue(new Promise(() => {}));

    render(<QuizList onSelectQuiz={mockOnSelectQuiz} />);

    expect(screen.getByLabelText('Loading quizzes')).toBeInTheDocument();
  });

  it('renders list of quizzes upon successful API response', async () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getQuizzes as any).mockResolvedValue([mockQuiz]);

    render(<QuizList onSelectQuiz={mockOnSelectQuiz} />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Medical Quizzes' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Cardiology Fundamentals')).toBeInTheDocument();
      expect(
        screen.getByText('Test your understanding of basic cardiology.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Internal Medicine')).toBeInTheDocument();
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
      expect(screen.getByText('1 Question')).toBeInTheDocument();
    });
  });

  it('calls onSelectQuiz when Start Quiz button is clicked', async () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getQuizzes as any).mockResolvedValue([mockQuiz]);

    render(<QuizList onSelectQuiz={mockOnSelectQuiz} />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology Fundamentals')).toBeInTheDocument();
    });

    const startBtn = screen.getByRole('button', {
      name: 'Start quiz: Cardiology Fundamentals',
    });
    fireEvent.click(startBtn);

    expect(mockOnSelectQuiz).toHaveBeenCalledWith('quiz-1');
  });

  it('renders empty state when API returns no quizzes', async () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getQuizzes as any).mockResolvedValue([]);

    render(<QuizList onSelectQuiz={mockOnSelectQuiz} />);

    await waitFor(() => {
      expect(screen.getByText('No Quizzes Available')).toBeInTheDocument();
      expect(
        screen.getByText('There are currently no published quizzes available. Please check back later.'),
      ).toBeInTheDocument();
    });
  });

  it('renders error state when API request fails', async () => {
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getQuizzes as any).mockRejectedValue(
      new Error('Server error'),
    );

    render(<QuizList onSelectQuiz={mockOnSelectQuiz} />);

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Quizzes')).toBeInTheDocument();
    });
  });

  it('calls onViewAttempts when My Attempts button is clicked', async () => {
    const mockOnViewAttempts = vi.fn();
    (getAccessToken as any).mockReturnValue('mock-valid-token');
    (QuizzesApiClient.getQuizzes as any).mockResolvedValue([mockQuiz]);

    render(
      <QuizList
        onSelectQuiz={mockOnSelectQuiz}
        onViewAttempts={mockOnViewAttempts}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Cardiology Fundamentals')).toBeInTheDocument();
    });

    const myAttemptsBtn = screen.getByRole('button', { name: 'My Attempts' });
    expect(myAttemptsBtn).toBeInTheDocument();
    fireEvent.click(myAttemptsBtn);

    expect(mockOnViewAttempts).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QuizDetail } from '../QuizDetail';
import { getAccessToken } from '../../auth/auth-storage';
import { QuizzesApiClient } from '../../client/api/quizzes.api';
import type { Quiz, QuizSubmitResult } from '../../client/types/quiz.types';

vi.mock('../../auth/auth-storage', () => ({
  getAccessToken: vi.fn(),
}));

vi.mock('../../client/api/quizzes.api', () => ({
  QuizzesApiClient: {
    getQuizById: vi.fn(),
    submitQuiz: vi.fn(),
  },
}));

describe('QuizDetail Component', () => {
  const mockOnBackToQuizzes = vi.fn();
  const quizId = 'quiz-123';

  const mockQuiz: Quiz = {
    id: quizId,
    title: 'Cardiology Self-Assessment',
    description: 'Comprehensive test on cardiovascular conditions.',
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
        explanation: 'Standard resting HR range is 60-100 bpm.',
        orderIndex: 0,
        options: [
          { id: 'opt-1', optionText: '60-100 bpm', orderIndex: 0 },
          { id: 'opt-2', optionText: '120-160 bpm', orderIndex: 1 },
        ],
      },
      {
        id: 'q-2',
        question: 'Which valve separates left atrium and left ventricle?',
        orderIndex: 1,
        options: [
          { id: 'opt-3', optionText: 'Tricuspid Valve', orderIndex: 0 },
          { id: 'opt-4', optionText: 'Mitral Valve', orderIndex: 1 },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders authentication state when user has no access token', async () => {
    (getAccessToken as any).mockReturnValue(null);

    render(<QuizDetail quizId={quizId} onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    });

    expect(QuizzesApiClient.getQuizById).not.toHaveBeenCalled();
  });

  it('renders loading skeleton while quiz data is fetching', () => {
    (getAccessToken as any).mockReturnValue('mock-token');
    (QuizzesApiClient.getQuizById as any).mockReturnValue(new Promise(() => {}));

    render(<QuizDetail quizId={quizId} onBackToQuizzes={mockOnBackToQuizzes} />);

    expect(screen.getByTestId('quiz-detail-loading')).toBeInTheDocument();
  });

  it('renders quiz title, subject, topic, and questions upon loading without green/red indicators before submission', async () => {
    (getAccessToken as any).mockReturnValue('mock-token');
    (QuizzesApiClient.getQuizById as any).mockResolvedValue(mockQuiz);

    render(<QuizDetail quizId={quizId} onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology Self-Assessment')).toBeInTheDocument();
      expect(screen.getByText('Internal Medicine')).toBeInTheDocument();
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
      expect(screen.getByText('2 Questions')).toBeInTheDocument();
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });

    const option1 = screen.getByTestId('option-q-1-opt-1');
    expect(option1.className).not.toContain('correct');
    expect(option1.className).not.toContain('wrong');
  });

  it('highlights correct selected option in green and wrong selected option in red after submission', async () => {
    (getAccessToken as any).mockReturnValue('mock-token');
    (QuizzesApiClient.getQuizById as any).mockResolvedValue(mockQuiz);

    const mockSubmitResult: QuizSubmitResult = {
      attemptId: 'attempt-uuid-789',
      score: 1,
      total: 2,
      percentage: 50,
      results: [
        { questionId: 'q-1', selectedOptionId: 'opt-1', isCorrect: true },
        { questionId: 'q-2', selectedOptionId: 'opt-3', isCorrect: false },
      ],
    };
    (QuizzesApiClient.submitQuiz as any).mockResolvedValue(mockSubmitResult);

    render(<QuizDetail quizId={quizId} onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology Self-Assessment')).toBeInTheDocument();
    });

    const option1 = screen.getByRole('radio', { name: 'Option 1: 60-100 bpm' });
    fireEvent.click(option1);

    const option3 = screen.getByRole('radio', { name: 'Option 1: Tricuspid Valve' });
    fireEvent.click(option3);

    const submitBtn = screen.getByTestId('submit-quiz-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('quiz-result-card')).toBeInTheDocument();
    });

    const opt1Btn = screen.getByTestId('option-q-1-opt-1');
    expect(opt1Btn.className).toContain('correct');
    expect(screen.getByText('Correct answer')).toBeInTheDocument();

    const opt3Btn = screen.getByTestId('option-q-2-opt-3');
    expect(opt3Btn.className).toContain('wrong');
    expect(screen.getByText('Your answer was incorrect')).toBeInTheDocument();

    const opt2Btn = screen.getByTestId('option-q-1-opt-2');
    expect(opt2Btn.className).not.toContain('correct');
    expect(opt2Btn.className).not.toContain('wrong');

    const opt4Btn = screen.getByTestId('option-q-2-opt-4');
    expect(opt4Btn.className).not.toContain('correct');
    expect(opt4Btn.className).not.toContain('wrong');
  });

  it('triggers back button handler when Back to Quizzes is clicked', async () => {
    (getAccessToken as any).mockReturnValue('mock-token');
    (QuizzesApiClient.getQuizById as any).mockResolvedValue(mockQuiz);

    render(<QuizDetail quizId={quizId} onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByTestId('back-to-quizzes-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('back-to-quizzes-btn'));
    expect(mockOnBackToQuizzes).toHaveBeenCalled();
  });

  it('does not call submit API and displays validation notice when submitting with zero answers', async () => {
    (getAccessToken as any).mockReturnValue('mock-token');
    (QuizzesApiClient.getQuizById as any).mockResolvedValue(mockQuiz);

    render(<QuizDetail quizId={quizId} onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology Self-Assessment')).toBeInTheDocument();
    });

    const submitBtn = screen.getByTestId('submit-quiz-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText('Please answer all questions before submitting the quiz.')).toBeInTheDocument();
    expect(QuizzesApiClient.submitQuiz).not.toHaveBeenCalled();
  });

  it('does not call submit API and displays validation notice when submitting with some questions unanswered', async () => {
    (getAccessToken as any).mockReturnValue('mock-token');
    (QuizzesApiClient.getQuizById as any).mockResolvedValue(mockQuiz);

    render(<QuizDetail quizId={quizId} onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology Self-Assessment')).toBeInTheDocument();
    });

    // Select option for Question 1 only
    const option1 = screen.getByTestId('option-q-1-opt-1');
    fireEvent.click(option1);

    const submitBtn = screen.getByTestId('submit-quiz-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText('Please answer all questions before submitting the quiz.')).toBeInTheDocument();
    expect(QuizzesApiClient.submitQuiz).not.toHaveBeenCalled();
  });

  it('clears validation notice when selecting the remaining answer and submits normally after all questions are answered', async () => {
    (getAccessToken as any).mockReturnValue('mock-token');
    (QuizzesApiClient.getQuizById as any).mockResolvedValue(mockQuiz);

    const mockSubmitResult: QuizSubmitResult = {
      attemptId: 'attempt-uuid-123',
      score: 2,
      total: 2,
      percentage: 100,
      results: [
        { questionId: 'q-1', selectedOptionId: 'opt-1', isCorrect: true },
        { questionId: 'q-2', selectedOptionId: 'opt-4', isCorrect: true },
      ],
    };
    (QuizzesApiClient.submitQuiz as any).mockResolvedValue(mockSubmitResult);

    render(<QuizDetail quizId={quizId} onBackToQuizzes={mockOnBackToQuizzes} />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology Self-Assessment')).toBeInTheDocument();
    });

    // Select answer for question 1 only
    const option1 = screen.getByTestId('option-q-1-opt-1');
    fireEvent.click(option1);

    // Click submit
    const submitBtn = screen.getByTestId('submit-quiz-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText('Please answer all questions before submitting the quiz.')).toBeInTheDocument();
    expect(QuizzesApiClient.submitQuiz).not.toHaveBeenCalled();

    // Select answer for question 2 (remaining unanswered question)
    const option4 = screen.getByTestId('option-q-2-opt-4');
    fireEvent.click(option4);

    // Validation notice should be cleared
    expect(screen.queryByText('Please answer all questions before submitting the quiz.')).not.toBeInTheDocument();

    // Click submit again
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(QuizzesApiClient.submitQuiz).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('quiz-result-card')).toBeInTheDocument();
    });
  });
});

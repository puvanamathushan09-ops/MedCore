import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SubjectList } from '../SubjectList';
import { SubjectsApiClient } from '../../../../src/client/api/subjects.api';
import type { Subject } from '../../../../src/client/types/subject.types';

vi.mock('../../../../src/client/api/subjects.api', () => ({
  SubjectsApiClient: {
    getSubjects: vi.fn(),
  },
}));

describe('SubjectList Component', () => {
  const mockOnSelectSubject = vi.fn();

  const mockSubjects: Subject[] = [
    {
      id: 'sub-1',
      title: 'Anatomy',
      slug: 'anatomy',
      description: 'Study of human structure.',
      orderIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { topics: 2, articles: 5 },
    },
    {
      id: 'sub-2',
      title: 'Physiology',
      slug: 'physiology',
      description: 'Study of body functions.',
      orderIndex: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { topics: 4, articles: 8 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    (SubjectsApiClient.getSubjects as any).mockReturnValue(new Promise(() => {}));
    render(<SubjectList onSelectSubject={mockOnSelectSubject} />);

    expect(screen.getByTestId('subject-loading-state')).toBeInTheDocument();
    expect(screen.getByText('Medical Subjects')).toBeInTheDocument();
  });

  it('renders subject cards when data is successfully loaded', async () => {
    (SubjectsApiClient.getSubjects as any).mockResolvedValue({
      data: mockSubjects,
      meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
    });

    render(<SubjectList onSelectSubject={mockOnSelectSubject} />);

    await waitFor(() => {
      expect(screen.getByTestId('subject-card-sub-1')).toBeInTheDocument();
      expect(screen.getByTestId('subject-card-sub-2')).toBeInTheDocument();
    });

    expect(screen.getByText('Anatomy')).toBeInTheDocument();
    expect(screen.getByText('Physiology')).toBeInTheDocument();
    expect(screen.getByText('2 Topics')).toBeInTheDocument();
  });

  it('renders empty state when no subjects are returned', async () => {
    (SubjectsApiClient.getSubjects as any).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 100, totalPages: 0 },
    });

    render(<SubjectList onSelectSubject={mockOnSelectSubject} />);

    await waitFor(() => {
      expect(screen.getByTestId('subject-empty-state')).toBeInTheDocument();
    });

    expect(screen.getByText('No Subjects Found')).toBeInTheDocument();
  });

  it('renders error state and retries on retry button click', async () => {
    (SubjectsApiClient.getSubjects as any).mockRejectedValueOnce(
      new Error('Network connection failed'),
    );

    render(<SubjectList onSelectSubject={mockOnSelectSubject} />);

    await waitFor(() => {
      expect(screen.getByTestId('subject-error-state')).toBeInTheDocument();
    });

    expect(screen.getByText('Unable to Load Subjects')).toBeInTheDocument();

    (SubjectsApiClient.getSubjects as any).mockResolvedValueOnce({
      data: mockSubjects,
      meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
    });

    const retryBtn = screen.getByTestId('retry-subjects-button');
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Anatomy')).toBeInTheDocument();
    });
  });

  it('calls onSelectSubject when a subject card is clicked', async () => {
    (SubjectsApiClient.getSubjects as any).mockResolvedValue({
      data: mockSubjects,
      meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
    });

    render(<SubjectList onSelectSubject={mockOnSelectSubject} />);

    await waitFor(() => {
      expect(screen.getByTestId('subject-card-sub-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('subject-card-sub-1'));
    expect(mockOnSelectSubject).toHaveBeenCalledWith(mockSubjects[0]);
  });
});

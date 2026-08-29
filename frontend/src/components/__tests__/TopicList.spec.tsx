import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { TopicList } from '../TopicList';
import { TopicsApiClient } from '../../../../src/client/api/topics.api';
import { SubjectsApiClient } from '../../../../src/client/api/subjects.api';
import type { Topic } from '../../../../src/client/types/topic.types';
import type { Subject } from '../../../../src/client/types/subject.types';

vi.mock('../../../../src/client/api/topics.api', () => ({
  TopicsApiClient: {
    getTopics: vi.fn(),
  },
}));

vi.mock('../../../../src/client/api/subjects.api', () => ({
  SubjectsApiClient: {
    getSubjects: vi.fn(),
  },
}));

describe('TopicList Component', () => {
  const mockOnSelectTopic = vi.fn();

  const mockSubjects: Subject[] = [
    {
      id: 'sub-1',
      title: 'Anatomy',
      slug: 'anatomy',
      orderIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockTopics: Topic[] = [
    {
      id: 'top-1',
      subjectId: 'sub-1',
      title: 'Upper Limb',
      slug: 'upper-limb',
      description: 'Arm and shoulder anatomy',
      orderIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { articles: 3 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton while topics are fetching', () => {
    (TopicsApiClient.getTopics as any).mockReturnValue(new Promise(() => {}));
    (SubjectsApiClient.getSubjects as any).mockReturnValue(new Promise(() => {}));

    render(<TopicList onSelectTopic={mockOnSelectTopic} />);

    expect(screen.getByTestId('topic-loading-state')).toBeInTheDocument();
    expect(screen.getByText('Medical Topics')).toBeInTheDocument();
  });

  it('renders topic cards with subject badge when data loads', async () => {
    (TopicsApiClient.getTopics as any).mockResolvedValue({ data: mockTopics });
    (SubjectsApiClient.getSubjects as any).mockResolvedValue({ data: mockSubjects });

    render(<TopicList onSelectTopic={mockOnSelectTopic} />);

    await waitFor(() => {
      expect(screen.getByTestId('topic-card-top-1')).toBeInTheDocument();
    });

    expect(screen.getByText('Upper Limb')).toBeInTheDocument();
    expect(screen.getByText('Anatomy')).toBeInTheDocument();
    expect(screen.getByText('3 Articles')).toBeInTheDocument();
  });

  it('renders empty state when no topics are available', async () => {
    (TopicsApiClient.getTopics as any).mockResolvedValue({ data: [] });
    (SubjectsApiClient.getSubjects as any).mockResolvedValue({ data: [] });

    render(<TopicList onSelectTopic={mockOnSelectTopic} />);

    await waitFor(() => {
      expect(screen.getByTestId('topic-empty-state')).toBeInTheDocument();
    });

    expect(screen.getByText('No Topics Found')).toBeInTheDocument();
  });

  it('renders error state and retries on button click', async () => {
    (TopicsApiClient.getTopics as any).mockRejectedValueOnce(new Error('Network error'));
    (SubjectsApiClient.getSubjects as any).mockRejectedValueOnce(new Error('Network error'));

    render(<TopicList onSelectTopic={mockOnSelectTopic} />);

    await waitFor(() => {
      expect(screen.getByTestId('topic-error-state')).toBeInTheDocument();
    });

    (TopicsApiClient.getTopics as any).mockResolvedValueOnce({ data: mockTopics });
    (SubjectsApiClient.getSubjects as any).mockResolvedValueOnce({ data: mockSubjects });

    fireEvent.click(screen.getByTestId('retry-topics-button'));

    await waitFor(() => {
      expect(screen.getByText('Upper Limb')).toBeInTheDocument();
    });
  });

  it('triggers onSelectTopic when a topic card is clicked', async () => {
    (TopicsApiClient.getTopics as any).mockResolvedValue({ data: mockTopics });
    (SubjectsApiClient.getSubjects as any).mockResolvedValue({ data: mockSubjects });

    render(<TopicList onSelectTopic={mockOnSelectTopic} />);

    await waitFor(() => {
      expect(screen.getByTestId('topic-card-top-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('topic-card-top-1'));
    expect(mockOnSelectTopic).toHaveBeenCalledWith('anatomy', 'upper-limb');
  });
});

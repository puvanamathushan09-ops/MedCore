import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SubjectDetail } from '../SubjectDetail';
import { SubjectsApiClient } from '../../../../src/client/api/subjects.api';
import { TopicsApiClient } from '../../../../src/client/api/topics.api';
import { ArticlesApiClient } from '../../../../src/client/api/articles.api';
import type { Subject } from '../../../../src/client/types/subject.types';
import type { Topic } from '../../../../src/client/types/topic.types';
import type { Article } from '../../../../src/client/types/article.types';

vi.mock('../../../../src/client/api/subjects.api', () => ({
  SubjectsApiClient: {
    getSubjectBySlug: vi.fn(),
  },
}));

vi.mock('../../../../src/client/api/topics.api', () => ({
  TopicsApiClient: {
    getTopics: vi.fn(),
  },
}));

vi.mock('../../../../src/client/api/articles.api', () => ({
  ArticlesApiClient: {
    getArticles: vi.fn(),
  },
}));

describe('SubjectDetail Component', () => {
  const mockOnSelectTopic = vi.fn();
  const mockOnArticleClick = vi.fn();
  const mockOnBackToSubjects = vi.fn();

  const mockSubject: Subject = {
    id: 'sub-1',
    title: 'Anatomy',
    slug: 'anatomy',
    description: 'Study of body structures.',
    orderIndex: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

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
    },
    {
      id: 'top-2',
      subjectId: 'sub-1',
      title: 'Thorax',
      slug: 'thorax',
      description: 'Chest anatomy',
      orderIndex: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockArticles: Article[] = [
    {
      id: 'art-1',
      title: 'Brachial Plexus Anatomy',
      slug: 'brachial-plexus-anatomy',
      summary: 'Summary of brachial plexus',
      content: 'Detailed content on brachial plexus',
      status: 'PUBLISHED',
      authorId: 'auth-1',
      subjectId: 'sub-1',
      topicId: 'top-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subject: { id: 'sub-1', title: 'Anatomy', slug: 'anatomy' },
      topic: { id: 'top-1', subjectId: 'sub-1', title: 'Upper Limb', slug: 'upper-limb' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton while subject is fetching', () => {
    (SubjectsApiClient.getSubjectBySlug as any).mockReturnValue(new Promise(() => {}));
    render(
      <SubjectDetail
        subjectSlug="anatomy"
        onSelectTopic={mockOnSelectTopic}
        onArticleClick={mockOnArticleClick}
        onBackToSubjects={mockOnBackToSubjects}
      />,
    );

    expect(screen.getByTestId('subject-detail-loading')).toBeInTheDocument();
  });

  it('renders subject header, topic pills, and article grid upon loading', async () => {
    (SubjectsApiClient.getSubjectBySlug as any).mockResolvedValue(mockSubject);
    (TopicsApiClient.getTopics as any).mockResolvedValue({ data: mockTopics });
    (ArticlesApiClient.getArticles as any).mockResolvedValue({
      data: mockArticles,
      meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
    });

    render(
      <SubjectDetail
        subjectSlug="anatomy"
        onSelectTopic={mockOnSelectTopic}
        onArticleClick={mockOnArticleClick}
        onBackToSubjects={mockOnBackToSubjects}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Anatomy' })).toBeInTheDocument();
      expect(screen.getByTestId('topic-pill-upper-limb')).toBeInTheDocument();
      expect(screen.getByTestId('topic-pill-thorax')).toBeInTheDocument();
      expect(screen.getByText('Brachial Plexus Anatomy')).toBeInTheDocument();
    });
  });

  it('filters by topic when a topic pill is clicked', async () => {
    (SubjectsApiClient.getSubjectBySlug as any).mockResolvedValue(mockSubject);
    (TopicsApiClient.getTopics as any).mockResolvedValue({ data: mockTopics });
    (ArticlesApiClient.getArticles as any).mockResolvedValue({
      data: mockArticles,
      meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
    });

    render(
      <SubjectDetail
        subjectSlug="anatomy"
        onSelectTopic={mockOnSelectTopic}
        onArticleClick={mockOnArticleClick}
        onBackToSubjects={mockOnBackToSubjects}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('topic-pill-upper-limb')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('topic-pill-upper-limb'));
    expect(mockOnSelectTopic).toHaveBeenCalledWith('anatomy', 'upper-limb');
  });

  it('renders empty state when no articles match topic', async () => {
    (SubjectsApiClient.getSubjectBySlug as any).mockResolvedValue(mockSubject);
    (TopicsApiClient.getTopics as any).mockResolvedValue({ data: mockTopics });
    (ArticlesApiClient.getArticles as any).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
    });

    render(
      <SubjectDetail
        subjectSlug="anatomy"
        topicSlug="thorax"
        onSelectTopic={mockOnSelectTopic}
        onArticleClick={mockOnArticleClick}
        onBackToSubjects={mockOnBackToSubjects}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('topic-empty-articles')).toBeInTheDocument();
    });

    expect(screen.getByText('No Articles Found')).toBeInTheDocument();
  });

  it('triggers back to subjects when breadcrumb is clicked', async () => {
    (SubjectsApiClient.getSubjectBySlug as any).mockResolvedValue(mockSubject);
    (TopicsApiClient.getTopics as any).mockResolvedValue({ data: mockTopics });
    (ArticlesApiClient.getArticles as any).mockResolvedValue({ data: [], meta: { total: 0 } });

    render(
      <SubjectDetail
        subjectSlug="anatomy"
        onSelectTopic={mockOnSelectTopic}
        onArticleClick={mockOnArticleClick}
        onBackToSubjects={mockOnBackToSubjects}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('back-to-subjects-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('back-to-subjects-btn'));
    expect(mockOnBackToSubjects).toHaveBeenCalled();
  });
});

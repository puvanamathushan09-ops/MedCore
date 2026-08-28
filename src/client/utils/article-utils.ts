import type { Article, QueryArticleParams } from '../types/article.types';

export const formatDate = (dateValue?: string | Date | null): string => {
  if (!dateValue) return 'Draft';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getAuthorDisplayName = (article: Article): string => {
  if (article.author) {
    const fullName = `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim();
    if (fullName) return fullName;
    if (article.author.email) return article.author.email;
  }
  return 'MedCore Editorial';
};

export const buildQueryArticleParams = (
  search: string,
  subjectId: string,
  topicId: string,
  page: number = 1,
  limit: number = 12,
): QueryArticleParams => {
  const params: QueryArticleParams = {
    page,
    limit,
  };

  if (search.trim()) {
    params.search = search.trim();
  }
  if (subjectId.trim()) {
    params.subjectId = subjectId.trim();
  }
  if (topicId.trim()) {
    params.topicId = topicId.trim();
  }

  return params;
};

import { Article } from '../types/article.types';
import {
  formatDate,
  getAuthorDisplayName,
  buildQueryArticleParams,
} from '../utils/article-utils';

describe('ArticleList UI Logic & Formatting Unit Tests', () => {
  const sampleArticle: Article = {
    id: 'art-100',
    title: 'Clinical Assessment of Cardiac Arrhythmia',
    slug: 'clinical-assessment-cardiac-arrhythmia',
    content: 'Full clinical guideline body text...',
    summary: 'Comprehensive overview of diagnosing and managing cardiac arrhythmias.',
    featuredImageUrl: 'https://example.com/cardiac.png',
    status: 'PUBLISHED',
    publishedAt: '2026-05-15T10:00:00.000Z',
    createdAt: '2026-05-10T10:00:00.000Z',
    updatedAt: '2026-05-15T10:00:00.000Z',
    authorId: 'auth-1',
    subjectId: 'sub-cardiology',
    topicId: 'top-arrhythmia',
    author: {
      id: 'auth-1',
      email: 'dr.smith@medcore.org',
      firstName: 'Sarah',
      lastName: 'Smith',
    },
    subject: {
      id: 'sub-cardiology',
      title: 'Cardiology',
      slug: 'cardiology',
    },
    topic: {
      id: 'top-arrhythmia',
      subjectId: 'sub-cardiology',
      title: 'Arrhythmias',
      slug: 'arrhythmias',
    },
  };

  describe('formatDate', () => {
    it('should format ISO date strings into readable month, day, year format', () => {
      const formatted = formatDate('2026-05-15T10:00:00.000Z');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('May');
    });

    it('should return "Draft" for null or undefined date values', () => {
      expect(formatDate(null)).toBe('Draft');
      expect(formatDate(undefined)).toBe('Draft');
    });

    it('should return "Invalid Date" for unparseable date strings', () => {
      expect(formatDate('not-a-valid-date')).toBe('Invalid Date');
    });
  });

  describe('getAuthorDisplayName', () => {
    it('should combine firstName and lastName when author object exists', () => {
      const authorName = getAuthorDisplayName(sampleArticle);
      expect(authorName).toBe('Sarah Smith');
    });

    it('should fallback to email if firstName and lastName are missing', () => {
      const articleWithEmailOnly: Article = {
        ...sampleArticle,
        author: {
          id: 'auth-2',
          email: 'editor@medcore.org',
          firstName: '',
          lastName: '',
        },
      };
      expect(getAuthorDisplayName(articleWithEmailOnly)).toBe('editor@medcore.org');
    });

    it('should fallback to default editorial team if author object is undefined', () => {
      const articleNoAuthor: Article = {
        ...sampleArticle,
        author: undefined,
      };
      expect(getAuthorDisplayName(articleNoAuthor)).toBe('MedCore Editorial');
    });
  });

  describe('buildQueryArticleParams', () => {
    it('should construct valid QueryArticleParams with search and subjectId filters', () => {
      const search = 'cardiac';
      const subjectId = 'sub-cardiology';
      const topicId = 'top-arrhythmia';

      const params = buildQueryArticleParams(search, subjectId, topicId, 1, 12);

      expect(params).toEqual({
        page: 1,
        limit: 12,
        search: 'cardiac',
        subjectId: 'sub-cardiology',
        topicId: 'top-arrhythmia',
      });
    });

    it('should exclude empty strings or whitespace-only search and filter values', () => {
      const search = '   ';
      const subjectId = '';
      const topicId = '  ';

      const params = buildQueryArticleParams(search, subjectId, topicId, 1, 12);

      expect(params).toEqual({
        page: 1,
        limit: 12,
      });
    });
  });
});

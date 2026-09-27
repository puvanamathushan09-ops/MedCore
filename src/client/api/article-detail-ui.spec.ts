import { ArticlesApiClient } from './articles.api';
import { Article } from '../types/article.types';
import {
  formatDate,
  getAuthorDisplayName,
  parsePlainTextParagraphs,
  getSlugFromUrl,
} from '../utils/article-utils';

describe('ArticleDetail UI Logic & Data Unit Tests', () => {
  const mockSlug = 'understanding-appendicitis';
  const mockArticle: Article = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Understanding Appendicitis',
    slug: 'understanding-appendicitis',
    content: 'Paragraph 1: Overview of inflammation of the appendix.\n\nParagraph 2: Common symptoms include acute lower right abdominal pain, fever, and nausea.',
    summary: 'Clinical summary of acute appendicitis diagnosis and surgical intervention.',
    featuredImageUrl: 'https://example.com/appendicitis.png',
    status: 'PUBLISHED',
    publishedAt: '2026-06-01T12:00:00.000Z',
    createdAt: '2026-05-25T12:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
    authorId: '11111111-1111-1111-1111-111111111111',
    author: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'dr.johnson@medcore.org',
      firstName: 'Robert',
      lastName: 'Johnson',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Article API Data Fetching', () => {
    it('should successfully retrieve article by slug using ArticlesApiClient.getArticleBySlug', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockArticle),
      } as any);

      const result = await ArticlesApiClient.getArticleBySlug(mockSlug);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/articles/slug/understanding-appendicitis',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(mockArticle);
      expect(result.title).toBe('Understanding Appendicitis');
      expect(result.summary).toBe('Clinical summary of acute appendicitis diagnosis and surgical intervention.');
      expect(result.featuredImageUrl).toBe('https://example.com/appendicitis.png');
      expect(result.content).toContain('Paragraph 1');
      expect(result.author?.firstName).toBe('Robert');
    });

    it('should throw ApiClientError when article slug is not found (404)', async () => {
      const errorResponse = {
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: '/articles/slug/non-existent-slug',
        error: {
          message: 'Article with slug "non-existent-slug" not found',
          error: 'Not Found',
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue(errorResponse),
      } as any);

      await expect(ArticlesApiClient.getArticleBySlug('non-existent-slug')).rejects.toThrow();
    });
  });

  describe('Plain Text Content Paragraph Parsing', () => {
    it('should split plain text content by double newlines into separate paragraphs', () => {
      const paragraphs = parsePlainTextParagraphs(mockArticle.content);

      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0]).toBe('Paragraph 1: Overview of inflammation of the appendix.');
      expect(paragraphs[1]).toBe(
        'Paragraph 2: Common symptoms include acute lower right abdominal pain, fever, and nausea.',
      );
    });

    it('should handle empty or null content safely without throwing errors', () => {
      expect(parsePlainTextParagraphs('')).toEqual([]);
      expect(parsePlainTextParagraphs(null)).toEqual([]);
      expect(parsePlainTextParagraphs(undefined)).toEqual([]);
    });

    it('should treat HTML tags as plain text without rendering or stripping them', () => {
      const rawTextWithTags = '<div>Plain text block</div>\n\n<p>Second block</p>';
      const paragraphs = parsePlainTextParagraphs(rawTextWithTags);

      expect(paragraphs).toEqual(['<div>Plain text block</div>', '<p>Second block</p>']);
    });
  });

  describe('Article Detail Metadata Formatting', () => {
    it('should extract author full name and avatarUrl correctly', () => {
      expect(getAuthorDisplayName(mockArticle)).toBe('Robert Johnson');
      expect(mockArticle.author?.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should format published date cleanly for display', () => {
      const formatted = formatDate(mockArticle.publishedAt);
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Jun');
    });
  });

  describe('URL Navigation Slug Parser', () => {
    it('should extract article slug from pathname "/articles/:slug"', () => {
      const slug = getSlugFromUrl('/articles/understanding-appendicitis');
      expect(slug).toBe('understanding-appendicitis');
    });

    it('should return null when pathname is root "/" or does not start with "/articles/"', () => {
      expect(getSlugFromUrl('/')).toBeNull();
      expect(getSlugFromUrl('/subjects')).toBeNull();
    });
  });
});

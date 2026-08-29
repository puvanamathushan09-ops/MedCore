import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseRoute, pushRoute } from '../route-utils';

describe('route-utils', () => {
  describe('parseRoute', () => {
    it('parses article detail URLs correctly', () => {
      const route = parseRoute('/articles/anatomical-terminology');
      expect(route).toEqual({
        type: 'article-detail',
        slug: 'anatomical-terminology',
      });
    });

    it('parses subject detail with topic URLs correctly', () => {
      const route = parseRoute('/subjects/anatomy/topics/upper-limb');
      expect(route).toEqual({
        type: 'subject-detail',
        subjectSlug: 'anatomy',
        topicSlug: 'upper-limb',
      });
    });

    it('parses subject detail URLs correctly', () => {
      const route = parseRoute('/subjects/anatomy');
      expect(route).toEqual({
        type: 'subject-detail',
        subjectSlug: 'anatomy',
      });
    });

    it('parses subject list URL correctly', () => {
      const route = parseRoute('/subjects');
      expect(route).toEqual({ type: 'subject-list' });
    });

    it('parses topics list URL correctly', () => {
      const route = parseRoute('/topics');
      expect(route).toEqual({ type: 'topic-list' });
    });

    it('defaults to article list for home / root path', () => {
      const route = parseRoute('/');
      expect(route).toEqual({ type: 'article-list' });
    });

    it('defaults to article list for /articles path', () => {
      const route = parseRoute('/articles');
      expect(route).toEqual({ type: 'article-list' });
    });
  });

  describe('pushRoute', () => {
    beforeEach(() => {
      vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
      vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });

    it('invokes window.history.pushState and scrolls to top', () => {
      pushRoute('/subjects/anatomy');
      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/subjects/anatomy');
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });
});

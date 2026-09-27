import { ArticlesApiClient } from './articles.api';
import { buildQueryArticleParams } from '../utils/article-utils';

describe('Article Filter & Search Integration Unit Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Article Search Query Building', () => {
    it('should construct valid QueryArticleParams when search term is provided', () => {
      const search = 'angina';
      const page = 1;
      const limit = 12;

      const params = buildQueryArticleParams(search, page, limit);

      expect(params).toEqual({
        search: 'angina',
        page: 1,
        limit: 12,
      });
    });

    it('should exclude search parameter when search term is empty or reset', () => {
      const params = buildQueryArticleParams('', 1, 12);

      expect(params).toEqual({
        page: 1,
        limit: 12,
      });
      expect(params.search).toBeUndefined();
    });

    it('should trim search term whitespace', () => {
      const params = buildQueryArticleParams('  hypertension  ', 2, 10);

      expect(params).toEqual({
        search: 'hypertension',
        page: 2,
        limit: 10,
      });
    });
  });

  describe('Articles API Search Integration', () => {
    it('should send GET /articles with search and pagination query params to backend', async () => {
      const mockArticleResponse = {
        data: [],
        meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockArticleResponse),
      } as any);

      const params = buildQueryArticleParams('hypertension', 1, 12);

      await ArticlesApiClient.getArticles(params);

      const expectedUrl =
        'http://localhost:3000/articles?page=1&limit=12&search=hypertension';

      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });
});

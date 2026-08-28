import { SubjectsApiClient } from './subjects.api';
import { TopicsApiClient } from './topics.api';
import { ArticlesApiClient } from './articles.api';
import { buildQueryArticleParams } from '../utils/article-utils';

describe('Article Filter & Subject/Topic Integration Unit Tests', () => {
  const mockSubject = {
    id: 'sub-cardiology-111',
    title: 'Cardiology',
    slug: 'cardiology',
    orderIndex: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockTopic = {
    id: 'top-arrhythmia-222',
    subjectId: 'sub-cardiology-111',
    parentId: null,
    title: 'Arrhythmias',
    slug: 'arrhythmias',
    orderIndex: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Subject & Topic Data Fetching Integration', () => {
    it('should fetch list of all subjects for filter dropdown', async () => {
      const mockSubjectResponse = {
        data: [mockSubject],
        meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockSubjectResponse),
      } as any);

      const result = await SubjectsApiClient.getSubjects({ limit: 100 });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/subjects?limit=100',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Cardiology');
    });

    it('should fetch topics filtered by subjectId when subject is selected', async () => {
      const mockTopicResponse = {
        data: [mockTopic],
        meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockTopicResponse),
      } as any);

      const result = await TopicsApiClient.getTopics({
        subjectId: 'sub-cardiology-111',
        limit: 100,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/topics?subjectId=sub-cardiology-111&limit=100',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.data[0].subjectId).toBe('sub-cardiology-111');
      expect(result.data[0].title).toBe('Arrhythmias');
    });
  });

  describe('Filter State Cascade Logic', () => {
    it('should construct valid QueryArticleParams when both subjectId and topicId are selected', () => {
      const search = 'angina';
      const subjectId = 'sub-cardiology-111';
      const topicId = 'top-arrhythmia-222';
      const page = 1;

      const params = buildQueryArticleParams(search, subjectId, topicId, page, 12);

      expect(params).toEqual({
        search: 'angina',
        subjectId: 'sub-cardiology-111',
        topicId: 'top-arrhythmia-222',
        page: 1,
        limit: 12,
      });
    });

    it('should clear topicId and exclude topicId parameter when subjectId is changed or reset', () => {
      const search = 'angina';
      const newSubjectId = 'sub-neurology-333';
      const clearedTopicId = '';
      const page = 1;

      const params = buildQueryArticleParams(search, newSubjectId, clearedTopicId, page, 12);

      expect(params).toEqual({
        search: 'angina',
        subjectId: 'sub-neurology-333',
        page: 1,
        limit: 12,
      });
      expect(params.topicId).toBeUndefined();
    });

    it('should exclude empty filter parameters when all filters are cleared', () => {
      const params = buildQueryArticleParams('', '', '', 1, 12);

      expect(params).toEqual({
        page: 1,
        limit: 12,
      });
      expect(params.search).toBeUndefined();
      expect(params.subjectId).toBeUndefined();
      expect(params.topicId).toBeUndefined();
    });
  });

  describe('Articles API Filter Integration', () => {
    it('should send GET /articles with subjectId and topicId query params to backend', async () => {
      const mockArticleResponse = {
        data: [],
        meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockArticleResponse),
      } as any);

      const params = buildQueryArticleParams(
        'hypertension',
        'sub-cardiology-111',
        'top-arrhythmia-222',
        1,
        12,
      );

      await ArticlesApiClient.getArticles(params);

      const expectedUrl =
        'http://localhost:3000/articles?page=1&limit=12&search=hypertension&subjectId=sub-cardiology-111&topicId=top-arrhythmia-222';

      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });
});

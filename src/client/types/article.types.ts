export type ArticleStatus = 'DRAFT' | 'PUBLISHED';
export type UserRole = 'STUDENT' | 'MEDICAL_REVIEWER' | 'ADMIN';

export interface AuthorSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface SubjectSummary {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  orderIndex?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TopicSummary {
  id: string;
  subjectId: string;
  parentId?: string | null;
  title: string;
  slug: string;
  description?: string | null;
  orderIndex?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  featuredImageUrl?: string | null;
  status: ArticleStatus;
  publishedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  authorId: string;
  subjectId: string;
  topicId?: string | null;
  author?: AuthorSummary;
  subject?: SubjectSummary;
  topic?: TopicSummary | null;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  summary?: string;
  featuredImageUrl?: string;
  status?: ArticleStatus;
  subjectId?: string;
  topicId?: string;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  summary?: string;
  featuredImageUrl?: string;
  status?: ArticleStatus;
  subjectId?: string;
  topicId?: string;
}

export interface QueryArticleParams {
  subjectId?: string;
  topicId?: string;
  status?: ArticleStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ArticleListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArticleListResponse {
  data: Article[];
  meta: ArticleListMeta;
}

export interface ApiErrorDetail {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  error: ApiErrorDetail | string;
}

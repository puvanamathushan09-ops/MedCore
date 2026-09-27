export type ArticleStatus = 'DRAFT' | 'PUBLISHED';
export type UserRole = 'STUDENT' | 'MEDICAL_REVIEWER' | 'ADMIN';

export interface AuthorSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
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
  author?: AuthorSummary;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  summary?: string;
  featuredImageUrl?: string;
  status?: ArticleStatus;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  summary?: string;
  featuredImageUrl?: string;
  status?: ArticleStatus;
}

export interface QueryArticleParams {
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

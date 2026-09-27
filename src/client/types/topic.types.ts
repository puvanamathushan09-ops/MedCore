import type { SubjectSummary } from './subject.types';

export interface TopicCountSummary {
  articles?: number;
  children?: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  parentId?: string | null;
  title: string;
  slug: string;
  description?: string | null;
  orderIndex: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  subject?: SubjectSummary;
  parent?: Topic | null;
  children?: Topic[];
  _count?: TopicCountSummary;
}

export interface CreateTopicInput {
  subjectId: string;
  parentId?: string;
  title: string;
  slug?: string;
  description?: string;
  orderIndex?: number;
}

export interface UpdateTopicInput {
  subjectId?: string;
  parentId?: string;
  title?: string;
  slug?: string;
  description?: string;
  orderIndex?: number;
}

export interface QueryTopicParams {
  subjectId?: string;
  parentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TopicListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TopicListResponse {
  data: Topic[];
  meta: TopicListMeta;
}

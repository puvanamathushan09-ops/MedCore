export interface SubjectCountSummary {
  topics?: number;
  articles?: number;
}

export interface Subject {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  orderIndex: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  topics?: any[];
  _count?: SubjectCountSummary;
}

export interface CreateSubjectInput {
  title: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  orderIndex?: number;
}

export interface UpdateSubjectInput {
  title?: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  orderIndex?: number;
}

export interface QuerySubjectParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface SubjectListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubjectListResponse {
  data: Subject[];
  meta: SubjectListMeta;
}

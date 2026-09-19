export interface QuizOption {
  id: string;
  optionText: string;
  orderIndex: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  explanation?: string | null;
  orderIndex: number;
  options: QuizOption[];
}

export interface QuizSubjectSummary {
  id: string;
  title: string;
}

export interface QuizTopicSummary {
  id: string;
  title: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  subjectId: string;
  topicId?: string | null;
  isPublished: boolean;
  createdById: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  subject?: QuizSubjectSummary;
  topic?: QuizTopicSummary | null;
  questions: QuizQuestion[];
}

export interface CreateQuizOptionInput {
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface CreateQuizQuestionInput {
  question: string;
  explanation?: string;
  orderIndex?: number;
  options: CreateQuizOptionInput[];
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  subjectId: string;
  topicId?: string;
  questions: CreateQuizQuestionInput[];
}

export type UpdateQuizInput = Partial<CreateQuizInput>;

export interface SubmitQuizAnswerInput {
  questionId: string;
  optionId?: string;
}

export interface SubmitQuizInput {
  answers: SubmitQuizAnswerInput[];
}

export interface QuizAnswerResult {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
}

export interface QuizSubmitResult {
  attemptId: string;
  score: number;
  total: number;
  percentage: number;
  results?: QuizAnswerResult[];
}

export interface QuizAttemptHistoryItem {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  subject: {
    id: string;
    name: string;
  };
  topic: {
    id: string;
    name: string;
  } | null;
  score: number;
  total: number;
  percentage: number;
  completedAt: string | Date;
}

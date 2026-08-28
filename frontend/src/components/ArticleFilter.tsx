import React from 'react';
import type { Subject } from '../../../src/client/types/subject.types';
import type { Topic } from '../../../src/client/types/topic.types';

export interface ArticleFilterProps {
  search: string;
  subjectId: string;
  topicId: string;
  subjects: Subject[];
  topics: Topic[];
  loadingSubjects?: boolean;
  loadingTopics?: boolean;
  onSearchChange: (value: string) => void;
  onSubjectIdChange: (value: string) => void;
  onTopicIdChange: (value: string) => void;
  onResetFilters: () => void;
}

export const ArticleFilter: React.FC<ArticleFilterProps> = ({
  search,
  subjectId,
  topicId,
  subjects,
  topics,
  loadingSubjects = false,
  loadingTopics = false,
  onSearchChange,
  onSubjectIdChange,
  onTopicIdChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(search || subjectId || topicId);

  return (
    <div className="medcore-filter-bar">
      {/* Search Input */}
      <div className="filter-group search-group">
        <label htmlFor="article-search" className="filter-label">
          Search Articles
        </label>
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="article-search"
            type="text"
            className="filter-input search-input"
            placeholder="Search by title or keyword..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search ? (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          ) : null}
        </div>
      </div>

      {/* Subject Dropdown */}
      <div className="filter-group">
        <label htmlFor="subject-filter" className="filter-label">
          Subject {loadingSubjects ? '(Loading...)' : ''}
        </label>
        <select
          id="subject-filter"
          className="filter-input filter-select"
          value={subjectId}
          disabled={loadingSubjects}
          onChange={(e) => onSubjectIdChange(e.target.value)}
          data-testid="subject-select"
        >
          <option value="">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.title}
            </option>
          ))}
        </select>
      </div>

      {/* Topic Dropdown */}
      <div className="filter-group">
        <label htmlFor="topic-filter" className="filter-label">
          Topic {loadingTopics ? '(Loading...)' : ''}
        </label>
        <select
          id="topic-filter"
          className="filter-input filter-select"
          value={topicId}
          disabled={!subjectId || loadingTopics}
          onChange={(e) => onTopicIdChange(e.target.value)}
          data-testid="topic-select"
        >
          {!subjectId ? (
            <option value="">Select a subject first...</option>
          ) : (
            <option value="">All Topics</option>
          )}
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Filters Button */}
      {hasActiveFilters ? (
        <div className="filter-group reset-group">
          <button
            type="button"
            className="btn btn-secondary reset-btn"
            onClick={onResetFilters}
            data-testid="reset-filters-btn"
          >
            Reset Filters
          </button>
        </div>
      ) : null}
    </div>
  );
};

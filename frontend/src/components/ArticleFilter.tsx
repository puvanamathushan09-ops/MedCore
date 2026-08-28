import React from 'react';

export interface ArticleFilterProps {
  search: string;
  subjectId: string;
  topicId: string;
  onSearchChange: (value: string) => void;
  onSubjectIdChange: (value: string) => void;
  onTopicIdChange: (value: string) => void;
  onResetFilters: () => void;
}

export const ArticleFilter: React.FC<ArticleFilterProps> = ({
  search,
  subjectId,
  topicId,
  onSearchChange,
  onSubjectIdChange,
  onTopicIdChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(search || subjectId || topicId);

  return (
    <div className="medcore-filter-bar">
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

      <div className="filter-group">
        <label htmlFor="subject-filter" className="filter-label">
          Subject ID
        </label>
        <input
          id="subject-filter"
          type="text"
          className="filter-input"
          placeholder="Filter by Subject UUID..."
          value={subjectId}
          onChange={(e) => onSubjectIdChange(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="topic-filter" className="filter-label">
          Topic ID
        </label>
        <input
          id="topic-filter"
          type="text"
          className="filter-input"
          placeholder="Filter by Topic UUID..."
          value={topicId}
          onChange={(e) => onTopicIdChange(e.target.value)}
        />
      </div>

      {hasActiveFilters ? (
        <div className="filter-group reset-group">
          <button
            type="button"
            className="btn btn-secondary reset-btn"
            onClick={onResetFilters}
          >
            Reset Filters
          </button>
        </div>
      ) : null}
    </div>
  );
};

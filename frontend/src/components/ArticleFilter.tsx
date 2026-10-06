import React from 'react';

export interface ArticleFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
}

export const ArticleFilter: React.FC<ArticleFilterProps> = ({
  search,
  onSearchChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(search);

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
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#64748b"
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
            placeholder="Search clinical guides by title or keyword..."
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

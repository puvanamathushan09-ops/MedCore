import React, { useState, useEffect, useCallback } from 'react';
import { SubjectsApiClient } from '../../../src/client/api/subjects.api';
import type { Subject } from '../../../src/client/types/subject.types';
import './SubjectList.css';

export interface SubjectListProps {
  onSelectSubject: (subject: Subject) => void;
}

export const SubjectList: React.FC<SubjectListProps> = ({ onSelectSubject }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await SubjectsApiClient.getSubjects({ limit: 100 });
      setSubjects(response.data || []);
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to load medical subjects. Please check your network connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredSubjects = subjects.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const getSpecialtyIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('cardio') || lower.includes('heart') || lower.includes('vascular')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" className="subject-specialty-svg">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          <path d="M3.5 12h3l2-4 3 8 2-4h7" />
        </svg>
      );
    }
    if (lower.includes('neuro') || lower.includes('brain') || lower.includes('spine')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" className="subject-specialty-svg">
          <path d="M12 2a4 4 0 0 0-4 4c0 1.1.45 2.1 1.17 2.83L6.5 11.5a3.5 3.5 0 0 0 0 5l4.5 4.5 4.5-4.5a3.5 3.5 0 0 0 0-5l-2.67-2.67C13.55 8.1 14 7.1 14 6a4 4 0 0 0-4-4z" />
          <path d="M9 14l3-3 3 3" />
        </svg>
      );
    }
    if (lower.includes('anat') || lower.includes('thorax') || lower.includes('bone') || lower.includes('limb')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" className="subject-specialty-svg">
          <path d="M12 3v18M7 7h10M6 12h12M7 17h10" />
        </svg>
      );
    }
    if (lower.includes('surg') || lower.includes('operat')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="subject-specialty-svg">
          <line x1="6" y1="18" x2="18" y2="6" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
        </svg>
      );
    }
    if (lower.includes('pediat') || lower.includes('child')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" className="subject-specialty-svg">
          <circle cx="12" cy="7" r="4" />
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="#154734" strokeWidth="2" className="subject-specialty-svg">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    );
  };

  return (
    <div className="medcore-specialties-page-wrapper">
      {/* HERO SECTION */}
      <section className="specialties-hero-section">
        <div
          className="specialties-hero-bg-image"
          style={{ backgroundImage: "url('/images/neuro-brain.jpg')" }}
        />
        <div className="specialties-hero-scenic-overlay" />
        <div className="specialties-hero-wave-bg">
          <svg className="specialties-organic-wave" viewBox="0 0 1440 180" fill="none" preserveAspectRatio="none">
            <path
              d="M0,80 C320,160 540,20 900,100 C1200,160 1360,60 1440,110 L1440,180 L0,180 Z"
              fill="#fafaf7"
            />
          </svg>
        </div>

        <div className="specialties-hero-container">
          <div className="specialties-hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>CLINICAL CURRICULUM · MEDICAL SPECIALTIES</span>
          </div>

          <h1 className="specialties-hero-title">
            Medical Specialties &amp; Anatomical Systems
          </h1>

          <p className="specialties-hero-subtitle">
            Explore accredited modules, high-yield clinical pearls, surgical landmarks, and diagnostic algorithms organized systematically by medical discipline.
          </p>

          <div className="specialties-search-pill-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter specialties (e.g., Cardiology, Neurology, Anatomy)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="specialties-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="medcore-subject-list-container">

      {/* ERROR STATE */}
      {error && !loading ? (
        <div className="state-card error-state" data-testid="subject-error-state">
          <div className="error-icon-wrapper">
            <svg
              className="error-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="error-title">Unable to Load Subjects</h3>
          <p className="error-message">{error}</p>
          <button
            type="button"
            className="btn btn-primary retry-btn"
            onClick={fetchSubjects}
            data-testid="retry-subjects-button"
          >
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Retry
          </button>
        </div>
      ) : null}

      {/* LOADING STATE */}
      {loading ? (
        <div className="subject-grid-skeleton" data-testid="subject-loading-state">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-subject-card">
              <div className="skeleton-subject-icon" />
              <div className="skeleton-subject-body">
                <div className="skeleton-title" />
                <div className="skeleton-text" />
                <div className="skeleton-text short" />
                <div className="skeleton-meta" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* EMPTY STATE */}
      {!loading && !error && subjects.length === 0 ? (
        <div className="state-card empty-state" data-testid="subject-empty-state">
          <div className="empty-icon-wrapper">
            <svg
              className="empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h3 className="empty-title">No Subjects Found</h3>
          <p className="empty-message">There are currently no medical subjects available in the platform.</p>
        </div>
      ) : null}

      {/* SUBJECT GRID */}
      {!loading && !error && filteredSubjects.length > 0 ? (
        <div className="subject-grid" data-testid="subject-grid">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="medcore-subject-card"
              onClick={() => onSelectSubject(subject)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSubject(subject);
                }
              }}
              data-testid={`subject-card-${subject.id}`}
            >
              <div className="subject-card-header">
                <div className="subject-icon-box">
                  {subject.iconUrl ? (
                    <img src={subject.iconUrl} alt={subject.title} className="subject-custom-icon" />
                  ) : (
                    getSpecialtyIcon(subject.title)
                  )}
                </div>
                <div className="subject-badge-pill">Clinical Specialty</div>
              </div>

              <h3 className="subject-card-title">{subject.title}</h3>

              <p className="subject-card-description">
                {subject.description || `Explore topics, anatomical structures, and clinical principles in ${subject.title}.`}
              </p>

              <div className="subject-card-footer">
                <span className="subject-topic-count">
                  <svg
                    className="meta-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  {subject._count?.topics !== undefined
                    ? `${subject._count.topics} ${subject._count.topics === 1 ? 'Topic' : 'Topics'}`
                    : 'Explore Topics'}
                </span>
                <span className="subject-explore-link">
                  <span>Explore Curriculum</span>
                  <svg
                    className="arrow-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  </div>
  );
};

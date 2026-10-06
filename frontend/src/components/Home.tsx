import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArticlesApiClient } from '../../../src/client/api/articles.api';
import { SubjectsApiClient } from '../../../src/client/api/subjects.api';
import type { Article } from '../../../src/client/types/article.types';
import type { Subject } from '../../../src/client/types/subject.types';
import './Home.css';

export interface HomeProps {
  onNavigateToArticles: () => void;
  onNavigateToArticleDetail: (article: Article) => void;
  onNavigateToSubjects: () => void;
  onNavigateToSubjectDetail: (subject: Subject) => void;
  onNavigateToQuizzes: () => void;
  onNavigateToAbout: () => void;
  onNavigateToContact: () => void;
  onSearchSubmit?: (searchTerm: string) => void;
}

// Type-safe reference to HTML marquee element
const MarqueeElement = 'marquee' as unknown as React.ElementType;

export const Home: React.FC<HomeProps> = ({
  onNavigateToArticles,
  onNavigateToArticleDetail,
  onNavigateToSubjects,
  onNavigateToSubjectDetail,
  onNavigateToQuizzes,
  onNavigateToAbout,
  onNavigateToContact,
  onSearchSubmit,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search widget state
  const [searchTopic, setSearchTopic] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Hero Slideshow state & auto-advance
  const [heroSlide, setHeroSlide] = useState<number>(0);
  const [isHeroHovered, setIsHeroHovered] = useState<boolean>(false);

  // Popular Cards Carousel slider ref & auto-slide state
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState<boolean>(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      ArticlesApiClient.getArticles({ page: 1, limit: 16 }),
      SubjectsApiClient.getSubjects(),
    ])
      .then(([articlesRes, subjectsRes]) => {
        if (!isMounted) return;
        setArticles(articlesRes.data || []);
        setSubjects(subjectsRes.data || []);
      })
      .catch((err) => {
        console.error('Failed to load home page data', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Top Viewed Articles
  const topViewedArticles = useMemo(() => {
    if (articles.length === 0) return [];
    const prioritized = [...articles].sort((a, b) => {
      const isAHighYield = /heart|cardio|brachial|thorac|sepsis/i.test(a.title);
      const isBHighYield = /heart|cardio|brachial|thorac|sepsis/i.test(b.title);
      if (isAHighYield && !isBHighYield) return -1;
      if (!isAHighYield && isBHighYield) return 1;
      return (b.content?.length || 0) - (a.content?.length || 0);
    });
    return prioritized.slice(0, 6);
  }, [articles]);

  const handleSelectSpecialtyPill = (keyword: string) => {
    const match = subjects.find(
      (s) =>
        s.slug?.toLowerCase().includes(keyword.toLowerCase()) ||
        s.title?.toLowerCase().includes(keyword.toLowerCase()),
    );
    if (match) {
      onNavigateToSubjectDetail(match);
    } else {
      onNavigateToSubjects();
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit && searchTopic.trim()) {
      onSearchSubmit(searchTopic.trim());
    } else {
      onNavigateToArticles();
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  // Carousel navigation
  const scrollCarousel = (direction: 'prev' | 'next') => {
    if (!carouselTrackRef.current) return;
    const cardWidth = 320;
    const maxIndex = Math.max(0, topViewedArticles.length - 3);
    const newIdx = direction === 'next'
      ? Math.min(carouselIndex + 1, maxIndex)
      : Math.max(carouselIndex - 1, 0);

    setCarouselIndex(newIdx);
    carouselTrackRef.current.scrollTo({
      left: newIdx * cardWidth,
      behavior: 'smooth',
    });
  };

  // Auto-slide effect for Popular Clinical Guides (smoothly moving left to right)
  useEffect(() => {
    if (isCarouselHovered || !carouselTrackRef.current) return;
    const interval = setInterval(() => {
      const el = carouselTrackRef.current;
      if (!el) return;
      const cardWidth = 320;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft + cardWidth >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
        setCarouselIndex(0);
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
        setCarouselIndex((prev) => prev + 1);
      }
    }, 3400);

    return () => clearInterval(interval);
  }, [isCarouselHovered, topViewedArticles.length]);

  // Local generated high-definition card assets
  const generatedCardImages = [
    '/images/cardio-heart.jpg',
    '/images/neuro-brain.jpg',
    '/images/thorax-anatomy.jpg',
    '/images/emergency-care.jpg',
    '/images/cardio-heart.jpg',
    '/images/neuro-brain.jpg',
  ];

  const popularCardRatings = ['4.9', '4.8', '4.9', '4.7', '4.9', '4.8'];
  const popularCardReads = ['14.8k Reads', '11.2k Reads', '16.5k Reads', '9.4k Reads', '12.1k Reads', '8.9k Reads'];

  // Hero slides data with medical images and distinct layouts
  const heroSlides = [
    {
      id: 0,
      layout: 'layout-left',
      bgImage: '/images/medical-hero-1.jpg',
      eyebrow: 'DIAGNOSTIC PRECISION & NEUROLOGY',
      titleLine1: 'Discover Medicine.',
      titleLine2: 'Find Your Precision.',
      lead: 'Peer-reviewed clinical neuro-imaging, surgical anatomy guides, and high-yield diagnostic algorithms crafted for healthcare practitioners.',
      cta: 'Explore Guides',
      target: 'articles',
      badgeTitle: 'MRI Diagnostic Protocol',
      badgeSubtitle: '99.4% Peer-Reviewed Concordance',
      badgeDoctor: 'Dr. Sarah Chen, MD (Chief Neurologist)',
    },
    {
      id: 1,
      layout: 'layout-right',
      bgImage: '/images/medical-hero-2.jpg',
      eyebrow: 'OPERATIVE THEATER CURRICULUM',
      titleLine1: 'Master Board Exams.',
      titleLine2: 'Empower Operative Care.',
      lead: 'Over 500+ clinically verified surgical procedures and USMLE Step 1 & 2 diagnostic question banks designed to reinforce bedside decision-making.',
      cta: 'Start Quizzes',
      target: 'quizzes',
      badgeTitle: 'Operative Anatomy & Critical Care',
      badgeSubtitle: '500+ Surgical Protocols Verified',
      badgeDoctor: 'Reviewed by ACS Board Certified Surgeons',
    },
    {
      id: 2,
      layout: 'layout-center',
      bgImage: '/images/medical-hero-3.jpg',
      eyebrow: 'CARDIOVASCULAR MEDICINE & CATH LAB',
      titleLine1: 'Cardiology Algorithms.',
      titleLine2: 'Master Systemic Hemodynamics.',
      lead: 'Comprehensive 3D anatomical breakdowns, coronary angiography pathways, and valvular guidelines with zero paywalls.',
      cta: 'Browse Specialties',
      target: 'subjects',
      leftBadge: 'Left Ventricular EF: 55-70% • Cath Protocols',
      rightBadge: '2026 ACC/AHA Valvular Guidelines Active',
    },
    {
      id: 3,
      layout: 'layout-split',
      bgImage: '/images/medical-hero-4.jpg',
      eyebrow: 'PEDIATRICS & EMERGENCY RESUSCITATION',
      titleLine1: 'Trauma & Critical Triage.',
      titleLine2: 'Real-Time Bedside Care.',
      lead: 'Instant access to emergency protocols, pediatric Glasgow Coma Scale (pGCS), and trauma resuscitation guidelines.',
      cta: 'View Emergency Care',
      target: 'articles',
      badgeTitle: 'Pediatric Triage Matrix',
      badgeSubtitle: 'Real-Time Evidence-Based Algorithms',
      badgeDoctor: 'Free Open Access for All Healthcare Workers',
    },
  ];

  // Auto-advance hero slideshow (pauses on hover)
  useEffect(() => {
    if (isHeroHovered) return;
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHeroHovered, heroSlides.length]);

  const activeHero = heroSlides[heroSlide];

  const handleHeroCtaClick = () => {
    if (activeHero.target === 'quizzes') onNavigateToQuizzes();
    else if (activeHero.target === 'subjects') onNavigateToSubjects();
    else onNavigateToArticles();
  };

  const handleNextHero = () => {
    setHeroSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevHero = () => {
    setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="pomaii-home-page">
      {/* =========================================================================
          LIVE CLINICAL MARQUEE TICKER (Continuous updates banner)
          ========================================================================= */}
      <section className="clinical-marquee-container" aria-label="Clinical Updates Ticker">
        <div className="marquee-badge">
          <span className="marquee-dot" />
          <span className="marquee-label">CLINICAL DISPATCH</span>
        </div>
        <div className="marquee-scroll-wrapper">
          <MarqueeElement className="clinical-marquee-content" behavior="scroll" direction="left" scrollamount="6">
            <span>2026 ACC/AHA Valvular Heart Disease Clinical Guidelines Published</span>
            <span className="ticker-divider">•</span>
            <span>USMLE Step 1 High-Yield Question Bank Updated</span>
            <span className="ticker-divider">•</span>
            <span>Surgical Approach to the Thoracic Wall Peer-Reviewed by Board-Certified Surgeons</span>
            <span className="ticker-divider">•</span>
            <span>Over 50,000 Medical Students &amp; Physicians Learning Daily on MedCore</span>
            <span className="ticker-divider">•</span>
            <span>Sepsis Resuscitation Protocols Aligned with Surviving Sepsis Campaign</span>
          </MarqueeElement>
        </div>
      </section>

      {/* =========================================================================
          1. HERO SECTION (Dynamic Medical Slideshow with Multi-Component Alignments)
          ========================================================================= */}
      <section
        className={`pomaii-hero-section ${activeHero.layout}`}
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        {/* Background Image Container with Soft Glass Wave Overlay */}
        <div
          className="hero-background-wrapper"
          style={{ backgroundImage: `url('${activeHero.bgImage}')` }}
        >
          <div className="hero-scenic-overlay" />
          <svg className="hero-organic-wave" viewBox="0 0 1440 280" fill="none" preserveAspectRatio="none">
            <path
              d="M0,160 C320,280 540,60 900,180 C1200,280 1360,140 1440,200 L1440,280 L0,280 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* Hero Slideshow Navigation Arrows */}
        <button
          type="button"
          className="hero-slide-nav-arrow prev"
          onClick={handlePrevHero}
          aria-label="Previous Slide"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          type="button"
          className="hero-slide-nav-arrow next"
          onClick={handleNextHero}
          aria-label="Next Slide"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className={`pomaii-hero-content-container ${activeHero.layout}`}>
          {/* SLIDE 1 (LAYOUT-RIGHT): Floating Surgical Milestones Badge on the Left */}
          {activeHero.layout === 'layout-right' && (
            <div className="hero-floating-badge-card surgical-badge-left">
              <div className="badge-card-header">
                <div className="badge-card-icon-box bg-orange">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                    <line x1="6" y1="18" x2="18" y2="6" />
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="18" cy="18" r="3" />
                  </svg>
                </div>
                <div>
                  <span className="badge-tag-pill">SURGICAL THEATER</span>
                  <h4 className="badge-card-title">{activeHero.badgeTitle}</h4>
                </div>
              </div>
              <p className="badge-card-sub">{activeHero.badgeSubtitle}</p>
              <div className="badge-card-footer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{activeHero.badgeDoctor}</span>
              </div>
            </div>
          )}

          {/* MAIN HERO TEXT CONTENT BLOCK */}
          <div className="hero-text-block">
            <div className="hero-eyebrow-pill">
              <span>{activeHero.eyebrow}</span>
              <svg className="eyebrow-svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>

            <h1 className="hero-display-title">
              {activeHero.titleLine1}<br />
              <span className="highlight-text-wrapper">
                {activeHero.titleLine2}
                <svg className="curved-underline-svg" viewBox="0 0 280 18" fill="none">
                  <path
                    d="M3 14C70 4 190 2 277 11"
                    stroke="#f97316"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="hero-lead-description">
              {activeHero.lead}
            </p>

            {/* Bilateral Stats Badges for Center Layout */}
            {activeHero.layout === 'layout-center' && (
              <div className="hero-center-stats-row">
                <div className="hero-center-stat-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span>{activeHero.leftBadge}</span>
                </div>
                <div className="hero-center-stat-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <span>{activeHero.rightBadge}</span>
                </div>
              </div>
            )}

            <div className="hero-action-row">
              <button
                type="button"
                className="hero-cta-pill-btn"
                onClick={handleHeroCtaClick}
              >
                <span>{activeHero.cta}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              {/* Hero Slideshow Switcher Indicators */}
              <div className="hero-slide-indicators">
                {heroSlides.map((s, sIdx) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`hero-dot-btn ${heroSlide === sIdx ? 'active' : ''}`}
                    onClick={() => setHeroSlide(sIdx)}
                    aria-label={`Slide ${sIdx + 1}: ${s.eyebrow}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* SLIDE 0 (LAYOUT-LEFT): Floating Diagnostic Verification Card on the Right */}
          {activeHero.layout === 'layout-left' && (
            <div className="hero-floating-badge-card diagnostic-badge-right">
              <div className="badge-card-header">
                <div className="badge-card-icon-box bg-green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <span className="badge-tag-pill green">NEURO-IMAGING</span>
                  <h4 className="badge-card-title">{activeHero.badgeTitle}</h4>
                </div>
              </div>
              <p className="badge-card-sub">{activeHero.badgeSubtitle}</p>
              <div className="pulse-wave-visual">
                <svg viewBox="0 0 200 40" fill="none" className="pulse-svg">
                  <path
                    d="M0 20 L40 20 L50 8 L60 32 L70 12 L80 26 L90 20 L200 20"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="badge-card-footer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{activeHero.badgeDoctor}</span>
              </div>
            </div>
          )}

          {/* SLIDE 3 (LAYOUT-SPLIT): Pediatric & Trauma Resuscitation Badge */}
          {activeHero.layout === 'layout-split' && (
            <div className="hero-floating-badge-card triage-badge-right">
              <div className="badge-card-header">
                <div className="badge-card-icon-box bg-purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  </svg>
                </div>
                <div>
                  <span className="badge-tag-pill purple">EMERGENCY TRIAGE</span>
                  <h4 className="badge-card-title">{activeHero.badgeTitle}</h4>
                </div>
              </div>
              <p className="badge-card-sub">{activeHero.badgeSubtitle}</p>
              <div className="triage-status-bar">
                <div className="triage-dot active" />
                <span>Level 1 Trauma Verified Protocols</span>
              </div>
              <div className="badge-card-footer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>{activeHero.badgeDoctor}</span>
              </div>
            </div>
          )}

          {/* Overlapping Floating Interactive Search & Filter Card */}
          <div className="hero-floating-filter-card">
            <form className="filter-card-grid" onSubmit={handleHeroSearch}>
              {/* Field 1: Topic */}
              <div className="filter-cell">
                <div className="cell-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  </svg>
                </div>
                <div className="cell-info">
                  <label htmlFor="search-topic-input">Where to?</label>
                  <input
                    id="search-topic-input"
                    type="text"
                    placeholder="Any clinical topic or drug"
                    value={searchTopic}
                    onChange={(e) => setSearchTopic(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-divider" />

              {/* Field 2: Specialty */}
              <div className="filter-cell">
                <div className="cell-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div className="cell-info">
                  <label htmlFor="specialty-select">Specialty</label>
                  <select
                    id="specialty-select"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                  >
                    <option value="all">All Specialties ({subjects.length > 0 ? subjects.length : 'All'})</option>
                    {subjects.length > 0 ? (
                      subjects.map((sub) => (
                        <option key={sub.id} value={sub.slug || sub.id}>
                          {sub.title}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="cardiology">Cardiology</option>
                        <option value="neurology">Neurology</option>
                        <option value="anatomy">Gross Anatomy</option>
                        <option value="surgery">General Surgery</option>
                        <option value="pediatrics">Pediatrics</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="filter-divider" />

              {/* Field 3: Resource Type */}
              <div className="filter-cell">
                <div className="cell-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div className="cell-info">
                  <label htmlFor="format-select">Format</label>
                  <select
                    id="format-select"
                    value={selectedContentType}
                    onChange={(e) => setSelectedContentType(e.target.value)}
                  >
                    <option value="all">Articles &amp; Cases</option>
                    <option value="articles">Peer-Reviewed Articles</option>
                    <option value="quizzes">USMLE Quizzes</option>
                    <option value="guides">High-Yield Overviews</option>
                  </select>
                </div>
              </div>

              <div className="filter-divider" />

              {/* Field 4: Level */}
              <div className="filter-cell">
                <div className="cell-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="cell-info">
                  <label htmlFor="level-select">Learner Level</label>
                  <select
                    id="level-select"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="student">Medical Student</option>
                    <option value="resident">Resident / Fellow</option>
                    <option value="physician">Attending Physician</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="filter-action-cell">
                <button type="submit" className="filter-search-submit-btn">
                  <span>Search</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. TRUST PILLARS STRIP (4 Pillars with Clean Vector SVG Icons)
          ========================================================================= */}
      <section className="pomaii-trust-strip-section">
        <div className="strip-container">
          <div className="trust-pillar-card">
            <div className="pillar-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <div className="pillar-text">
              <h4>Handpicked Clinical Guides</h4>
              <p>Curated and validated by board-certified physicians.</p>
            </div>
          </div>

          <div className="trust-pillar-card">
            <div className="pillar-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            </div>
            <div className="pillar-text">
              <h4>Open Clinical Access</h4>
              <p>Free, peer-reviewed medical knowledge for everyone.</p>
            </div>
          </div>

          <div className="trust-pillar-card">
            <div className="pillar-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="pillar-text">
              <h4>Evidence-Based Accuracy</h4>
              <p>Synthesized directly from current medical literature.</p>
            </div>
          </div>

          <div className="trust-pillar-card">
            <div className="pillar-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div className="pillar-text">
              <h4>24/7 Clinical Reference</h4>
              <p>Responsive learning anytime on web, tablet, or mobile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. POPULAR CLINICAL GUIDES (With Interactive Slideshow / Carousel)
          ========================================================================= */}
      <section className="pomaii-popular-section">
        <div className="pomaii-section-container">
          <div className="section-title-row">
            <div className="section-title-left">
              <h2 className="pomaii-section-heading">
                Popular Clinical Guides
                <span className="svg-icon-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#154734" strokeWidth="2">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </span>
              </h2>
            </div>

            {/* Slideshow Controls & View All */}
            <div className="carousel-control-group">
              <button
                type="button"
                className="carousel-arrow-btn"
                onClick={() => scrollCarousel('prev')}
                title="Previous Guides"
                aria-label="Previous"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                type="button"
                className="carousel-arrow-btn"
                onClick={() => scrollCarousel('next')}
                title="Next Guides"
                aria-label="Next"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button type="button" className="pomaii-view-all-btn" onClick={onNavigateToArticles}>
                <span>View All Articles</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="popular-cards-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="popular-card-skeleton" />
              ))}
            </div>
          ) : (
            <div
              className="popular-carousel-wrapper"
              onMouseEnter={() => setIsCarouselHovered(true)}
              onMouseLeave={() => setIsCarouselHovered(false)}
            >
              <div className="popular-cards-slider" ref={carouselTrackRef}>
                {(topViewedArticles.length > 0 ? topViewedArticles : articles.slice(0, 6)).map(
                  (article, idx) => {
                    const bgImage = generatedCardImages[idx % generatedCardImages.length];
                    const rating = popularCardRatings[idx % popularCardRatings.length];
                    const readCount = popularCardReads[idx % popularCardReads.length];
                    const specialtyName = article.subject?.title || 'Clinical Medicine';

                    return (
                      <div
                        key={article.id}
                        className="popular-guide-card"
                        onClick={() => onNavigateToArticleDetail(article)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onNavigateToArticleDetail(article);
                          }
                        }}
                      >
                        <div className="card-image-layer" style={{ backgroundImage: `url(${bgImage})` }} />
                        <div className="card-gradient-overlay" />

                        {/* Top rating badge with Star SVG */}
                        <div className="card-top-pill">
                          <svg className="star-icon-svg" width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span className="rating-value">{rating}</span>
                        </div>

                        {/* Bottom content info */}
                        <div className="card-bottom-info">
                          <h3 className="card-guide-title">{article.title}</h3>
                          <p className="card-guide-specialty">{specialtyName}</p>
                          <div className="card-price-reads-badge">
                            <span>{readCount}</span>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          4. SPECIALTY CATEGORY FILTER PILLS (With Clean Vector SVGs, No Emojis)
          ========================================================================= */}
      <section className="pomaii-categories-strip-section">
        <div className="pomaii-section-container">
          <div className="category-pills-row">
            {/* Cardiology */}
            <button
              type="button"
              className="category-pill-item"
              onClick={() => handleSelectSpecialtyPill('cardio')}
            >
              <div className="category-icon-circle bg-orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  <path d="M3.5 12h3l2-4 3 8 2-4h7" />
                </svg>
              </div>
              <span>Cardiology</span>
            </button>

            {/* Neurology */}
            <button
              type="button"
              className="category-pill-item"
              onClick={() => handleSelectSpecialtyPill('neuro')}
            >
              <div className="category-icon-circle bg-teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <span>Neurology</span>
            </button>

            {/* Anatomy */}
            <button
              type="button"
              className="category-pill-item"
              onClick={() => handleSelectSpecialtyPill('anatomy')}
            >
              <div className="category-icon-circle bg-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <path d="M12 2v20M7 7h10M6 12h12M7 17h10" />
                </svg>
              </div>
              <span>Anatomy</span>
            </button>

            {/* Surgery */}
            <button
              type="button"
              className="category-pill-item"
              onClick={() => handleSelectSpecialtyPill('surgery')}
            >
              <div className="category-icon-circle bg-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                  <line x1="18" y1="2" x2="6" y2="14" />
                  <path d="M2 22l4-4 8 8 4-4-8-8" />
                  <path d="M14.5 9.5l3 3" />
                </svg>
              </div>
              <span>Surgery</span>
            </button>

            {/* Pediatrics */}
            <button
              type="button"
              className="category-pill-item"
              onClick={() => handleSelectSpecialtyPill('pediatric')}
            >
              <div className="category-icon-circle bg-amber">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <span>Pediatrics</span>
            </button>

            {/* Pathology */}
            <button
              type="button"
              className="category-pill-item"
              onClick={() => handleSelectSpecialtyPill('pathology')}
            >
              <div className="category-icon-circle bg-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                  <path d="M6 18h8M10 22v-4M14 6l7 7-5 5-7-7 5-5zM9 11l-4 4" />
                </svg>
              </div>
              <span>Pathology</span>
            </button>

            {/* Pharmacology */}
            <button
              type="button"
              className="category-pill-item"
              onClick={() => handleSelectSpecialtyPill('pharmacol')}
            >
              <div className="category-icon-circle bg-emerald">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                  <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                  <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
                </svg>
              </div>
              <span>Pharmacology</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CLINICAL STORIES & GUIDES (Matches "Travel Stories & Guides")
          ========================================================================= */}
      <section className="pomaii-stories-section">
        <div className="pomaii-section-container">
          <div className="stories-two-column-layout">
            {/* Left Box: Sage promotional card */}
            <div className="stories-callout-card">
              <span className="callout-eyebrow">Need Clinical Insights?</span>
              <h2 className="callout-heading">Clinical Pearls &amp; High-Yield Guides</h2>
              <p className="callout-description">
                Get diagnostic pearls, case debriefs, and step-by-step algorithms directly from academic clinicians and peer-reviewers.
              </p>
              <button type="button" className="callout-action-btn" onClick={onNavigateToArticles}>
                <span>Read Clinical Guides</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {/* Right side: 2 Landscape Story Cards with Local Images */}
            <div className="story-cards-horizontal-group">
              <div className="story-landscape-card" onClick={onNavigateToArticles}>
                <div
                  className="story-thumbnail"
                  style={{
                    backgroundImage: `url('/images/cardio-heart.jpg')`,
                  }}
                />
                <div className="story-card-body">
                  <h4>10 High-Yield ECG Findings in Emergency Medicine</h4>
                  <span className="story-read-time">5 min read</span>
                </div>
              </div>

              <div className="story-landscape-card" onClick={onNavigateToArticles}>
                <div
                  className="story-thumbnail"
                  style={{
                    backgroundImage: `url('/images/emergency-care.jpg')`,
                  }}
                />
                <div className="story-card-body">
                  <h4>Step-by-Step Approach to Acid-Base &amp; Electrolyte Disorders</h4>
                  <span className="story-read-time">4 min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. WIDE FEATURED PROMO BANNER (With Clean Medical Vector Badge)
          ========================================================================= */}
      <section className="pomaii-promo-banner-section">
        <div className="pomaii-section-container">
          <div className="wide-forest-banner">
            <div
              className="banner-left-scenic"
              style={{ backgroundImage: `url('/images/hero-nature.jpg')` }}
            />
            <div className="banner-content-right">
              <span className="banner-special-offer-tag">
                <span>SPECIAL CLINICAL MODULE</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </span>
              <h2 className="banner-title">
                Master Your Board Exams &amp; Clinical Rotations
              </h2>
              <p className="banner-description">
                Comprehensive USMLE Step question banks, verified clinical case debriefs, and evidence-based reviews.
              </p>
              <button
                type="button"
                className="banner-cta-orange-btn"
                onClick={onNavigateToQuizzes}
              >
                <span>Discover Modules</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. METRICS & TRUST STATS STRIP (Clean Vector SVG Icons)
          ========================================================================= */}
      <section className="pomaii-stats-strip-section">
        <div className="pomaii-section-container">
          <div className="stats-inner-wrapper">
            <div className="stats-items-row">
              <div className="stat-pill-item">
                <div className="stat-icon-wrapper">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#154734" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div className="stat-text-meta">
                  <strong>100+</strong>
                  <span>Clinical Topics</span>
                </div>
              </div>

              <div className="stat-pill-item">
                <div className="stat-icon-wrapper">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#154734" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="stat-text-meta">
                  <strong>50K+</strong>
                  <span>Active Learners</span>
                </div>
              </div>

              <div className="stat-pill-item">
                <div className="stat-icon-wrapper">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#f97316">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="stat-text-meta">
                  <strong>4.8 Rating</strong>
                  <span>Peer-Review Score</span>
                </div>
              </div>

              <div className="stat-pill-item">
                <div className="stat-icon-wrapper">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#154734" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="stat-text-meta">
                  <strong>24/7</strong>
                  <span>Free Clinical Access</span>
                </div>
              </div>
            </div>

            {/* Social Icons Right */}
            <div className="social-links-row">
              <span className="social-label">Follow Us</span>
              <div className="social-icon-bubbles">
                <a href="#facebook" aria-label="Facebook" className="social-bubble">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#instagram" aria-label="Instagram" className="social-bubble">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#twitter" aria-label="Twitter" className="social-bubble">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
                <a href="#youtube" aria-label="YouTube" className="social-bubble">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#ffffff" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. MULTI-COLUMN FOOTER
          ========================================================================= */}
      <footer className="pomaii-main-footer">
        <div className="pomaii-section-container">
          <div className="footer-columns-grid">
            {/* Col 1: Brand & Bio */}
            <div className="footer-brand-column">
              <div className="footer-logo-row" onClick={onNavigateToArticles}>
                <div className="footer-brand-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <h3 className="footer-brand-title">MedCore</h3>
                  <span className="footer-brand-tagline">Explore. Learn. Discover.</span>
                </div>
              </div>
              <p className="footer-brand-bio">
                We bring you closer to the world's most authoritative clinical knowledge, evidence-based guides, and verified learning materials.
              </p>
            </div>

            {/* Col 2: Company */}
            <div className="footer-links-column">
              <h4 className="footer-column-heading">Company</h4>
              <ul className="footer-links-list">
                <li><button type="button" onClick={onNavigateToAbout}>About Us</button></li>
                <li><button type="button" onClick={onNavigateToArticles}>Clinical Library</button></li>
                <li><button type="button" onClick={onNavigateToAbout}>Editorial Board</button></li>
                <li><button type="button" onClick={onNavigateToContact}>Contact Us</button></li>
              </ul>
            </div>

            {/* Col 3: Support & Resources */}
            <div className="footer-links-column">
              <h4 className="footer-column-heading">Support</h4>
              <ul className="footer-links-list">
                <li><button type="button" onClick={onNavigateToQuizzes}>Clinical Quizzes</button></li>
                <li><button type="button" onClick={onNavigateToSubjects}>Specialty Guides</button></li>
                <li><button type="button" onClick={onNavigateToContact}>Help Center</button></li>
                <li><button type="button" onClick={onNavigateToContact}>Terms &amp; Conditions</button></li>
              </ul>
            </div>

            {/* Col 4: Top Specialties */}
            <div className="footer-links-column">
              <h4 className="footer-column-heading">Specialties</h4>
              <ul className="footer-links-list">
                <li><button type="button" onClick={onNavigateToSubjects}>Cardiovascular</button></li>
                <li><button type="button" onClick={onNavigateToSubjects}>Neurology &amp; Spine</button></li>
                <li><button type="button" onClick={onNavigateToSubjects}>Surgical Anatomy</button></li>
                <li><button type="button" onClick={onNavigateToSubjects}>Emergency Medicine</button></li>
              </ul>
            </div>

            {/* Col 5: Newsletter */}
            <div className="footer-newsletter-column">
              <h4 className="footer-column-heading">Newsletter</h4>
              <p className="newsletter-explainer">
                Subscribe for weekly clinical pearls, high-yield summaries, and updates.
              </p>
              {newsletterSubscribed ? (
                <div className="newsletter-success-msg">
                  Thank you! You are subscribed to MedCore Clinical Briefs.
                </div>
              ) : (
                <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="footer-newsletter-btn">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="footer-bottom-copyright-row">
            <p>&copy; {new Date().getFullYear()} MedCore Medical Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

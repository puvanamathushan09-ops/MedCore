import React from 'react';
import './About.css';

export interface AboutProps {
  onNavigateHome: () => void;
  onNavigateToArticles: () => void;
  onNavigateToContact: () => void;
  onNavigateToApplyReviewer?: () => void;
}

export const About: React.FC<AboutProps> = ({
  onNavigateHome,
  onNavigateToArticles,
  onNavigateToContact,
  onNavigateToApplyReviewer,
}) => {
  return (
    <div className="medcore-about-page">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="about-hero">
        <div
          className="about-hero-bg-image"
          style={{ backgroundImage: "url('/images/medical-hero-1.jpg')" }}
        />
        <div className="about-hero-scenic-overlay" />
        <div className="about-hero-wave-bg">
          <svg className="about-organic-wave" viewBox="0 0 1440 180" fill="none" preserveAspectRatio="none">
            <path
              d="M0,80 C320,160 540,20 900,100 C1200,160 1360,60 1440,110 L1440,180 L0,180 Z"
              fill="#fafaf7"
            />
          </svg>
        </div>

        <div className="about-hero-container">
          <nav className="about-breadcrumbs" aria-label="Breadcrumb">
            <button type="button" className="breadcrumb-btn" onClick={onNavigateHome}>
              Home
            </button>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-active">About MedCore</span>
          </nav>

          <span className="about-hero-tag">Peer-Reviewed Medical Platform</span>
          <h1 className="about-hero-title">Advancing Global Medical Knowledge</h1>
          <p className="about-hero-subtitle">
            MedCore is an open-access clinical education platform bridging the gap between dense medical textbooks and practical bedside mastery through peer-reviewed articles and clinical correlates.
          </p>
        </div>
      </section>

      {/* =========================================================================
          MISSION & VISION
          ========================================================================= */}
      <section className="about-section mission-section">
        <div className="about-container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h2>Our Mission</h2>
              <p>
                To provide medical students, residents, and healthcare professionals with free, authoritative, peer-reviewed clinical knowledge that simplifies complex anatomical, physiological, and surgical concepts without sacrificing academic rigor.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h2>Our Vision</h2>
              <p>
                A world where quality medical education is completely open, borderless, and free of paywalls, enabling future physicians in any country to train with the highest standards of evidence-based clinical medicine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUR PILLARS OF CLINICAL RIGOR
          ========================================================================= */}
      <section className="about-section pillars-section">
        <div className="about-container">
          <div className="about-section-header">
            <span className="about-section-tag">Quality Assurance</span>
            <h2>Our 4 Pillars of Clinical Rigor</h2>
            <p>Every article published on MedCore adheres to strict editorial and scientific benchmarks.</p>
          </div>

          <div className="pillars-grid">
            <div className="pillar-item">
              <div className="pillar-number">01</div>
              <h3>Evidence-Based Medicine</h3>
              <p>
                All clinical statements, anatomical relationships, and treatment principles are grounded in peer-reviewed medical literature, consensus guidelines, and authoritative anatomical nomenclature.
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-number">02</div>
              <h3>Specialist Peer Review</h3>
              <p>
                Before publication, drafts are evaluated by certified Medical Reviewers (attending physicians, senior clinical residents, and medical educators) for accuracy, clarity, and clinical relevance.
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-number">03</div>
              <h3>High-Yield Clinical Correlates</h3>
              <p>
                Preclinical anatomy and pathology are explicitly tied to real-world patient presentations, surgical landmarks, physical exam findings, and board examination scenarios (USMLE, PLAB).
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-number">04</div>
              <h3>Continuous Editorial Audits</h3>
              <p>
                As clinical trials conclude and guidelines evolve, articles undergo scheduled re-reviews to ensure pharmacological doses, clinical indications, and surgical insights remain current.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EDITORIAL WORKFLOW
          ========================================================================= */}
      <section className="about-section workflow-section">
        <div className="about-container">
          <div className="workflow-card">
            <div className="about-section-header">
              <span className="about-section-tag">Editorial Workflow</span>
              <h2>How an Article Becomes a Published Guide</h2>
              <p>Our transparent 4-stage pipeline guarantees publication integrity.</p>
            </div>

            <div className="workflow-timeline">
              <div className="timeline-node">
                <div className="node-badge">Step 1</div>
                <h4>Author Submission</h4>
                <p>Medical students or clinicians author comprehensive, citation-backed drafts.</p>
              </div>

              <div className="timeline-connector">→</div>

              <div className="timeline-node">
                <div className="node-badge">Step 2</div>
                <h4>Double-Blind Review</h4>
                <p>Assigned clinical specialists audit factual precision, diagrams, and takeaways.</p>
              </div>

              <div className="timeline-connector">→</div>

              <div className="timeline-node">
                <div className="node-badge">Step 3</div>
                <h4>Revision &amp; Verification</h4>
                <p>Reviewer feedback is incorporated, and references are independently cross-checked.</p>
              </div>

              <div className="timeline-connector">→</div>

              <div className="timeline-node">
                <div className="node-badge">Step 4</div>
                <h4>Open Clinical Release</h4>
                <p>The verified guide goes live with the reviewer verification badge and full accreditation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CALL TO ACTION / JOIN REVIEW BOARD
          ========================================================================= */}
      <section className="about-section cta-section">
        <div className="about-container">
          <div className="about-cta-card">
            <h2>Are You a Clinician or Medical Educator?</h2>
            <p>
              Help shape the next generation of physicians. Join our peer-review network to review upcoming clinical articles and contribute to global medical knowledge.
            </p>
            <div className="about-cta-buttons">
              {onNavigateToApplyReviewer ? (
                <button type="button" className="btn-cta-primary" onClick={onNavigateToApplyReviewer}>
                  Apply as a Medical Reviewer
                </button>
              ) : null}
              <button type="button" className="btn-cta-secondary" onClick={onNavigateToContact}>
                Contact Our Editorial Office
              </button>
              <button type="button" className="btn-cta-text" onClick={onNavigateToArticles}>
                Explore Published Articles →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

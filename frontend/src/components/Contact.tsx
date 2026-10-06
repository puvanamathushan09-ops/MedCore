import React, { useState } from 'react';
import './Contact.css';

export interface ContactProps {
  onNavigateHome: () => void;
  onNavigateToArticles: () => void;
}

export const Contact: React.FC<ContactProps> = ({ onNavigateHome, onNavigateToArticles }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Medical Student',
    category: 'Clinical Content Feedback',
    message: '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      role: 'Medical Student',
      category: 'Clinical Content Feedback',
      message: '',
    });
    setSubmitted(false);
  };

  const faqs = [
    {
      q: 'How are articles vetted for clinical accuracy on MedCore?',
      a: 'Every guide published on MedCore must be authored in accordance with primary literature and peer-reviewed by certified medical professionals, resident physicians, or medical educators before publication.',
    },
    {
      q: 'Can medical students write and submit clinical guides?',
      a: 'Yes! Medical students are encouraged to author and submit guides under the supervision and review of attending physicians and our editorial board.',
    },
    {
      q: 'How do I apply to become a certified Medical Reviewer?',
      a: 'Physicians, clinical fellows, and faculty members can submit their credentials through our Reviewer Application portal or contact us directly at reviewers@medcore.clinical.',
    },
    {
      q: 'Can I cite MedCore articles in academic research or case presentations?',
      a: 'Yes. All MedCore articles are published open-access with full author credits, publication dates, and clinical review stamps for proper academic attribution.',
    },
  ];

  return (
    <div className="medcore-contact-page">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="contact-hero">
        <div
          className="contact-hero-bg-image"
          style={{ backgroundImage: "url('/images/medical-hero-4.jpg')" }}
        />
        <div className="contact-hero-scenic-overlay" />
        <div className="contact-hero-wave-bg">
          <svg className="contact-organic-wave" viewBox="0 0 1440 180" fill="none" preserveAspectRatio="none">
            <path
              d="M0,80 C320,160 540,20 900,100 C1200,160 1360,60 1440,110 L1440,180 L0,180 Z"
              fill="#fafaf7"
            />
          </svg>
        </div>

        <div className="contact-hero-container">
          <nav className="contact-breadcrumbs" aria-label="Breadcrumb">
            <button type="button" className="breadcrumb-btn" onClick={onNavigateHome}>
              Home
            </button>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-active">Contact Us</span>
          </nav>

          <span className="contact-hero-tag">Get in Touch</span>
          <h1 className="contact-hero-title">Contact MedCore Editorial &amp; Support</h1>
          <p className="contact-hero-subtitle">
            Have clinical feedback, an inquiry about reviewer applications, or partnership questions? Our editorial board is here to assist.
          </p>
        </div>
      </section>

      {/* =========================================================================
          MAIN CONTACT SPLIT (FORM + INFO)
          ========================================================================= */}
      <section className="contact-main-section">
        <div className="contact-container">
          <div className="contact-layout-grid">
            {/* LEFT COLUMN: FORM */}
            <div className="contact-form-column">
              <div className="contact-card">
                {submitted ? (
                  <div className="contact-success-state">
                    <div className="success-icon-wrap">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3>Message Successfully Dispatched</h3>
                    <p>
                      Thank you, <strong>{formData.name}</strong>. Your inquiry has been forwarded to the MedCore Clinical Editorial Board. We typically reply within 24–48 hours.
                    </p>
                    <button type="button" className="btn-send-another" onClick={handleReset}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="form-card-title">Send Our Clinical Board a Message</h2>
                    <p className="form-card-subtitle">
                      Fill out the form below and our team will get back to you promptly.
                    </p>

                    <form className="contact-form" onSubmit={handleSubmit}>
                      <div className="form-row-duo">
                        <div className="form-group">
                          <label htmlFor="contact-name">Full Name *</label>
                          <input
                            id="contact-name"
                            type="text"
                            required
                            placeholder="e.g. Dr. Sarah Jenkins"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="contact-email">Email Address *</label>
                          <input
                            id="contact-email"
                            type="email"
                            required
                            placeholder="e.g. sarah@hospital.org"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-row-duo">
                        <div className="form-group">
                          <label htmlFor="contact-role">Your Medical Role</label>
                          <select
                            id="contact-role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          >
                            <option value="Medical Student">Medical Student</option>
                            <option value="Resident / Fellow">Resident / Fellow</option>
                            <option value="Attending Physician">Attending Physician</option>
                            <option value="Academic Researcher">Academic Researcher</option>
                            <option value="Patient / General Reader">Patient / General Reader</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="contact-category">Subject Category</label>
                          <select
                            id="contact-category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          >
                            <option value="Clinical Content Feedback">Clinical Content Feedback</option>
                            <option value="Reviewer Application Inquiry">Reviewer Application Inquiry</option>
                            <option value="University / Hospital Partnership">University / Hospital Partnership</option>
                            <option value="Report an Error or Correction">Report an Error or Correction</option>
                            <option value="General Question">General Question</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="contact-message">Message *</label>
                        <textarea
                          id="contact-message"
                          required
                          rows={5}
                          placeholder="Please provide details about your inquiry, feedback, or case reference..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>

                      <button type="submit" className="btn-submit-contact" disabled={isSubmitting}>
                        {isSubmitting ? 'Transmitting...' : 'Send Message to Editorial Board'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: CONTACT CARDS & FAQ */}
            <div className="contact-info-column">
              <div className="info-cards-stack">
                <div className="contact-info-card">
                  <div className="info-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <h4>Editorial &amp; Submissions</h4>
                    <p>editorial@medcore.clinical</p>
                    <span className="info-note">For article drafts and editorial correspondence</span>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="info-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                      <circle cx="20" cy="10" r="2" />
                    </svg>
                  </div>
                  <div>
                    <h4>Medical Review Board</h4>
                    <p>reviewers@medcore.clinical</p>
                    <span className="info-note">Credential validation &amp; peer-review coordination</span>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="info-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <h4>Response Time Commitment</h4>
                    <p>24–48 Business Hours</p>
                    <span className="info-note">Prioritized response for clinical corrections</span>
                  </div>
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="contact-faq-box">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-list">
                  {faqs.map((faq, index) => {
                    const isOpen = expandedFaq === index;
                    return (
                      <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                        <button
                          type="button"
                          className="faq-question-btn"
                          onClick={() => setExpandedFaq(isOpen ? null : index)}
                        >
                          <span>{faq.q}</span>
                          <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                        </button>
                        {isOpen ? <div className="faq-answer-body">{faq.a}</div> : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Link to Articles */}
              <div style={{ marginTop: '20px', padding: '24px', background: '#f4f8f5', borderRadius: '20px', border: '1px solid #e2ede6', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#154734', margin: '0 0 14px', fontWeight: 700 }}>Looking for clinical reference materials?</p>
                <button
                  type="button"
                  onClick={onNavigateToArticles}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#154734',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(21, 71, 52, 0.25)',
                  }}
                >
                  <span>Browse Medical Articles Library</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

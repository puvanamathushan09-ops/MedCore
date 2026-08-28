import { useState, useEffect } from 'react';
import { ArticleList } from './components/ArticleList';
import { ArticleDetail } from './components/ArticleDetail';
import { getSlugFromUrl } from './components/article-utils';
import type { Article } from '../../src/client/types/article.types';
import './App.css';

function App() {
  const [currentSlug, setCurrentSlug] = useState<string | null>(() => getSlugFromUrl());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentSlug(getSlugFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToArticle = (article: Article) => {
    if (article.slug) {
      setCurrentSlug(article.slug);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/articles/${article.slug}`);
        window.scrollTo(0, 0);
      }
    }
  };

  const navigateToList = () => {
    setCurrentSlug(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="medcore-app">
      <header className="medcore-header">
        <div className="header-container">
          <div
            className="brand-logo"
            onClick={navigateToList}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToList();
              }
            }}
          >
            <svg
              className="brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="brand-title">MedCore</span>
          </div>

          <nav className="header-nav">
            <span
              className={`nav-item ${!currentSlug ? 'active' : ''}`}
              onClick={navigateToList}
            >
              Articles
            </span>
            <span className="nav-item">Subjects</span>
            <span className="nav-item">Topics</span>
          </nav>
        </div>
      </header>

      <main className="medcore-main">
        {currentSlug ? (
          <ArticleDetail slug={currentSlug} onBack={navigateToList} />
        ) : (
          <ArticleList onArticleClick={navigateToArticle} />
        )}
      </main>

      <footer className="medcore-footer">
        <div className="footer-container">
          <p>&copy; {new Date().getFullYear()} MedCore Medical Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { ArticleList } from './components/ArticleList';
import { ArticleDetail } from './components/ArticleDetail';
import { SubjectList } from './components/SubjectList';
import { SubjectDetail } from './components/SubjectDetail';
import { TopicList } from './components/TopicList';
import { parseRoute, pushRoute, type RouteState } from './components/route-utils';
import type { Article } from '../../src/client/types/article.types';
import type { Subject } from '../../src/client/types/subject.types';
import './App.css';

function App() {
  const [route, setRoute] = useState<RouteState>(() => parseRoute());

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation callbacks
  const navigateToArticles = () => {
    setRoute({ type: 'article-list' });
    pushRoute('/');
  };

  const navigateToArticleDetail = (article: Article) => {
    if (article.slug) {
      setRoute({ type: 'article-detail', slug: article.slug });
      pushRoute(`/articles/${article.slug}`);
    }
  };

  const navigateToSubjects = () => {
    setRoute({ type: 'subject-list' });
    pushRoute('/subjects');
  };

  const navigateToSubjectDetail = (subject: Subject) => {
    setRoute({ type: 'subject-detail', subjectSlug: subject.slug });
    pushRoute(`/subjects/${subject.slug}`);
  };

  const navigateToTopic = (subjectSlug: string, topicSlug: string | null) => {
    if (topicSlug) {
      setRoute({ type: 'subject-detail', subjectSlug, topicSlug });
      pushRoute(`/subjects/${subjectSlug}/topics/${topicSlug}`);
    } else {
      setRoute({ type: 'subject-detail', subjectSlug });
      pushRoute(`/subjects/${subjectSlug}`);
    }
  };

  const navigateToTopics = () => {
    setRoute({ type: 'topic-list' });
    pushRoute('/topics');
  };

  // Determine active header tab
  const isArticlesActive = route.type === 'article-list' || route.type === 'article-detail';
  const isSubjectsActive = route.type === 'subject-list' || route.type === 'subject-detail';
  const isTopicsActive = route.type === 'topic-list';

  return (
    <div className="medcore-app">
      <header className="medcore-header">
        <div className="header-container">
          <div
            className="brand-logo"
            onClick={navigateToArticles}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToArticles();
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
              className={`nav-item ${isArticlesActive ? 'active' : ''}`}
              onClick={navigateToArticles}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateToArticles();
                }
              }}
            >
              Articles
            </span>
            <span
              className={`nav-item ${isSubjectsActive ? 'active' : ''}`}
              onClick={navigateToSubjects}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateToSubjects();
                }
              }}
            >
              Subjects
            </span>
            <span
              className={`nav-item ${isTopicsActive ? 'active' : ''}`}
              onClick={navigateToTopics}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateToTopics();
                }
              }}
            >
              Topics
            </span>
          </nav>
        </div>
      </header>

      <main className="medcore-main">
        {route.type === 'article-detail' ? (
          <ArticleDetail slug={route.slug} onBack={navigateToArticles} />
        ) : route.type === 'subject-list' ? (
          <SubjectList onSelectSubject={navigateToSubjectDetail} />
        ) : route.type === 'subject-detail' ? (
          <SubjectDetail
            subjectSlug={route.subjectSlug}
            topicSlug={route.topicSlug}
            onSelectTopic={navigateToTopic}
            onArticleClick={navigateToArticleDetail}
            onBackToSubjects={navigateToSubjects}
          />
        ) : route.type === 'topic-list' ? (
          <TopicList onSelectTopic={navigateToTopic} />
        ) : (
          <ArticleList onArticleClick={navigateToArticleDetail} />
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

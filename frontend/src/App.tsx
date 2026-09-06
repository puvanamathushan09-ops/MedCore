import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ReviewerDashboard } from './components/ReviewerDashboard';
import { ArticleEditor } from './components/ArticleEditor';
import { ArticleList } from './components/ArticleList';
import { ArticleDetail } from './components/ArticleDetail';
import { SubjectList } from './components/SubjectList';
import { SubjectDetail } from './components/SubjectDetail';
import { TopicList } from './components/TopicList';
import { Login } from './components/Login';
import { parseRoute, pushRoute, type RouteState } from './components/route-utils';
import { useAuth } from './auth/AuthContext';
import type { Article } from '../../src/client/types/article.types';
import type { Subject } from '../../src/client/types/subject.types';
import type { UserRole } from '../../src/client/types/auth.types';
import './App.css';

function App() {
  const { user, isLoading } = useAuth();
  const [route, setRoute] = useState<RouteState>(() => parseRoute());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentRole: UserRole = user?.role || 'STUDENT';

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToLogin = () => {
    setRoute({ type: 'login' });
    pushRoute('/login');
  };

  const handleLoginSuccess = (userRole: UserRole) => {
    if (userRole === 'ADMIN') {
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/admin');
    } else if (userRole === 'MEDICAL_REVIEWER') {
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/reviewer');
    } else {
      setRoute({ type: 'dashboard' });
      pushRoute('/dashboard');
    }
  };

  // Route protection effect based on authenticated user?.role
  useEffect(() => {
    if (isLoading) return;

    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    const isAdminRoute = route.type === 'reviewer-dashboard' && (path === '/admin' || path === '/admin/');
    const isReviewerRoute = route.type === 'reviewer-dashboard' && !isAdminRoute;
    const isCreateRoute = route.type === 'create-article';
    const isEditRoute = route.type === 'edit-article';
    const isLoginRoute = route.type === 'login';

    const role = user?.role;

    // If authenticated user visits /login, redirect to their role dashboard
    if (isLoginRoute && role) {
      handleLoginSuccess(role);
      return;
    }

    if (isAdminRoute) {
      if (role !== 'ADMIN') {
        setRoute({ type: 'dashboard' });
        pushRoute('/dashboard');
      }
    } else if (isReviewerRoute || isCreateRoute || isEditRoute) {
      if (role !== 'MEDICAL_REVIEWER' && role !== 'ADMIN') {
        setRoute({ type: 'dashboard' });
        pushRoute('/dashboard');
      }
    }
  }, [route, user, isLoading]);

  // Navigation callbacks
  const navigateToDashboard = () => {
    setRoute({ type: 'dashboard' });
    pushRoute('/dashboard');
  };

  const navigateToReviewerDashboard = () => {
    setRoute({ type: 'reviewer-dashboard' });
    pushRoute('/reviewer');
  };

  const navigateToCreateArticle = () => {
    setRoute({ type: 'create-article' });
    pushRoute('/articles/new');
  };

  const navigateToEditArticle = (articleId: string) => {
    setRoute({ type: 'edit-article', articleId });
    pushRoute(`/articles/edit/${articleId}`);
  };

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

  const handleSidebarNavigate = (
    type: 'dashboard' | 'reviewer-dashboard' | 'article-list' | 'subject-list' | 'topic-list',
  ) => {
    switch (type) {
      case 'dashboard':
        navigateToDashboard();
        break;
      case 'reviewer-dashboard':
        navigateToReviewerDashboard();
        break;
      case 'article-list':
        navigateToArticles();
        break;
      case 'subject-list':
        navigateToSubjects();
        break;
      case 'topic-list':
        navigateToTopics();
        break;
    }
  };

  return (
    <div className="medcore-app">
      {/* HEADER */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onNavigateHome={navigateToDashboard}
        onNavigateToLogin={navigateToLogin}
        currentRole={currentRole}
      />

      {/* MAIN SHELL BODY */}
      <div className="medcore-shell-body">
        {/* SIDEBAR NAVIGATION */}
        <Sidebar
          activeRoute={route}
          onNavigate={handleSidebarNavigate}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          currentRole={currentRole}
        />

        {/* MAIN CONTENT AREA */}
        <main className="medcore-main">
          {route.type === 'login' ? (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={navigateToDashboard}
            />
          ) : route.type === 'dashboard' ? (
            <Dashboard
              onNavigateToSubjects={navigateToSubjects}
              onNavigateToTopics={navigateToTopics}
              onNavigateToArticles={navigateToArticles}
            />
          ) : route.type === 'reviewer-dashboard' ? (
            <ReviewerDashboard
              onCreateArticle={navigateToCreateArticle}
              onEditArticle={navigateToEditArticle}
            />
          ) : route.type === 'create-article' ? (
            <ArticleEditor
              onSuccess={navigateToReviewerDashboard}
              onCancel={navigateToReviewerDashboard}
            />
          ) : route.type === 'edit-article' ? (
            <ArticleEditor
              articleId={route.articleId}
              onSuccess={navigateToReviewerDashboard}
              onCancel={navigateToReviewerDashboard}
            />
          ) : route.type === 'article-detail' ? (
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

          {/* FOOTER */}
          <footer className="medcore-footer">
            <div className="footer-container">
              <p>&copy; {new Date().getFullYear()} MedCore Medical Platform. Peer-reviewed clinical & medical learning.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;

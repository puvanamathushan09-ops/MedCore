import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Home } from './components/Home';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Dashboard } from './components/Dashboard';
import { ReviewerDashboard } from './components/ReviewerDashboard';
import { ArticleEditor } from './components/ArticleEditor';
import { ArticleList } from './components/ArticleList';
import { ArticleDetail } from './components/ArticleDetail';
import { SubjectList } from './components/SubjectList';
import { SubjectDetail } from './components/SubjectDetail';
import { TopicList } from './components/TopicList';
import { QuizList } from './components/QuizList';
import { QuizDetail } from './components/QuizDetail';
import { QuizAttempts } from './components/QuizAttempts';
import { Login } from './components/Login';
import { Registration } from './components/Registration';
import { Profile } from './components/Profile';
import { ReviewerApplication } from './components/ReviewerApplication';
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

  const isWorkspaceRoute =
    route.type === 'dashboard' ||
    route.type === 'reviewer-dashboard' ||
    route.type === 'create-article' ||
    route.type === 'edit-article' ||
    route.type === 'apply-reviewer' ||
    route.type === 'profile';

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToHome = () => {
    setRoute({ type: 'home' });
    pushRoute('/');
  };

  const navigateToAbout = () => {
    setRoute({ type: 'about' });
    pushRoute('/about');
  };

  const navigateToContact = () => {
    setRoute({ type: 'contact' });
    pushRoute('/contact');
  };

  const navigateToLogin = () => {
    setRoute({ type: 'login' });
    pushRoute('/login');
  };

  const navigateToRegister = () => {
    setRoute({ type: 'register' });
    pushRoute('/register');
  };

  const navigateToProfile = () => {
    setRoute({ type: 'profile' });
    pushRoute('/profile');
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
    const isRegisterRoute = route.type === 'register';
    const isProfileRoute = route.type === 'profile';

    const role = user?.role;

    // If authenticated user visits /login or /register, redirect to their role dashboard
    if ((isLoginRoute || isRegisterRoute) && role) {
      handleLoginSuccess(role);
      return;
    }

    // Protect /profile route
    if (isProfileRoute && !role) {
      navigateToLogin();
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
  const navigateToApplyReviewer = () => {
    setRoute({ type: 'apply-reviewer' });
    pushRoute('/apply-reviewer');
  };

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
    pushRoute('/articles');
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

  const navigateToQuizzes = () => {
    setRoute({ type: 'quiz-list' });
    pushRoute('/quizzes');
  };

  const navigateToQuizAttempts = () => {
    setRoute({ type: 'quiz-attempts' });
    pushRoute('/quizzes/attempts');
  };

  const navigateToQuizDetail = (quizId: string) => {
    setRoute({ type: 'quiz-detail', quizId });
    pushRoute(`/quizzes/${quizId}`);
  };

  const handleSwitchToWorkspace = () => {
    if (!user) {
      navigateToLogin();
    } else if (user.role === 'ADMIN') {
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/admin');
    } else if (user.role === 'MEDICAL_REVIEWER') {
      navigateToReviewerDashboard();
    } else {
      navigateToDashboard();
    }
  };

  const handleSidebarNavigate = (
    type: 'dashboard' | 'reviewer-dashboard' | 'apply-reviewer' | 'article-list' | 'subject-list' | 'topic-list' | 'quiz-list',
  ) => {
    switch (type) {
      case 'dashboard':
        navigateToDashboard();
        break;
      case 'reviewer-dashboard':
        navigateToReviewerDashboard();
        break;
      case 'apply-reviewer':
        navigateToApplyReviewer();
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
      case 'quiz-list':
        navigateToQuizzes();
        break;
    }
  };

  return (
    <div className="medcore-app">
      {/* HEADER */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onNavigateHome={navigateToHome}
        onNavigateToLogin={navigateToLogin}
        onNavigateToProfile={navigateToProfile}
        onNavigateToArticles={navigateToArticles}
        onNavigateToSubjects={navigateToSubjects}
        onNavigateToQuizzes={navigateToQuizzes}
        onNavigateToAbout={navigateToAbout}
        onNavigateToContact={navigateToContact}
        onSwitchToWorkspace={handleSwitchToWorkspace}
        isWorkspaceView={isWorkspaceRoute}
        activeRouteType={route.type}
        currentRole={currentRole}
      />

      {/* MAIN SHELL BODY */}
      <div className={`medcore-shell-body ${isWorkspaceRoute ? 'with-sidebar' : 'public-layout'}`}>
        {/* SIDEBAR NAVIGATION (Rendered only on administrative/reviewer workspace routes) */}
        {isWorkspaceRoute ? (
          <Sidebar
            activeRoute={route}
            onNavigate={handleSidebarNavigate}
            isOpen={isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
            currentRole={currentRole}
          />
        ) : null}

        {/* MAIN CONTENT AREA */}
        <main className={`medcore-main ${isWorkspaceRoute ? 'workspace-content' : 'public-content'}`}>
          {route.type === 'home' ? (
            <Home
              onNavigateToArticles={navigateToArticles}
              onNavigateToArticleDetail={navigateToArticleDetail}
              onNavigateToSubjects={navigateToSubjects}
              onNavigateToSubjectDetail={navigateToSubjectDetail}
              onNavigateToQuizzes={navigateToQuizzes}
              onNavigateToAbout={navigateToAbout}
              onNavigateToContact={navigateToContact}
              onSearchSubmit={() => navigateToArticles()}
            />
          ) : route.type === 'about' ? (
            <About
              onNavigateHome={navigateToHome}
              onNavigateToArticles={navigateToArticles}
              onNavigateToContact={navigateToContact}
              onNavigateToApplyReviewer={navigateToApplyReviewer}
            />
          ) : route.type === 'contact' ? (
            <Contact
              onNavigateHome={navigateToHome}
              onNavigateToArticles={navigateToArticles}
            />
          ) : route.type === 'login' ? (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={navigateToHome}
              onNavigateToRegister={navigateToRegister}
            />
          ) : route.type === 'register' ? (
            <Registration
              onNavigateToLogin={navigateToLogin}
              onNavigateHome={navigateToHome}
            />
          ) : route.type === 'apply-reviewer' ? (
            <ReviewerApplication
              onNavigateToLogin={navigateToLogin}
              onNavigateToRegister={navigateToRegister}
              onNavigateToReviewerDashboard={navigateToReviewerDashboard}
            />
          ) : route.type === 'profile' ? (
            <Profile />
          ) : route.type === 'dashboard' ? (
            <Dashboard
              onNavigateToSubjects={navigateToSubjects}
              onNavigateToTopics={navigateToTopics}
              onNavigateToArticles={navigateToArticles}
              onNavigateToQuizzes={navigateToQuizzes}
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
          ) : route.type === 'quiz-list' ? (
            <QuizList onSelectQuiz={navigateToQuizDetail} onViewAttempts={navigateToQuizAttempts} />
          ) : route.type === 'quiz-attempts' ? (
            <QuizAttempts onBackToQuizzes={navigateToQuizzes} />
          ) : route.type === 'quiz-detail' ? (
            <QuizDetail quizId={route.quizId} onBackToQuizzes={navigateToQuizzes} />
          ) : (
            <ArticleList
              onArticleClick={navigateToArticleDetail}
              onSelectSubject={(subjectSlug) => {
                navigateToSubjects();
                console.log('Selected subject:', subjectSlug);
              }}
            />
          )}

          {/* FOOTER (Shown on secondary pages, Home has its own comprehensive Pomaii footer) */}
          {route.type !== 'home' ? (
            <footer className="medcore-footer">
              <div className="footer-container">
                <div className="footer-brand" onClick={navigateToHome} style={{ cursor: 'pointer' }}>
                  <div className="footer-mini-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <span>MedCore Clinical Platform</span>
                </div>
                <div className="footer-links">
                  <button type="button" onClick={navigateToHome}>Home</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToArticles}>Articles</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToSubjects}>Specialties</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToQuizzes}>Quizzes</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToAbout}>About Us</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToContact}>Contact</button>
                  <span>·</span>
                  <button type="button" onClick={handleSwitchToWorkspace}>Clinical Workspace</button>
                </div>
                <p className="footer-copy">
                  &copy; {new Date().getFullYear()} MedCore Medical Platform. All rights reserved.
                </p>
              </div>
            </footer>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default App;

export type RouteState =
  | { type: 'dashboard' }
  | { type: 'reviewer-dashboard' }
  | { type: 'apply-reviewer' }
  | { type: 'create-article' }
  | { type: 'edit-article'; articleId: string }
  | { type: 'article-list' }
  | { type: 'article-detail'; slug: string }
  | { type: 'subject-list' }
  | { type: 'subject-detail'; subjectSlug: string; topicSlug?: string }
  | { type: 'topic-list' }
  | { type: 'quiz-list' }
  | { type: 'quiz-attempts' }
  | { type: 'quiz-detail'; quizId: string }
  | { type: 'login' }
  | { type: 'register' }
  | { type: 'profile' };

export function parseRoute(pathname?: string): RouteState {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');

  // Login route: /login
  if (path === '/login' || path === '/login/') {
    return { type: 'login' };
  }

  // Register route: /register
  if (path === '/register' || path === '/register/') {
    return { type: 'register' };
  }

  // Apply Reviewer route: /apply-reviewer
  if (path === '/apply-reviewer' || path === '/apply-reviewer/' || path === '/reviewer/apply') {
    return { type: 'apply-reviewer' };
  }

  // Profile route: /profile
  if (path === '/profile' || path === '/profile/') {
    return { type: 'profile' };
  }

  // Dashboard route: /dashboard
  if (path === '/dashboard' || path === '/dashboard/') {
    return { type: 'dashboard' };
  }

  // Quiz attempts: /quizzes/attempts (Must be checked BEFORE /quizzes/:quizId)
  if (path === '/quizzes/attempts' || path === '/quizzes/attempts/') {
    return { type: 'quiz-attempts' };
  }

  // Quiz list: /quizzes
  if (path === '/quizzes' || path === '/quizzes/') {
    return { type: 'quiz-list' };
  }

  // Quiz detail: /quizzes/:quizId
  const quizDetailMatch = path.match(/^\/quizzes\/([^/]+)\/?$/);
  if (quizDetailMatch) {
    const id = quizDetailMatch[1];
    if (id !== 'attempts') {
      return { type: 'quiz-detail', quizId: id };
    }
  }


  // Reviewer Dashboard / Admin Portal: /reviewer or /admin
  if (path === '/reviewer' || path === '/reviewer/' || path === '/admin' || path === '/admin/') {
    return { type: 'reviewer-dashboard' };
  }

  // Create Article: /articles/new
  if (path === '/articles/new' || path === '/articles/new/') {
    return { type: 'create-article' };
  }

  // Edit Article: /articles/edit/:id
  const editMatch = path.match(/^\/articles\/edit\/([^/]+)\/?$/);
  if (editMatch) {
    return {
      type: 'edit-article',
      articleId: editMatch[1],
    };
  }

  // Article detail: /articles/:slug
  if (path.startsWith('/articles/')) {
    const slug = path.replace('/articles/', '').trim();
    if (slug) {
      return { type: 'article-detail', slug };
    }
  }

  // Subject detail with topic: /subjects/:subjectSlug/topics/:topicSlug
  const subjectTopicMatch = path.match(/^\/subjects\/([^/]+)\/topics\/([^/]+)\/?$/);
  if (subjectTopicMatch) {
    return {
      type: 'subject-detail',
      subjectSlug: subjectTopicMatch[1],
      topicSlug: subjectTopicMatch[2],
    };
  }

  // Subject detail: /subjects/:subjectSlug
  const subjectMatch = path.match(/^\/subjects\/([^/]+)\/?$/);
  if (subjectMatch) {
    return {
      type: 'subject-detail',
      subjectSlug: subjectMatch[1],
    };
  }

  // Subjects list: /subjects
  if (path === '/subjects' || path === '/subjects/') {
    return { type: 'subject-list' };
  }

  // Topics list: /topics
  if (path === '/topics' || path === '/topics/') {
    return { type: 'topic-list' };
  }

  // Default: Article list (/ or /articles)
  return { type: 'article-list' };
}

export function pushRoute(url: string): void {
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', url);
    window.scrollTo(0, 0);
  }
}

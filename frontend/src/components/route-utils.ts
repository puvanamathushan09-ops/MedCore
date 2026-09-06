export type RouteState =
  | { type: 'dashboard' }
  | { type: 'reviewer-dashboard' }
  | { type: 'create-article' }
  | { type: 'edit-article'; articleId: string }
  | { type: 'article-list' }
  | { type: 'article-detail'; slug: string }
  | { type: 'subject-list' }
  | { type: 'subject-detail'; subjectSlug: string; topicSlug?: string }
  | { type: 'topic-list' }
  | { type: 'login' };

export function parseRoute(pathname?: string): RouteState {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');

  // Login route: /login
  if (path === '/login' || path === '/login/') {
    return { type: 'login' };
  }

  // Dashboard route: /dashboard
  if (path === '/dashboard' || path === '/dashboard/') {
    return { type: 'dashboard' };
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

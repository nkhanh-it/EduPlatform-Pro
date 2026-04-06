export type Page =
  | 'landing'
  | 'course-detail'
  | 'student-dashboard'
  | 'student-courses'
  | 'course-player'
  | 'admin-dashboard'
  | 'admin-students'
  | 'admin-courses'
  | 'admin-registrations'
  | 'admin-revenue'
  | 'auth'
  | 'courses'
  | 'checkout'
  | 'settings';

type UserRole = 'ADMIN' | 'STUDENT' | 'INSTRUCTOR' | null | undefined;

type RouteConfig = {
  page: Page;
  path: string;
  requiresAuth?: boolean;
  publicOnly?: boolean;
  allowedRoles?: Array<'ADMIN' | 'STUDENT' | 'INSTRUCTOR'>;
};

const ROUTES: RouteConfig[] = [
  { page: 'landing', path: '/' },
  { page: 'auth', path: '/auth', publicOnly: true },
  { page: 'courses', path: '/courses' },
  { page: 'course-detail', path: '/courses/:id' },
  { page: 'checkout', path: '/checkout', requiresAuth: true, allowedRoles: ['STUDENT'] },
  { page: 'student-dashboard', path: '/dashboard', requiresAuth: true, allowedRoles: ['STUDENT'] },
  { page: 'student-courses', path: '/my-courses', requiresAuth: true, allowedRoles: ['STUDENT'] },
  { page: 'course-player', path: '/learn', requiresAuth: true, allowedRoles: ['STUDENT'] },
  { page: 'settings', path: '/settings', requiresAuth: true, allowedRoles: ['ADMIN', 'STUDENT', 'INSTRUCTOR'] },
  { page: 'admin-dashboard', path: '/admin', requiresAuth: true, allowedRoles: ['ADMIN'] },
  { page: 'admin-students', path: '/admin/students', requiresAuth: true, allowedRoles: ['ADMIN'] },
  { page: 'admin-courses', path: '/admin/courses', requiresAuth: true, allowedRoles: ['ADMIN', 'INSTRUCTOR'] },
  { page: 'admin-registrations', path: '/admin/registrations', requiresAuth: true, allowedRoles: ['ADMIN'] },
  { page: 'admin-revenue', path: '/admin/revenue', requiresAuth: true, allowedRoles: ['ADMIN'] },
];

const PUBLIC_PAGES: Page[] = ['landing', 'auth', 'courses', 'course-detail'];
const DEFAULT_PUBLIC_PAGE: Page = 'landing';
const COURSE_DETAIL_PATTERN = /^\/courses\/([^/]+)$/;

export function isValidPage(value: string | null): value is Page {
  return ROUTES.some((route) => route.page === value);
}

export function getPathForPage(page: Page, params?: { courseId?: string | null }): string {
  if (page === 'course-detail') {
    return params?.courseId ? `/courses/${params.courseId}` : '/courses';
  }

  return ROUTES.find((route) => route.page === page)?.path ?? '/';
}

export function getPageFromPath(pathname: string): Page | null {
  const normalizedPath = normalizePath(pathname);
  if (COURSE_DETAIL_PATTERN.test(normalizedPath)) {
    return 'course-detail';
  }
  return ROUTES.find((route) => route.path === normalizedPath)?.page ?? null;
}

export function getCourseIdFromPath(pathname: string): string | null {
  const normalizedPath = normalizePath(pathname);
  const match = normalizedPath.match(COURSE_DETAIL_PATTERN);
  return match ? decodeURIComponent(match[1]) : null;
}

export function canAccessPage(
  page: Page,
  auth: { isAuthenticated: boolean; role?: UserRole },
): boolean {
  const route = ROUTES.find((item) => item.page === page);
  if (!route) {
    return false;
  }

  if (route.publicOnly) {
    return !auth.isAuthenticated;
  }

  if (route.requiresAuth && !auth.isAuthenticated) {
    return false;
  }

  if (route.allowedRoles && !route.allowedRoles.includes((auth.role ?? null) as 'ADMIN' | 'STUDENT' | 'INSTRUCTOR')) {
    return false;
  }

  return true;
}

export function getDefaultPageForRole(role?: UserRole): Page {
  if (role === 'ADMIN') {
    return 'admin-dashboard';
  }
  if (role === 'INSTRUCTOR') {
    return 'admin-courses';
  }
  return 'student-dashboard';
}

export function getFallbackPage(
  auth: { isAuthenticated: boolean; role?: UserRole },
  requestedPage?: Page | null,
): Page {
  if (!auth.isAuthenticated) {
    return requestedPage && PUBLIC_PAGES.includes(requestedPage) ? requestedPage : 'auth';
  }

  if (requestedPage === 'auth') {
    return getDefaultPageForRole(auth.role);
  }

  return getDefaultPageForRole(auth.role);
}

export function normalizePageForSession(
  page: Page | null,
  auth: { isAuthenticated: boolean; role?: UserRole },
): Page {
  if (page && canAccessPage(page, auth)) {
    return page;
  }

  return getFallbackPage(auth, page);
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

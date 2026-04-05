import React, { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import CoursePlayer from './pages/CoursePlayer';
import AdminDashboard from './pages/AdminDashboard';
import StudentList from './pages/StudentList';
import AdminCourses from './pages/AdminCourses';
import AdminRegistrations from './pages/AdminRegistrations';
import AdminRevenue from './pages/AdminRevenue';
import StudentCourses from './pages/StudentCourses';
import CourseDetail from './pages/CourseDetail';
import Auth from './pages/Auth';
import Courses from './pages/Courses';
import Checkout from './pages/Checkout';
import Settings from './pages/Settings';
import { DialogProvider } from './components/dialogs/DialogProvider';
import { LoadingProvider } from './components/feedback/LoadingProvider';
import { ToastProvider } from './components/feedback/ToastProvider';
import { clearAuthSession, getMe, getSelectedCourseId, getStoredUser, hasAuthSession, setCurrentPage, setSelectedCourseId, setStoredUser } from './api';
import { getCourseIdFromPath, getPageFromPath, getPathForPage, isValidPage, normalizePageForSession, type Page } from './routing';

const App: React.FC = () => {
  const [currentPage, setCurrentPageState] = useState<Page>(() =>
    normalizePageForSession(getPageFromPath(window.location.pathname), {
      isAuthenticated: hasAuthSession(),
      role: getStoredUser()?.role,
    }),
  );
  const [bootstrapped, setBootstrapped] = useState(false);

  const syncPage = (page: Page, options?: { replace?: boolean }) => {
    const path = getPathForPage(page, {
      courseId: page === 'course-detail' ? getSelectedCourseId() : null,
    });

    if (window.location.pathname !== path) {
      const method = options?.replace ? 'replaceState' : 'pushState';
      window.history[method](null, '', path);
    }

    setCurrentPageState(page);
    setCurrentPage(page);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const requestedPage = getPageFromPath(window.location.pathname);
      const requestedCourseId = getCourseIdFromPath(window.location.pathname);
      if (requestedPage === 'course-detail' && requestedCourseId) {
        setSelectedCourseId(requestedCourseId);
      }

      if (!hasAuthSession()) {
        syncPage(normalizePageForSession(requestedPage, { isAuthenticated: false }), { replace: true });
        setBootstrapped(true);
        return;
      }

      try {
        const me = await getMe();
        setStoredUser(me);
        syncPage(
          normalizePageForSession(requestedPage, {
            isAuthenticated: true,
            role: me?.role,
          }),
          { replace: true },
        );
      } catch {
        clearAuthSession();
        syncPage('auth', { replace: true });
      } finally {
        setBootstrapped(true);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const requestedPage = getPageFromPath(window.location.pathname);
      const requestedCourseId = getCourseIdFromPath(window.location.pathname);
      if (requestedPage === 'course-detail' && requestedCourseId) {
        setSelectedCourseId(requestedCourseId);
      }
      const storedUser = getStoredUser();
      const nextPage = normalizePageForSession(requestedPage, {
        isAuthenticated: hasAuthSession(),
        role: storedUser?.role,
      });

      if (nextPage !== requestedPage) {
        syncPage(nextPage, { replace: true });
        return;
      }

      setCurrentPageState(nextPage);
      setCurrentPage(nextPage);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string) => {
    if (!isValidPage(page)) {
      const storedUser = getStoredUser();
      syncPage(
        normalizePageForSession(null, {
          isAuthenticated: hasAuthSession(),
          role: storedUser?.role,
        }),
        { replace: true },
      );
      return;
    }

    if (page === 'course-detail' && !getSelectedCourseId()) {
      syncPage('courses');
      return;
    }

    const storedUser = getStoredUser();
    if (!storedUser && !hasAuthSession() && page !== 'landing' && page !== 'auth' && page !== 'courses') {
      syncPage('auth');
      return;
    }

    const nextPage = normalizePageForSession(page, {
      isAuthenticated: hasAuthSession(),
      role: storedUser?.role,
    });
    syncPage(nextPage);
  };

  const renderPage = () => {
    const storedUser = getStoredUser();
    const settingsRole = storedUser?.role === 'ADMIN' ? 'admin' : storedUser?.role === 'INSTRUCTOR' ? 'instructor' : 'student';
    const backofficeRole = storedUser?.role === 'INSTRUCTOR' ? 'instructor' : 'admin';

    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'auth':
        return <Auth onNavigate={handleNavigate} />;
      case 'student-dashboard':
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'student-courses':
        return <StudentCourses onNavigate={handleNavigate} />;
      case 'course-player':
        return <CoursePlayer onNavigate={handleNavigate} />;
      case 'courses':
        return <Courses onNavigate={handleNavigate} />;
      case 'course-detail':
        return <CourseDetail onNavigate={handleNavigate} />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings onNavigate={handleNavigate} role={settingsRole} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'admin-students':
        return <StudentList onNavigate={handleNavigate} />;
      case 'admin-courses':
        return <AdminCourses onNavigate={handleNavigate} role={backofficeRole} />;
      case 'admin-registrations':
        return <AdminRegistrations onNavigate={handleNavigate} />;
      case 'admin-revenue':
        return <AdminRevenue onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <DialogProvider>
      <ToastProvider>
        <LoadingProvider>
          {bootstrapped ? (
            renderPage()
          ) : (
            <div className="flex min-h-screen items-center justify-center bg-[#f5f7f8] dark:bg-[#101922]">
              <div className="rounded-2xl border border-white/10 bg-white/90 px-5 py-4 text-sm font-medium text-slate-600 shadow-xl dark:border-dark-border dark:bg-slate-900/90 dark:text-slate-300">
                Đang xử lý...
              </div>
            </div>
          )}
        </LoadingProvider>
      </ToastProvider>
    </DialogProvider>
  );
};

export default App;

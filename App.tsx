import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import CoursePlayer from './pages/CoursePlayer';
import AdminDashboard from './pages/AdminDashboard';
import StudentList from './pages/StudentList';
import AdminCourses from './pages/AdminCourses';
import AdminRegistrations from './pages/AdminRegistrations';
import AdminRevenue from './pages/AdminRevenue';
import StudentCourses from './pages/StudentCourses';
import Auth from './pages/Auth';
import Courses from './pages/Courses';
import Checkout from './pages/Checkout';
import Settings from './pages/Settings';
import StudentProfile from './pages/StudentProfile';
import { AuthProvider, useAuth } from './AuthContext';
import { seedDefaultAdmin } from './seedAdmin';

type Page = 'landing' | 'student-dashboard' | 'student-courses' | 'course-player' | 'admin-dashboard' | 'admin-students' | 'admin-courses' | 'admin-registrations' | 'admin-revenue' | 'auth' | 'courses' | 'checkout' | 'settings' | 'student-profile-view' | 'student-profile-edit';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { isAuthenticated, user, isLoading } = useAuth();

  React.useEffect(() => {
    // Seed default admin account if not exists
    seedDefaultAdmin();
  }, []);

  React.useEffect(() => {
    // Automatically redirect to dashboard if authenticated but stuck on auth page
    if (isAuthenticated && currentPage === 'auth') {
      setCurrentPage(user?.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
    }
  }, [isAuthenticated, user, currentPage]);

  // Prevent rendering app contents while restoring session
  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-[#101922]">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    </div>;
  }

  const handleNavigate = (page: string) => {
    // Enforce basic routing restrictions
    if (!isAuthenticated && !['landing', 'auth', 'courses'].includes(page)) {
      setCurrentPage('auth');
      return;
    }

    // Parse studentId from page string if present (e.g. 'student-profile-view:abc123')
    if (page.startsWith('student-profile-view:') || page.startsWith('student-profile-edit:')) {
      const [pageName, studentId] = page.split(':');
      setSelectedStudentId(studentId);
      setCurrentPage(pageName as Page);
      return;
    }

    setCurrentPage(page as Page);
  };

  const handleFirebaseTest = async () => {
    try {
      const id = await addTestUser();
      console.log('Firebase test user added with id:', id);
      alert(`Firebase OK. Created user id: ${id}`);
    } catch (error) {
      console.error('Firebase test failed:', error);
      alert('Firebase test failed. Check console and Firestore rules.');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={handleNavigate} />;
      case 'auth': return <Auth onNavigate={handleNavigate} />;
      case 'student-dashboard': return <StudentDashboard onNavigate={handleNavigate} />;
      case 'student-courses': return <StudentCourses onNavigate={handleNavigate} />;
      case 'course-player': return <CoursePlayer onNavigate={handleNavigate} />;
      case 'courses': return <Courses onNavigate={handleNavigate} />;
      case 'checkout': return <Checkout onNavigate={handleNavigate} />;
      case 'settings': return <Settings onNavigate={handleNavigate} />;
      case 'admin-dashboard': return <AdminDashboard onNavigate={handleNavigate} />;
      case 'admin-students': return <StudentList onNavigate={handleNavigate} />;
      case 'student-profile-view': return selectedStudentId ? <StudentProfile studentId={selectedStudentId} mode="view" onNavigate={handleNavigate} /> : <StudentList onNavigate={handleNavigate} />;
      case 'student-profile-edit': return selectedStudentId ? <StudentProfile studentId={selectedStudentId} mode="edit" onNavigate={handleNavigate} /> : <StudentList onNavigate={handleNavigate} />;
      case 'admin-courses': return <AdminCourses onNavigate={handleNavigate} />;
      case 'admin-registrations': return <AdminRegistrations onNavigate={handleNavigate} />;
      case 'admin-revenue': return <AdminRevenue onNavigate={handleNavigate} />;
      default: return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {renderPage()}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

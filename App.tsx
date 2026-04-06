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

type Page = 'landing' | 'student-dashboard' | 'student-courses' | 'course-player' | 'admin-dashboard' | 'admin-students' | 'admin-courses' | 'admin-registrations' | 'admin-revenue' | 'auth' | 'courses' | 'checkout' | 'settings';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
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
    <>
      {/* Dev Navigation Bar for easy switching in preview */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full flex gap-4 shadow-xl text-xs font-medium border border-white/10 overflow-x-auto max-w-[90vw] whitespace-nowrap">
        <button onClick={() => setCurrentPage('landing')} className={currentPage === 'landing' ? 'text-primary' : 'hover:text-gray-300'}>Landing</button>
        <button onClick={() => setCurrentPage('auth')} className={currentPage === 'auth' ? 'text-primary' : 'hover:text-gray-300'}>Auth</button>
        <button onClick={() => setCurrentPage('student-dashboard')} className={currentPage === 'student-dashboard' ? 'text-primary' : 'hover:text-gray-300'}>Dashboard</button>
        <button onClick={() => setCurrentPage('student-courses')} className={currentPage === 'student-courses' ? 'text-primary' : 'hover:text-gray-300'}>My Courses</button>
        <button onClick={() => setCurrentPage('admin-dashboard')} className={currentPage === 'admin-dashboard' ? 'text-primary' : 'hover:text-gray-300'}>Admin</button>
      </div>
      
      {renderPage()}
    </>
  );
};

export default App;

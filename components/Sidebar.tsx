import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  User,
  CreditCard,
  LogOut,
  Settings,
  Users,
  FileText,
  GraduationCap
} from 'lucide-react';

import { useAuth } from '../AuthContext';

interface SidebarProps {
  role: 'student' | 'admin';
  activePage: string;
  onNavigate: (page: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activePage, onNavigate }) => {
  const { logout } = useAuth();
  const studentMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, target: 'student-dashboard' },
    // Updated target from 'course-player' to 'student-courses'
    { id: 'my-courses', label: 'Khóa học của tôi', icon: BookOpen, target: 'student-courses' },
    { id: 'catalog', label: 'Thư viện khóa học', icon: FileText, target: 'courses' },
    { id: 'profile', label: 'Cài đặt tài khoản', icon: Settings, target: 'settings' },
  ];

  const adminMenu = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, target: 'admin-dashboard' },
    { id: 'students', label: 'Học viên', icon: Users, target: 'admin-students' },
    { id: 'courses_admin', label: 'Khóa học', icon: BookOpen, target: 'admin-courses' },
    { id: 'registration', label: 'Đăng ký', icon: FileText, target: 'admin-registrations' },
    { id: 'revenue', label: 'Thanh toán', icon: CreditCard, target: 'admin-revenue' },
  ];

  const menu = role === 'admin' ? adminMenu : studentMenu;

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-sidebar h-full shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
          <GraduationCap size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {role === 'admin' ? 'AdminPanel' : 'EduSmart'}
        </span>
      </div>

      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {role === 'admin' && (
          <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</p>
        )}
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.target)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activePage === item.target || (activePage === 'my-courses' && item.target === 'student-courses')
              ? 'bg-primary text-white shadow-lg shadow-primary/30 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-card hover:text-primary'
              }`}
          >
            <item.icon size={20} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}

        {role === 'admin' && (
          <>
            <p className="px-4 py-2 mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hệ thống</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-card hover:text-primary transition-all">
              <Settings size={20} />
              <span className="text-sm">Cài đặt</span>
            </button>
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-dark-border">
        {role === 'student' ? (
          <button
            onClick={async () => {
              await logout();
              onNavigate('auth');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all">
            <LogOut size={20} />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100 dark:bg-dark-border">
            <div className="w-10 h-10 rounded-full bg-slate-300 bg-cover bg-center" style={{ backgroundImage: 'url(https://picsum.photos/seed/admin/100/100)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Admin System</p>
              <p className="text-xs text-slate-500 truncate">admin@edu.vn</p>
            </div>
            <button onClick={async () => {
              await logout();
              onNavigate('auth');
            }} className="text-slate-400 hover:text-red-500">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

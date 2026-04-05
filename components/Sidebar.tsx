import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  LogOut,
  Settings,
  Users,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { clearAuthSession } from '../api';

interface SidebarProps {
  role: 'student' | 'admin' | 'instructor';
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activePage, onNavigate }) => {
  const studentMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, target: 'student-dashboard' },
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

  const instructorMenu = [
    { id: 'courses_admin', label: 'Khóa học của tôi', icon: BookOpen, target: 'admin-courses' },
  ];

  const menu = role === 'admin' ? adminMenu : role === 'instructor' ? instructorMenu : studentMenu;

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-dark-border dark:bg-dark-sidebar md:flex">
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <GraduationCap size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {role === 'admin' ? 'AdminPanel' : role === 'instructor' ? 'Instructor Studio' : 'EduSmart'}
        </span>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
        {role !== 'student' && (
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Điều hướng</p>
        )}

        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.target)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
              activePage === item.target || (activePage === 'my-courses' && item.target === 'student-courses')
                ? 'bg-primary font-medium text-white shadow-lg shadow-primary/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-dark-card'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}

        {role !== 'student' && (
          <>
            <p className="mt-6 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Hệ thống</p>
            <button
              onClick={() => onNavigate('settings')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-all hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-dark-card"
            >
              <Settings size={20} />
              <span className="text-sm">Cài đặt</span>
            </button>
          </>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 dark:border-dark-border">
        {role === 'student' ? (
          <button
            onClick={() => {
              clearAuthSession();
              onNavigate('auth');
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/10"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-lg bg-slate-100 p-2 dark:bg-dark-border">
            <div
              className="h-10 w-10 rounded-full bg-slate-300 bg-cover bg-center"
              style={{ backgroundImage: 'url(https://picsum.photos/seed/admin/100/100)' }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{role === 'admin' ? 'Admin System' : 'Instructor Account'}</p>
              <p className="truncate text-xs text-slate-500">{role === 'admin' ? 'admin@edu.vn' : 'instructor@edu.vn'}</p>
            </div>
            <button
              onClick={() => {
                clearAuthSession();
                onNavigate('auth');
              }}
              className="text-slate-400 hover:text-red-500"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

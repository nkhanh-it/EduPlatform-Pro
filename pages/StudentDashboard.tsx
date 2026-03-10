import React, { useEffect, useState } from 'react';
import {
  Bell,
  Search,
  Book,
  Clock,
  Award,
  PlayCircle,
  ArrowRight,
  ArrowUp,
  Calendar,
  Star
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import Sidebar from '../components/Sidebar';

interface DashboardStats {
  enrolledCourses: number;
  completedLessons: number;
  totalHoursLearned: number;
  certificates: number;
  recentCourses: any[];
}
interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Real implementation would fetch from Firestore based on user document
        // For now, new users start with empty progress. We are simply removing the hardcoded mock.
        setStats({
          enrolledCourses: 0,
          completedLessons: 0,
          totalHoursLearned: 0,
          certificates: 0,
          recentCourses: []
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
      <Sidebar role="student" activePage="student-dashboard" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-bg/90 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-dark-border rounded-full px-4 py-2 w-64">
            <Search className="text-slate-400" size={20} />
            <input
              type="text"
              className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 placeholder-slate-400 text-slate-900 dark:text-white outline-none"
              placeholder="Tìm kiếm..."
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
              <Bell size={20} className="text-slate-600 dark:text-slate-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-bg"></span>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-dark-border mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{user?.name || 'Học viên'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Học viên</p>
              </div>
              <div
                className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-white dark:border-dark-border shadow-sm"
                style={{ backgroundImage: 'url(https://picsum.photos/seed/user1/100/100)' }}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Chào mừng trở lại, {user?.name || 'Học viên'}! 👋</h2>
                <p className="text-slate-500 dark:text-slate-400">Tiếp tục hành trình học tập của bạn cùng EduPlatform.</p>
              </div>
              <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-dark-card px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border shadow-sm">
                <Calendar className="mr-2 text-primary" size={20} />
                <span>24 Tháng 10, 2023</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Khóa học đã đăng ký', value: stats?.enrolledCourses || 0, change: '+2', icon: Book, color: 'text-blue-500' },
                { title: 'Bài học hoàn thành', value: stats?.completedLessons || 0, icon: Clock, color: 'text-yellow-500' },
                { title: 'Chứng chỉ đã đạt', value: stats?.certificates || 0, icon: Award, color: 'text-green-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <stat.icon size={64} className={stat.color} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Learning */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Tiếp tục học</h3>
                <button onClick={() => onNavigate('courses')} className="text-primary text-sm font-medium hover:underline">Xem tất cả</button>
              </div>
              {stats?.recentCourses && stats.recentCourses.length > 0 && (
                <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-64 h-40 flex-shrink-0 rounded-lg bg-cover bg-center overflow-hidden relative group" style={{ backgroundImage: `url(${stats.recentCourses[0].thumbnail})` }}>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="text-white" size={48} />
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mb-2">Frontend Development</span>
                        <h4 className="text-xl font-bold mb-1">{stats.recentCourses[0].title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Tiếp tục chặng đường</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Tiến độ</span>
                        <span className="font-bold">{stats.recentCourses[0].progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full relative" style={{ width: `${stats.recentCourses[0].progress}%` }}>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full shadow"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => onNavigate('course-player')}
                        className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center shadow-lg shadow-blue-500/20"
                      >
                        Tiếp tục học ngay
                        <ArrowRight size={18} className="ml-2" />
                      </button>
                      <button onClick={() => onNavigate('course-player')} className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-dark-border px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
                        Chi tiết khóa học
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Recommendations */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Khóa học đăng ký gần đây</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats?.recentCourses?.map(course => (
                  <div key={course.id} onClick={() => onNavigate('course-player')} className="group bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className="h-44 bg-cover bg-center relative" style={{ backgroundImage: `url(${course.thumbnail || 'https://picsum.photos/seed/course/800/450'})` }}>
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Star size={12} fill="currentColor" className="text-yellow-400" /> {course.rating || '--'}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wide">{course.category || 'Khóa học'}</div>
                      <h4 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h4>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-dark-border">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 dark:text-slate-400">{course.instructor}</span>
                        </div>
                        <span className="font-bold text-primary">{course.progress || 0}% Hoàn thành</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
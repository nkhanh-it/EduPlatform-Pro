import React, { useEffect, useMemo, useState } from 'react';
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
  Star,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Course, Enrollment, User } from '../types';
import { getCourses, getMe, getMyEnrollments, setSelectedCourseId } from '../api';
import { showInfoToast } from '../components/feedback/ToastProvider';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await getMe();
        setUser(me as User);
      } catch {
        setUser(null);
      }

      try {
        const courseData = await getCourses('All', '');
        setCourses(courseData as Course[]);
      } catch {
        setCourses([]);
      }

      try {
        const enrollData = await getMyEnrollments();
        setEnrollments(enrollData as Enrollment[]);
      } catch {
        setEnrollments([]);
      }
    };

    load();
  }, []);

  const currentEnrollment = enrollments.find((item) => item.progressPercent < 100) || enrollments[0];
  const continueCourse = currentEnrollment?.course as Course | undefined;

  const filteredRecommendations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return courses.slice(0, 3);
    }

    return courses
      .filter((course) =>
        course.title.toLowerCase().includes(keyword) ||
        course.instructor.toLowerCase().includes(keyword) ||
        course.category.toLowerCase().includes(keyword),
      )
      .slice(0, 3);
  }, [courses, search]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="student" activePage="student-dashboard" onNavigate={onNavigate} />

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/90 md:px-10">
          <div className="hidden w-64 items-center rounded-full bg-gray-100 px-4 py-2 dark:bg-dark-border md:flex">
            <Search className="text-slate-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400 focus:ring-0 dark:text-white"
              placeholder="Tìm khóa học..."
            />
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => {
                setMessage('Không có thông báo mới.');
                showInfoToast('Không có thông báo mới.');
              }}
              className="relative rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-dark-border"
            >
              <Bell size={20} className="text-slate-600 dark:text-slate-300" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-dark-bg" />
            </button>
            <div className="mx-2 hidden h-8 w-[1px] bg-gray-200 dark:bg-dark-border sm:block" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-none">{user?.displayName || user?.fullName || 'Học viên'}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Học viên</p>
              </div>
              <div
                className="h-10 w-10 rounded-full border-2 border-white bg-cover bg-center shadow-sm dark:border-dark-border"
                style={{ backgroundImage: `url(${user?.avatarUrl || 'https://picsum.photos/seed/user1/100/100'})` }}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="mx-auto max-w-6xl space-y-8 pb-10">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                  Chào mừng trở lại, {user?.displayName || user?.fullName || 'học viên'}!
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Bạn có {enrollments.filter((item) => item.progressPercent < 100).length} khóa học đang theo dõi.
                </p>
              </div>
              <div className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm dark:border-dark-border dark:bg-dark-card dark:text-slate-400">
                <Calendar className="mr-2 text-primary" size={20} />
                <span>{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {message && <p className="text-sm text-slate-500">{message}</p>}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  title: 'Khóa học đã đăng ký',
                  value: enrollments.length,
                  change: `+${Math.min(enrollments.length, 2)}`,
                  icon: Book,
                  color: 'text-blue-500',
                },
                {
                  title: 'Khóa học đang học',
                  value: enrollments.filter((e) => e.progressPercent > 0 && e.progressPercent < 100).length,
                  icon: Clock,
                  color: 'text-yellow-500',
                },
                {
                  title: 'Chứng chỉ đã đạt',
                  value: enrollments.filter((e) => e.progressPercent === 100).length,
                  icon: Award,
                  color: 'text-green-500',
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-dark-border dark:bg-dark-card"
                >
                  <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                    <stat.icon size={64} className={stat.color} />
                  </div>
                  <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{stat.value}</span>
                    {stat.change && (
                      <span className="flex items-center text-xs font-medium text-green-500">
                        <ArrowUp size={14} /> {stat.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Tiếp tục học</h3>
                <button onClick={() => onNavigate('courses')} className="text-sm font-medium text-primary hover:underline">
                  Xem tất cả
                </button>
              </div>

              <div className="flex flex-col items-center gap-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card md:flex-row">
                <div
                  className="group relative h-40 w-full flex-shrink-0 overflow-hidden rounded-lg bg-cover bg-center md:w-64"
                  style={{ backgroundImage: `url(${continueCourse?.thumbnail || courses[0]?.thumbnail || 'https://picsum.photos/seed/course/800/450'})` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <PlayCircle className="text-white" size={48} />
                  </div>
                </div>

                <div className="w-full flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <span className="mb-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {continueCourse?.category || 'Tổng hợp'}
                      </span>
                      <h4 className="mb-1 text-xl font-bold">
                        {continueCourse?.title || courses[0]?.title || 'Khóa học đang cập nhật'}
                      </h4>
                      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Giảng viên: {continueCourse?.instructor || courses[0]?.instructor || 'Đang cập nhật'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-slate-600 dark:text-slate-300">Tiến độ</span>
                      <span className="font-bold">{currentEnrollment?.progressPercent ?? 0}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="relative h-2.5 rounded-full bg-primary" style={{ width: `${currentEnrollment?.progressPercent ?? 0}%` }}>
                        <div className="absolute right-0 top-1/2 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (continueCourse?.id) {
                          setSelectedCourseId(continueCourse.id);
                        }
                        onNavigate('course-player');
                      }}
                      className="flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-600"
                    >
                      Tiếp tục học ngay
                      <ArrowRight size={18} className="ml-2" />
                    </button>
                    <button
                      onClick={() => onNavigate('student-courses')}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-dark-card dark:text-slate-300 dark:hover:bg-dark-border"
                    >
                      Khóa học của tôi
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">Gợi ý dành cho bạn</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecommendations.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      onNavigate('course-detail');
                    }}
                    className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-dark-border dark:bg-dark-card"
                  >
                    <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `url(${course.thumbnail})` }}>
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                        <Star size={12} fill="currentColor" className="text-yellow-400" /> {course.rating}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-primary">{course.category}</div>
                      <h4 className="mb-2 line-clamp-2 text-lg font-bold transition-colors group-hover:text-primary">{course.title}</h4>
                      <div className="mb-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={16} /> {course.totalLessons || 0} bài
                        </span>
                        <span className="flex items-center gap-1">
                          <Book size={16} /> {course.reviews} học viên
                        </span>
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-dark-border">
                        <span className="text-xs text-slate-600 dark:text-slate-400">{course.instructor}</span>
                        <span className="font-bold text-primary">{Number(course.price).toLocaleString('vi-VN')}đ</span>
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

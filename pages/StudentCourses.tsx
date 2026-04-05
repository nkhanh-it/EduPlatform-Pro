<<<<<<< Updated upstream
import React, { useEffect, useState } from 'react';
import {
  Search,
  PlayCircle,
  Award,
  BookOpen,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
=======
﻿import React, { useEffect, useMemo, useState } from 'react';
import { Search, PlayCircle, Award, BookOpen, Clock3 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ControlSelect from '../components/filters/ControlSelect';
>>>>>>> Stashed changes
import { Course, Enrollment, User } from '../types';
import { getMe, getMyEnrollments, setSelectedCourseId } from '../api';

interface StudentCoursesProps {
  onNavigate: (page: string) => void;
}

const StudentCourses: React.FC<StudentCoursesProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [search, setSearch] = useState('');
<<<<<<< Updated upstream
=======
  const [sortMode, setSortMode] = useState<'LATEST' | 'OLDEST' | 'TITLE_ASC' | 'TITLE_DESC' | 'PROGRESS_DESC'>('LATEST');
>>>>>>> Stashed changes
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [me, data] = await Promise.all([getMe(), getMyEnrollments()]);
        setUser(me as User);
        setEnrollments(data as Enrollment[]);
      } catch {
        setError('Đã xảy ra lỗi, vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

<<<<<<< Updated upstream
  const courses = enrollments.map((enrollment) => {
    const course = enrollment.course as Course;
    return {
      ...course,
      progress: enrollment.progressPercent,
      totalLessons: enrollment.totalLessons,
      completedLessons: enrollment.completedLessons,
    } as Course;
  });
=======
  const courses = useMemo(
    () =>
      enrollments.map((enrollment) => {
        const course = enrollment.course as Course;
        return {
          ...course,
          progress: enrollment.progressPercent,
          totalLessons: enrollment.totalLessons,
          completedLessons: enrollment.completedLessons,
          enrolledAt: enrollment.enrolledAt,
        } as Course;
      }),
    [enrollments],
  );

  const stats = useMemo(() => {
    const total = courses.length;
    const inProgress = courses.filter((course) => (course.progress || 0) > 0 && (course.progress || 0) < 100).length;
    const completed = courses.filter((course) => (course.progress || 0) === 100).length;
    return { total, inProgress, completed };
  }, [courses]);

  const filteredCourses = courses
    .filter((course) => {
      if (activeTab === 'in-progress') return (course.progress || 0) > 0 && (course.progress || 0) < 100;
      if (activeTab === 'completed') return (course.progress || 0) === 100;
      return true;
    })
    .filter((course) => {
      if (!search) return true;
      return course.title.toLowerCase().includes(search.toLowerCase()) || course.instructor.toLowerCase().includes(search.toLowerCase());
    });

  const sortedCourses = useMemo(() => {
    const list = [...filteredCourses] as Array<Course & { enrolledAt?: string }>;
    switch (sortMode) {
      case 'OLDEST':
        list.sort((a, b) => new Date(a.enrolledAt || 0).getTime() - new Date(b.enrolledAt || 0).getTime());
        break;
      case 'TITLE_ASC':
        list.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        break;
      case 'TITLE_DESC':
        list.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
        break;
      case 'PROGRESS_DESC':
        list.sort((a, b) => Number(b.progress || 0) - Number(a.progress || 0));
        break;
      default:
        list.sort((a, b) => new Date(b.enrolledAt || 0).getTime() - new Date(a.enrolledAt || 0).getTime());
        break;
    }
    return list;
  }, [filteredCourses, sortMode]);
>>>>>>> Stashed changes

  const filteredCourses = courses
    .filter((course) => {
      if (activeTab === 'in-progress') return (course.progress || 0) > 0 && (course.progress || 0) < 100;
      if (activeTab === 'completed') return (course.progress || 0) === 100;
      return true;
    })
    .filter((course) => {
      if (!search) return true;
      return course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="student" activePage="my-courses" onNavigate={onNavigate} />

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/90 md:px-10">
          <h1 className="text-xl font-bold">Khóa học của tôi</h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-none">{user?.displayName || user?.fullName || 'Học viên'}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Học viên</p>
              </div>
              <div className="size-10 rounded-full border-2 border-white bg-cover bg-center shadow-sm dark:border-dark-border" style={{ backgroundImage: `url(${user?.avatarUrl || 'https://picsum.photos/seed/user1/100/100'})` }} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
<<<<<<< Updated upstream
=======
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tổng khóa học</p>
                <p className="mt-2 text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Clock3 size={16} /> Đang học</div>
                <p className="mt-2 text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Award size={16} /> Hoàn thành</div>
                <p className="mt-2 text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>

>>>>>>> Stashed changes
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="flex rounded-xl border border-gray-200 bg-white p-1 dark:border-dark-border dark:bg-dark-card">
                {['all', 'in-progress', 'completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'all' | 'in-progress' | 'completed')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
<<<<<<< Updated upstream
                      activeTab === tab
                        ? 'bg-primary text-white shadow-md'
                        : 'text-slate-600 hover:text-primary dark:text-slate-400'
=======
                      activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:text-primary dark:text-slate-400'
>>>>>>> Stashed changes
                    }`}
                  >
                    {tab === 'all' ? 'Tất cả' : tab === 'in-progress' ? 'Đang học' : 'Hoàn thành'}
                  </button>
                ))}
              </div>

<<<<<<< Updated upstream
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-dark-border dark:bg-dark-card"
                  placeholder="Tìm khóa học của bạn..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
=======
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-dark-border dark:bg-dark-card"
                    placeholder="Tìm theo tên khóa học hoặc giảng viên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <ControlSelect
                  value={sortMode}
                  onChange={(value) => setSortMode(value as typeof sortMode)}
                  options={[
                    { value: 'LATEST', label: 'Mới ghi danh nhất' },
                    { value: 'OLDEST', label: 'Ghi danh lâu nhất' },
                    { value: 'TITLE_ASC', label: 'Tên A-Z' },
                    { value: 'TITLE_DESC', label: 'Tên Z-A' },
                    { value: 'PROGRESS_DESC', label: 'Tiến độ cao nhất' },
                  ]}
>>>>>>> Stashed changes
                />
              </div>
            </div>

<<<<<<< Updated upstream
            {error && <p className="text-sm text-red-500">{error}</p>}

            {loading ? (
              <p className="text-sm text-slate-500">Đang tải...</p>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl dark:border-dark-border dark:bg-dark-card">
=======
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-card dark:ring-dark-border">
                Sắp xếp: {{
                  LATEST: 'Mới ghi danh nhất',
                  OLDEST: 'Ghi danh lâu nhất',
                  TITLE_ASC: 'Tên A-Z',
                  TITLE_DESC: 'Tên Z-A',
                  PROGRESS_DESC: 'Tiến độ cao nhất',
                }[sortMode]}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-card dark:ring-dark-border">
                Kết quả: {sortedCourses.length} khóa học
              </span>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {loading ? (
              <p className="text-sm text-slate-500">Đang xử lý...</p>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {sortedCourses.map((course) => (
                  <div key={course.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-dark-border dark:bg-dark-card">
>>>>>>> Stashed changes
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <div className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${course.thumbnail})` }} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
<<<<<<< Updated upstream
                          onClick={() => { setSelectedCourseId(course.id); onNavigate('course-player'); }}
=======
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            onNavigate('course-player');
                          }}
>>>>>>> Stashed changes
                          className="translate-y-4 rounded-full bg-primary p-3 text-white shadow-lg transition-all hover:bg-primary-hover group-hover:translate-y-0"
                        >
                          <PlayCircle size={32} />
                        </button>
                      </div>
<<<<<<< Updated upstream
                      {course.progress === 100 && (
=======
                      {(course.progress || 0) === 100 && (
>>>>>>> Stashed changes
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-green-500 px-2 py-1 text-xs font-bold text-white shadow-lg">
                          <Award size={14} /> Hoàn thành
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3">
                        <h3 className="mb-1 line-clamp-2 text-lg font-bold transition-colors group-hover:text-primary">{course.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{course.instructor}</p>
                      </div>

<<<<<<< Updated upstream
                      <div className="mt-auto border-t border-gray-100 pt-4 dark:border-dark-border">
=======
                      <div className="mt-auto rounded-2xl bg-gray-50 p-4 dark:bg-dark-bg">
>>>>>>> Stashed changes
                        <div className="mb-2 flex items-end justify-between">
                          <span className="text-xs font-medium text-slate-500">Đã học {course.completedLessons}/{course.totalLessons} bài</span>
                          <span className="text-sm font-bold text-primary">{course.progress}%</span>
                        </div>
<<<<<<< Updated upstream
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-border">
                          <div className={`h-full rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${course.progress}%` }} />
=======
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-dark-border">
                          <div className={`h-full rounded-full transition-all duration-500 ${(course.progress || 0) === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${course.progress}%` }} />
>>>>>>> Stashed changes
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
<<<<<<< Updated upstream
                          onClick={() => { setSelectedCourseId(course.id); onNavigate('course-player'); }}
                          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
                            course.progress === 100
                              ? 'border border-gray-200 hover:bg-gray-50 dark:border-dark-border dark:hover:bg-dark-border'
                              : 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover'
                          }`}
                        >
                          {course.progress === 100 ? 'Xem lại' : course.progress === 0 ? 'Bắt đầu học' : 'Tiếp tục học'}
=======
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            onNavigate('course-player');
                          }}
                          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${(course.progress || 0) === 100 ? 'border border-gray-200 hover:bg-gray-50 dark:border-dark-border dark:hover:bg-dark-border' : 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover'}`}
                        >
                          {(course.progress || 0) === 100 ? 'Xem lại' : (course.progress || 0) === 0 ? 'Bắt đầu học' : 'Tiếp tục học'}
>>>>>>> Stashed changes
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-card">
                  <BookOpen size={48} className="text-slate-300" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Chưa có khóa học nào</h3>
<<<<<<< Updated upstream
                <p className="mb-6 max-w-md text-slate-500">Khám phá thư viện để bắt đầu.</p>
=======
                <p className="mb-6 max-w-md text-slate-500">Bạn có thể vào thư viện để chọn khóa học phù hợp và bắt đầu học ngay.</p>
>>>>>>> Stashed changes
                <button onClick={() => onNavigate('courses')} className="rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary-hover">Khám phá ngay</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentCourses;

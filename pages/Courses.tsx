import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import ControlSelect from '../components/filters/ControlSelect';
import { Course } from '../types';
import { getCategories, getCourses, setSelectedCourseId } from '../api';

interface CoursesProps {
  onNavigate: (page: string) => void;
}

type CourseSortMode = 'POPULAR' | 'TITLE_ASC' | 'TITLE_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING';

const sortLabels: Record<CourseSortMode, string> = {
  POPULAR: 'Nổi bật nhất',
  TITLE_ASC: 'Tên A-Z',
  TITLE_DESC: 'Tên Z-A',
  PRICE_ASC: 'Giá thấp đến cao',
  PRICE_DESC: 'Giá cao đến thấp',
  RATING: 'Đánh giá cao nhất',
};

const Courses: React.FC<CoursesProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortMode, setSortMode] = useState<CourseSortMode>('POPULAR');
  const [visibleCount, setVisibleCount] = useState(8);

  const loadCourses = async (category: string, query: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await getCourses(category, query);
      setCourses(data as Course[]);
      setVisibleCount(8);
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        const names = Array.isArray(data) ? data.map((c: any) => c.name).filter(Boolean) : [];
        setCategories(['All', ...names]);
      } catch {
        setCategories(['All']);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCourses(selectedCategory, search);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, search]);

  const sortedCourses = useMemo(() => {
    const list = [...courses];
    switch (sortMode) {
      case 'TITLE_ASC':
        list.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        break;
      case 'TITLE_DESC':
        list.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
        break;
      case 'PRICE_ASC':
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'PRICE_DESC':
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'RATING':
        list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      default:
        list.sort((a, b) => Number(b.reviews || 0) - Number(a.reviews || 0));
        break;
    }
    return list;
  }, [courses, sortMode]);

  const visibleCourses = sortedCourses.slice(0, visibleCount);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="student" activePage="courses" onNavigate={onNavigate} />

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/90 md:px-10">
          <h1 className="text-xl font-bold">Thư viện khóa học</h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-none">Nguyen Van A</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Học viên</p>
              </div>
              <div
                className="size-10 rounded-full border-2 border-white bg-cover bg-center shadow-sm dark:border-dark-border"
                style={{ backgroundImage: 'url(https://picsum.photos/seed/user1/100/100)' }}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl md:p-12">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
              <div className="relative z-10 max-w-2xl">
                <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                  Khuyến mãi mùa hè
                </span>
                <h2 className="mb-4 font-display text-3xl font-bold md:text-5xl">Học không giới hạn.</h2>
                <p className="mb-8 max-w-lg text-lg text-blue-100">
                  Mở khóa toàn bộ thư viện học tập với hàng trăm khóa học thực tế, cập nhật liên tục và dễ theo dõi.
                </p>
                <button
                  onClick={() => {
                    if (courses[0]?.id) {
                      setSelectedCourseId(courses[0].id);
                    }
                    onNavigate('course-detail');
                  }}
                  className="rounded-xl bg-white px-8 py-3 font-bold text-blue-600 shadow-lg transition-colors hover:bg-blue-50"
                >
                  Xem khóa học nổi bật
                </button>
              </div>
            </div>

            <div className="sticky top-0 z-10 space-y-4 py-2">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="scrollbar-hide flex w-full gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'border border-gray-200 bg-white text-slate-600 hover:border-primary dark:border-dark-border dark:bg-dark-card dark:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                  <div className="relative flex-1 md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-dark-border dark:bg-dark-card"
                      placeholder="Tìm kiếm khóa học..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <ControlSelect
                    value={sortMode}
                    onChange={(value) => setSortMode(value as CourseSortMode)}
                    options={Object.entries(sortLabels).map(([value, label]) => ({ value, label }))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-card dark:ring-dark-border">
                  Danh mục: {selectedCategory === 'All' ? 'Tất cả' : selectedCategory}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-card dark:ring-dark-border">
                  Sắp xếp: {sortLabels[sortMode]}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-card dark:ring-dark-border">
                  Kết quả: {sortedCourses.length} khóa học
                </span>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading ? (
                <p className="text-sm text-slate-500">Đang tải khóa học...</p>
              ) : (
                visibleCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      onNavigate('course-detail');
                    }}
                    className="h-full"
                  >
                    <CourseCard course={course} />
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-center pb-4 pt-8">
              <button
                onClick={() => setVisibleCount((count) => Math.min(count + 8, sortedCourses.length))}
                disabled={visibleCount >= sortedCourses.length}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition-all hover:border-primary disabled:opacity-50 dark:border-dark-border dark:bg-dark-card dark:text-slate-300"
              >
                Xem thêm khóa học <ChevronDown size={18} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Courses;

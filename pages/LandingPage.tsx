import React, { useEffect, useState } from 'react';
import { Search, Menu, PlayCircle, TrendingUp, Star, Users, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { Course } from '../types';
import { getCourses, setSelectedCourseId } from '../api';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCourses('All', '');
        setCourses(data as Course[]);
      } catch {
        setCourses([]);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-display bg-[#f5f7f8] dark:bg-[#101922]">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-dark-border dark:bg-dark-card/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-primary">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="text-primary" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Edu Platform</span>
            </button>

            <div className="hidden max-w-md md:flex">
              <div className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="text-slate-400" size={20} />
                </div>
                <input
                  type="text"
                  className="block min-w-[300px] w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg dark:text-white"
                  placeholder="Tìm khóa học, giảng viên..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-6 lg:flex">
              <button onClick={() => onNavigate('courses')} className="text-sm font-medium text-slate-700 transition-colors hover:text-primary dark:text-slate-300">
                Khóa học
              </button>
              <button onClick={() => scrollToSection('gioi-thieu')} className="text-sm font-medium text-slate-700 transition-colors hover:text-primary dark:text-slate-300">
                Giới thiệu
              </button>
              <button onClick={() => scrollToSection('lien-he')} className="text-sm font-medium text-slate-700 transition-colors hover:text-primary dark:text-slate-300">
                Liên hệ
              </button>
            </nav>
            <div className="flex items-center gap-3">
              <button onClick={() => onNavigate('auth')} className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/5 sm:inline-flex">
                Đăng nhập
              </button>
              <button onClick={() => onNavigate('auth')} className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover">
                Đăng ký
              </button>
            </div>
            <button onClick={() => setIsMobileMenuOpen((open) => !open)} className="text-slate-700 dark:text-white lg:hidden">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 px-4 py-4 dark:border-dark-border lg:hidden">
            <div className="flex flex-col gap-3">
              <button onClick={() => onNavigate('courses')} className="text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                Khóa học
              </button>
              <button onClick={() => scrollToSection('gioi-thieu')} className="text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                Giới thiệu
              </button>
              <button onClick={() => scrollToSection('lien-he')} className="text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                Liên hệ
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <section id="gioi-thieu" className="relative overflow-hidden py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col gap-6 text-center lg:text-left">
                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
                    Nâng tầm <span className="text-primary">kỹ năng</span> của bạn ngay hôm nay
                  </h1>
                  <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400 lg:mx-0">
                    Học từ các chuyên gia hàng đầu với hàng ngàn khóa học video chất lượng cao. Khám phá tiềm năng của bạn và thăng tiến trong sự nghiệp.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <button onClick={() => onNavigate('auth')} className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:scale-105 hover:bg-primary-hover">
                    Bắt đầu ngay
                  </button>
                  <button onClick={() => onNavigate('courses')} className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-200 bg-transparent px-8 text-base font-bold text-slate-900 transition-colors hover:bg-black/5 dark:border-dark-border dark:text-white dark:hover:bg-white/5">
                    <PlayCircle className="mr-2" size={20} />
                    Xem demo
                  </button>
                </div>
              </div>

              <div className="relative lg:order-last">
                <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/20 shadow-2xl lg:max-w-none">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/student/800/800')" }} />
                  <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-lg backdrop-blur dark:border-dark-border dark:bg-dark-card/90">
                    <div className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tiến độ học tập</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">Hoàn thành 85%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white py-12 dark:border-dark-border dark:bg-dark-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-2 rounded-full bg-primary/10 p-3 text-primary">
                  <Users size={32} />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">10k+</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Học viên</p>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-2 rounded-full bg-purple-500/10 p-3 text-purple-500">
                  <BookOpen size={32} />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">500+</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Khóa học</p>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-2 rounded-full bg-orange-500/10 p-3 text-orange-500">
                  <Star size={32} />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">50+</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Giảng viên</p>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-2 rounded-full bg-green-500/10 p-3 text-green-500">
                  <Star size={32} fill="currentColor" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">4.8/5</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đánh giá</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Khóa học nổi bật</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Các khóa học được quan tâm nhất tuần qua</p>
              </div>
              <button onClick={() => onNavigate('courses')} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
                Xem tất cả
                <TrendingUp size={16} />
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    onNavigate('course-detail');
                  }}
                  className="h-full cursor-pointer"
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="lien-he" className="border-t border-gray-200 bg-white pb-8 pt-12 dark:border-dark-border dark:bg-dark-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Edu Platform</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nền tảng học tập trực tuyến cho các khóa học kỹ năng và nghề nghiệp.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Liên hệ</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Email: support@eduplatform.vn</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hotline: 1900 1234</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Địa chỉ</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">TP. Hồ Chí Minh, Việt Nam</p>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8 text-center dark:border-dark-border">
            <p className="text-sm text-slate-500 dark:text-slate-400">© 2023 Edu Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

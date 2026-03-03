import React from 'react';
import { Search, Menu, PlayCircle, TrendingUp, Star, Users, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { COURSES } from '../constants';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col font-display bg-[#f5f7f8] dark:bg-[#101922]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-dark-border bg-white/90 dark:bg-dark-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-primary">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="text-primary" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Edu Platform</span>
            </button>
            
            <div className="hidden md:flex max-w-md">
              <div className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="text-slate-400" size={20} />
                </div>
                <input 
                  type="text"
                  className="block w-full rounded-full border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none min-w-[300px]"
                  placeholder="Tìm khóa học, giảng viên..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6">
              <button onClick={() => onNavigate('courses')} className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Khóa học</button>
              <button className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Giới thiệu</button>
              <button className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Liên hệ</button>
            </nav>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onNavigate('auth')}
                className="hidden sm:inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => onNavigate('auth')}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
              >
                Đăng ký
              </button>
            </div>
            <button className="lg:hidden text-slate-700 dark:text-white">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24">
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
                  <button onClick={() => onNavigate('courses')} className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-200 dark:border-dark-border bg-transparent px-8 text-base font-bold text-slate-900 dark:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <PlayCircle className="mr-2" size={20} />
                    Xem demo
                  </button>
                </div>
              </div>
              
              <div className="relative lg:order-last">
                <div className="relative aspect-square w-full max-w-lg mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-purple-500/20">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/student/800/800')" }}></div>
                  
                  {/* Floating Stats */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-dark-card/90 backdrop-blur p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border flex items-center gap-4 animate-bounce duration-[3000ms]">
                    <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
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

        {/* Stats Section */}
        <section className="border-y border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card py-12">
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

        {/* Featured Courses */}
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
              {COURSES.map(course => (
                <div key={course.id} onClick={() => onNavigate('checkout')} className="cursor-pointer h-full">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-12 border-t border-gray-200 dark:border-dark-border pt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">© 2023 Edu Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
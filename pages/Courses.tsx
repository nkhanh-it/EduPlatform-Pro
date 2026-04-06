import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown, BookOpen } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import { COURSES } from '../constants';

interface CoursesProps {
  onNavigate: (page: string) => void;
}

const Courses: React.FC<CoursesProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Web Dev', 'Data Science', 'Mobile', 'Design', 'Business', 'Marketing'];

  return (
    <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
      <Sidebar role="student" activePage="courses" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex-shrink-0 border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-bg/90 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-xl font-bold">Thư viện khóa học</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">Nguyễn Văn A</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Học viên</p>
              </div>
              <div 
                className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-dark-border shadow-sm"
                style={{ backgroundImage: 'url(https://picsum.photos/seed/user1/100/100)' }}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
           <div className="max-w-7xl mx-auto space-y-8">
              {/* Hero Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
                 <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                 <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4 backdrop-blur-sm border border-white/20">Khuyến mãi mùa hè</span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">Học không giới hạn.</h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-lg">Mở khóa toàn bộ 500+ khóa học cao cấp chỉ với <span className="font-bold text-white">299k/tháng</span>.</p>
                    <button onClick={() => onNavigate('checkout')} className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">Đăng ký Pro ngay</button>
                 </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-10 py-2">
                 <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                    {categories.map(cat => (
                       <button 
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                             selectedCategory === cat 
                             ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                             : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-primary'
                          }`}
                       >
                          {cat}
                       </button>
                    ))}
                 </div>

                 <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input 
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                          placeholder="Tìm kiếm khóa học..."
                       />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                       <SlidersHorizontal size={18} />
                       <span className="hidden sm:inline">Bộ lọc</span>
                    </button>
                 </div>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {/* Map existing courses */}
                 {COURSES.map(course => (
                    <div key={course.id} onClick={() => onNavigate('checkout')} className="h-full">
                       <CourseCard course={course} />
                    </div>
                 ))}
                 {/* Duplicate for demo grid */}
                 {COURSES.map((course, idx) => (
                    <div key={`dup-${idx}`} onClick={() => onNavigate('checkout')} className="h-full">
                       <CourseCard course={{...course, id: `dup-${course.id}`, title: `Advanced ${course.title}`}} />
                    </div>
                 ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center pt-8 pb-4">
                 <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm font-bold hover:border-primary text-slate-600 dark:text-slate-300 transition-all">
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

import React, { useState } from 'react';
import {
   Search,
   PlayCircle,
   Award,
   BookOpen
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Course } from '../types';
import { useAuth } from '../AuthContext';

interface StudentCoursesProps {
   onNavigate: (page: string) => void;
}

const StudentCourses: React.FC<StudentCoursesProps> = ({ onNavigate }) => {
   const { user } = useAuth();
   const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');
   const courses: Course[] = [];

   const filteredCourses = courses.filter(course => {
      if (activeTab === 'in-progress') return (course.progress || 0) > 0 && (course.progress || 0) < 100;
      if (activeTab === 'completed') return (course.progress || 0) === 100;
      return true;
   });

   return (
      <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
         <Sidebar role="student" activePage="my-courses" onNavigate={onNavigate} />

         <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <header className="h-16 flex-shrink-0 border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-bg/90 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-20">
               <h1 className="text-xl font-bold">Khóa học của tôi</h1>

               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                     <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold leading-none">{user?.name || 'Học viên'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Học viên</p>
                     </div>
                     <div
                        className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-dark-border shadow-sm"
                        style={{ backgroundImage: `url(${user?.avatar || 'https://picsum.photos/seed/user1/100/100'})` }}
                     />
                  </div>
               </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-8">
               <div className="max-w-7xl mx-auto space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div className="flex p-1 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border">
                        {['all', 'in-progress', 'completed'].map(tab => (
                           <button
                              key={tab}
                              onClick={() => setActiveTab(tab as any)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab
                                 ? 'bg-primary text-white shadow-md'
                                 : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                                 }`}
                           >
                              {tab === 'all' ? 'Tất cả' : tab === 'in-progress' ? 'Đang học' : 'Hoàn thành'}
                           </button>
                        ))}
                     </div>

                     <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                           className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                           placeholder="Tìm khóa học của bạn..."
                        />
                     </div>
                  </div>

                  {filteredCourses.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCourses.map(course => (
                           <div key={course.id} className="group bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                              <div className="relative h-48 bg-gray-200 overflow-hidden">
                                 <div
                                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                    style={{ backgroundImage: `url(${course.thumbnail})` }}
                                 />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => onNavigate('course-player')} className="bg-primary text-white rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-lg hover:bg-primary-hover">
                                       <PlayCircle size={32} />
                                    </button>
                                 </div>
                                 {course.progress === 100 && (
                                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                                       <Award size={14} /> Hoàn thành
                                    </div>
                                 )}
                              </div>

                              <div className="p-5 flex-1 flex flex-col">
                                 <div className="mb-3">
                                    <h3 className="font-bold text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{course.instructor}</p>
                                 </div>

                                 <div className="mt-auto pt-4 border-t border-gray-100 dark:border-dark-border">
                                    <div className="flex justify-between items-end mb-2">
                                       <span className="text-xs font-medium text-slate-500">Đã học {course.completedLessons}/{course.totalLessons} bài</span>
                                       <span className="text-sm font-bold text-primary">{course.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                                       <div
                                          className={`h-full rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                                          style={{ width: `${course.progress}%` }}
                                       ></div>
                                    </div>
                                 </div>

                                 <div className="mt-5 flex gap-3">
                                    <button
                                       onClick={() => onNavigate('course-player')}
                                       className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${course.progress === 100
                                          ? 'border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border'
                                          : 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover'
                                          }`}
                                    >
                                       {course.progress === 100 ? 'Xem lại' : course.progress === 0 ? 'Bắt đầu học' : 'Tiếp tục học'}
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-24 rounded-full bg-gray-100 dark:bg-dark-card flex items-center justify-center mb-4">
                           <BookOpen size={48} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Chưa có khóa học nào</h3>
                        <p className="text-slate-500 max-w-md mb-6">Khám phá thư viện để bắt đầu.</p>
                        <button onClick={() => onNavigate('courses')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover">Khám phá ngay</button>
                     </div>
                  )}
               </div>
            </main>
         </div>
      </div>
   );
};

export default StudentCourses;

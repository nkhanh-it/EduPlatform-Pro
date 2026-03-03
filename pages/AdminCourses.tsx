import React from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  Star,
  BookOpen,
  Users
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { COURSES } from '../constants';

interface AdminCoursesProps {
  onNavigate: (page: string) => void;
}

const AdminCourses: React.FC<AdminCoursesProps> = ({ onNavigate }) => {
  return (
    <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
      <Sidebar role="admin" activePage="admin-courses" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-dark-border bg-white/90 dark:bg-dark-card/90 backdrop-blur-md px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold leading-tight">Quản lý khóa học</h2>
          </div>
          <div className="flex flex-1 justify-end gap-6 items-center">
            <button className="relative text-slate-500 hover:text-primary transition-colors">
               <Bell size={20} />
               <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-bg"></span>
            </button>
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">Admin User</p>
                  <p className="text-xs text-slate-500 mt-1">Quản trị viên</p>
               </div>
               <div className="size-10 rounded-full bg-cover bg-center border-2 border-gray-200 dark:border-dark-border" style={{ backgroundImage: 'url(https://picsum.photos/seed/admin/100/100)' }}></div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
           <div className="w-full max-w-[1200px] flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Danh Sách Khóa Học</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý nội dung, giá cả và trạng thái các khóa học.</p>
                 </div>
                 <button className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary hover:bg-blue-600 transition-all text-white text-sm font-bold shadow-lg shadow-primary/30">
                    <Plus size={20} />
                    <span>Tạo khóa học mới</span>
                 </button>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 flex flex-col gap-4">
                 <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                       <input className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl h-11 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Tìm kiếm tên khóa học, giảng viên..." />
                    </div>
                    <div className="flex gap-2">
                       <button className="flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border font-medium text-sm hover:border-primary transition-colors">
                          <Filter size={18} />
                          <span>Danh mục</span>
                       </button>
                       <button className="flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border font-medium text-sm hover:border-primary transition-colors">
                          <Filter size={18} />
                          <span>Trạng thái</span>
                       </button>
                    </div>
                 </div>
              </div>

              {/* Course Grid/List */}
              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                          <tr>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Thông tin khóa học</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Giảng viên</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Thống kê</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Giá bán</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-sm">
                          {COURSES.map((course) => (
                             <tr key={course.id} className="group hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                                <td className="p-4 max-w-[300px]">
                                   <div className="flex gap-3">
                                      <div className="w-16 h-10 rounded-lg bg-cover bg-center shrink-0 border border-gray-200 dark:border-dark-border" style={{ backgroundImage: `url(${course.thumbnail})` }}></div>
                                      <div className="min-w-0">
                                         <p className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{course.title}</p>
                                         <p className="text-xs text-slate-500">{course.category}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                                   {course.instructor}
                                </td>
                                <td className="p-4">
                                   <div className="flex flex-col gap-1 text-xs text-slate-500">
                                      <div className="flex items-center gap-1"><Users size={12} /> {course.reviews} học viên</div>
                                      <div className="flex items-center gap-1"><BookOpen size={12} /> {course.totalLessons || 24} bài học</div>
                                      <div className="flex items-center gap-1"><Star size={12} className="text-yellow-500" fill="currentColor" /> {course.rating}</div>
                                   </div>
                                </td>
                                <td className="p-4">
                                   <div className="flex flex-col">
                                      <span className="font-bold text-primary">{course.price.toLocaleString('vi-VN')}đ</span>
                                      <span className="text-xs text-slate-400 line-through">{course.originalPrice.toLocaleString('vi-VN')}đ</span>
                                   </div>
                                </td>
                                <td className="p-4 text-center">
                                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                      Công khai
                                   </span>
                                </td>
                                <td className="p-4">
                                   <div className="flex items-center justify-end gap-2">
                                      <button className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit size={18} /></button>
                                      <button className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                      <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"><MoreVertical size={18} /></button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCourses;

import React from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Filter, 
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Lock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { STUDENTS } from '../constants';

interface StudentListProps {
  onNavigate: (page: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ onNavigate }) => {
  return (
    <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
      <Sidebar role="admin" activePage="admin-students" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-dark-border bg-white/90 dark:bg-dark-card/90 backdrop-blur-md px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold leading-tight">Admin Portal</h2>
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
                    <h1 className="text-3xl font-bold tracking-tight">Quản Lý Học Viên</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Danh sách và quản lý thông tin học viên trong hệ thống.</p>
                 </div>
                 <button className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary hover:bg-blue-600 transition-all text-white text-sm font-bold shadow-lg shadow-primary/30">
                    <Plus size={20} />
                    <span>Thêm học viên mới</span>
                 </button>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 flex flex-col gap-4">
                 <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                       <input className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl h-11 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..." />
                    </div>
                    <div className="flex gap-2">
                       <button className="flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border font-medium text-sm hover:border-primary transition-colors">
                          <Calendar size={18} />
                          <span>Ngày đăng ký</span>
                       </button>
                       <button className="flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border font-medium text-sm hover:border-primary transition-colors">
                          <Filter size={18} />
                          <span>Bộ lọc khác</span>
                       </button>
                    </div>
                 </div>
                 <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-sm font-medium text-slate-500 mr-2">Trạng thái:</span>
                    <button className="h-8 px-4 rounded-lg bg-gray-100 dark:bg-dark-border text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Tất cả</button>
                    <button className="h-8 px-4 rounded-lg border border-gray-200 dark:border-dark-border text-slate-500 text-sm font-medium hover:text-primary hover:border-primary transition-colors">Đang hoạt động</button>
                    <button className="h-8 px-4 rounded-lg border border-gray-200 dark:border-dark-border text-slate-500 text-sm font-medium hover:text-primary hover:border-primary transition-colors">Đã khóa</button>
                 </div>
              </div>

              {/* Table */}
              <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
                 <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-gray-50 dark:bg-dark-bg sticky top-0 z-10">
                          <tr>
                             <th className="p-4 w-[50px] text-center"><input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-primary size-4" /></th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Học viên</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Liên hệ</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày đăng ký</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Khóa học</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-sm">
                          {STUDENTS.map((student) => (
                             <tr key={student.id} className="group hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                                <td className="p-4 text-center"><input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-primary size-4" /></td>
                                <td className="p-4">
                                   <div className="flex items-center gap-3">
                                      <div className="size-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-dark-border" style={{ backgroundImage: `url(${student.avatar})` }}></div>
                                      <div>
                                         <p className="font-bold">{student.name}</p>
                                         <p className="text-xs text-slate-500">{student.id}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="p-4">
                                   <div className="flex flex-col">
                                      <span className="truncate">{student.email}</span>
                                      <span className="text-xs text-slate-500 mt-0.5">{student.phone}</span>
                                   </div>
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">{student.joinDate}</td>
                                <td className="p-4 text-center">
                                   <span className="inline-flex items-center justify-center size-7 rounded-full bg-gray-100 dark:bg-dark-border text-xs font-bold">{student.coursesEnrolled}</span>
                                </td>
                                <td className="p-4">
                                   <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                      student.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/10' :
                                      student.status === 'locked' ? 'bg-red-500/10 text-red-600 border-red-500/10' :
                                      'bg-slate-500/10 text-slate-600 border-slate-500/10'
                                   }`}>
                                      <div className="size-1.5 rounded-full bg-current"></div>
                                      {student.status === 'active' ? 'Hoạt động' : student.status === 'locked' ? 'Đã khóa' : 'Chưa xác thực'}
                                   </div>
                                </td>
                                <td className="p-4">
                                   <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                      <button className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Eye size={18} /></button>
                                      <button className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"><Edit size={18} /></button>
                                      <button className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Lock size={18} /></button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 {/* Pagination */}
                 <div className="border-t border-gray-200 dark:border-dark-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-dark-bg">
                    <div className="text-sm text-slate-500">Hiển thị <span className="font-medium text-slate-900 dark:text-white">1-5</span> trong số <span className="font-medium text-slate-900 dark:text-white">1,248</span> học viên</div>
                    <div className="flex items-center gap-2">
                       <div className="flex">
                          <button className="flex items-center justify-center h-9 px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-500 hover:text-primary hover:bg-gray-50 transition-colors"><ChevronLeft size={18} /></button>
                          <button className="flex items-center justify-center h-9 w-9 border border-r-0 border-gray-300 dark:border-dark-border bg-primary text-white text-sm font-medium">1</button>
                          <button className="flex items-center justify-center h-9 w-9 border border-r-0 border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-400 hover:bg-gray-50 transition-colors text-sm font-medium">2</button>
                          <button className="flex items-center justify-center h-9 w-9 border border-r-0 border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-400 hover:bg-gray-50 transition-colors text-sm font-medium hidden sm:flex">3</button>
                          <span className="flex items-center justify-center h-9 w-9 border border-r-0 border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-500 text-sm"><MoreHorizontal size={14} /></span>
                          <button className="flex items-center justify-center h-9 px-3 rounded-r-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-500 hover:text-primary hover:bg-gray-50 transition-colors"><ChevronRight size={18} /></button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default StudentList;

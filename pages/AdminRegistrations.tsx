import React, { useEffect, useState } from 'react';
import {
   Search,
   Bell,
   Filter,
   MoreVertical,
   CheckCircle,
   XCircle,
   Calendar,
   Download
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { AdminEnrollment } from '../apiTypes';
import { useAuth } from '../AuthContext';

interface AdminRegistrationsProps {
   onNavigate: (page: string) => void;
}

const AdminRegistrations: React.FC<AdminRegistrationsProps> = ({ onNavigate }) => {
   const { user } = useAuth();
   const [registrations, setRegistrations] = useState<AdminEnrollment[]>([]);

   const loadRegistrations = async () => {
      setRegistrations([]);
   };

   useEffect(() => {
      loadRegistrations();
   }, []);

   const handleApprove = async (id: number) => {
      setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, status: 'completed' } : reg));
   };

   const handleReject = async (id: number) => {
      setRegistrations(prev => prev.filter(reg => reg.id !== id));
   };

   return (
      <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
         <Sidebar role="admin" activePage="admin-registrations" onNavigate={onNavigate} />

         <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-dark-border bg-white/90 dark:bg-dark-card/90 backdrop-blur-md px-6 py-3">
               <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold leading-tight">Quản lý Đăng Ký</h2>
               </div>
               <div className="flex flex-1 justify-end gap-6 items-center">
                  <button className="relative text-slate-500 hover:text-primary transition-colors">
                     <Bell size={20} />
                  </button>
                  <div className="flex items-center gap-3">
                     <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold leading-none">{user?.name || 'Admin'}</p>
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
                        <h1 className="text-3xl font-bold tracking-tight">Đăng Ký Khóa Học</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Theo dõi trạng thái đăng ký và xét duyệt học viên.</p>
                     </div>
                     <button className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border transition-all text-sm font-bold">
                        <Download size={18} />
                        <span>Xuất Excel</span>
                     </button>
                  </div>

                  {/* Filters */}
                  <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 flex flex-col gap-4">
                     <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                           <input className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl h-11 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Tìm kiếm mã đơn, học viên..." />
                        </div>
                        <div className="flex gap-2">
                           <button className="flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border font-medium text-sm hover:border-primary transition-colors">
                              <Calendar size={18} />
                              <span>Thời gian</span>
                           </button>
                           <button className="flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border font-medium text-sm hover:border-primary transition-colors">
                              <Filter size={18} />
                              <span>Trạng thái</span>
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                              <tr>
                                 <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Mã đơn</th>
                                 <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Học viên</th>
                                 <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Khóa học đăng ký</th>
                                 <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                                 <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                                 <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-sm">
                              {registrations.map((reg) => (
                                 <tr key={reg.id} className="group hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                                    <td className="p-4 font-mono text-xs text-slate-500">#{reg.id}</td>
                                    <td className="p-4">
                                       <div className="flex items-center gap-3">
                                          <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${reg.student.avatar})` }}></div>
                                          <div>
                                             <p className="font-bold">{reg.student.name}</p>
                                             <p className="text-xs text-slate-500">{reg.student.email}</p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="p-4">
                                       <p className="font-medium line-clamp-1">{reg.course.title}</p>
                                       <p className="text-xs text-primary font-bold">{reg.amount.toLocaleString('vi-VN')}đ</p>
                                    </td>
                                    <td className="p-4 text-slate-500">{reg.date}</td>
                                    <td className="p-4 text-center">
                                       {reg.status === 'completed' ? (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                             Đã duyệt
                                          </span>
                                       ) : (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                             Chờ duyệt
                                          </span>
                                       )}
                                    </td>
                                    <td className="p-4">
                                       <div className="flex items-center justify-end gap-2">
                                          {reg.status === 'pending' && (
                                             <>
                                                <button
                                                   className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                   title="Duyệt"
                                                   onClick={() => handleApprove(reg.id)}
                                                >
                                                   <CheckCircle size={18} />
                                                </button>
                                                <button
                                                   className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                   title="Từ chối"
                                                   onClick={() => handleReject(reg.id)}
                                                >
                                                   <XCircle size={18} />
                                                </button>
                                             </>
                                          )}
                                          <button className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"><MoreVertical size={18} /></button>
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

export default AdminRegistrations;

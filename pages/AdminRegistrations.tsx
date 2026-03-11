import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
   Search,
   Bell,
   Filter,
   CheckCircle,
   XCircle,
   Calendar,
   Download,
   Loader2,
   Users,
   ChevronDown,
   ChevronLeft,
   ChevronRight,
   MoreHorizontal,
   Eye,
   X,
   AlertTriangle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../AuthContext';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import * as XLSX from 'xlsx';

interface AdminRegistrationsProps {
   onNavigate: (page: string) => void;
}

interface RegistrationData {
   id: string;
   studentName: string;
   studentEmail: string;
   studentAvatar: string;
   studentId: string;
   courseName: string;
   coursePrice: number;
   createdAt: string;
   createdAtRaw: Date | null;
   status: string; // pending | completed | rejected
}

type ToastType = { message: string; type: 'success' | 'error' } | null;
type ModalType = 'approve' | 'reject' | 'detail' | null;

const AdminRegistrations: React.FC<AdminRegistrationsProps> = ({ onNavigate }) => {
   const { user } = useAuth();

   // Data
   const [allRegistrations, setAllRegistrations] = useState<RegistrationData[]>([]);
   const [loading, setLoading] = useState(true);

   // Filters
   const [searchTerm, setSearchTerm] = useState('');
   const [debouncedSearch, setDebouncedSearch] = useState('');
   const [statusFilter, setStatusFilter] = useState<string | null>(null);
   const [showStatusDropdown, setShowStatusDropdown] = useState(false);
   const [showDatePicker, setShowDatePicker] = useState(false);
   const [startDate, setStartDate] = useState('');
   const [endDate, setEndDate] = useState('');

   // Pagination
   const [currentPage, setCurrentPage] = useState(0);
   const pageSize = 10;

   // Modal
   const [activeModal, setActiveModal] = useState<ModalType>(null);
   const [targetReg, setTargetReg] = useState<RegistrationData | null>(null);
   const [actionLoading, setActionLoading] = useState(false);

   // Toast
   const [toast, setToast] = useState<ToastType>(null);

   // Refs
   const dateRef = useRef<HTMLDivElement>(null);
   const statusRef = useRef<HTMLDivElement>(null);
   const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

   // ─── Toast helper ────────────────────────────────────────────────────
   const showToast = useCallback((message: string, type: 'success' | 'error') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
   }, []);

   // ─── Fetch enrollments from Firestore ────────────────────────────────
   const fetchRegistrations = useCallback(async () => {
      try {
         setLoading(true);
         const q = query(collection(db, 'enrollments'));
         const snapshot = await getDocs(q);
         const fetched: RegistrationData[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const createdAt = data.createdAt?.toDate?.() || (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null);
            return {
               id: docSnap.id,
               studentName: data.studentName || 'Chưa rõ',
               studentEmail: data.studentEmail || '',
               studentAvatar: data.studentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.studentName || 'U')}&background=6366f1&color=fff`,
               studentId: data.studentId || '',
               courseName: data.courseName || 'Chưa rõ',
               coursePrice: data.coursePrice || 0,
               createdAt: createdAt ? createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Mới đây',
               createdAtRaw: createdAt,
               status: data.status || 'pending',
            };
         });
         // Sort by date desc
         fetched.sort((a, b) => (b.createdAtRaw?.getTime() || 0) - (a.createdAtRaw?.getTime() || 0));
         setAllRegistrations(fetched);
      } catch (error: any) {
         console.error('Fetch registrations error:', error);
         showToast('Không thể tải danh sách đăng ký: ' + (error.message || ''), 'error');
         setAllRegistrations([]);
      } finally {
         setLoading(false);
      }
   }, [showToast]);

   useEffect(() => { fetchRegistrations(); }, []);

   // ─── Debounced search ─────────────────────────────────────────────────
   useEffect(() => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
         setDebouncedSearch(searchTerm);
         setCurrentPage(0);
      }, 500);
      return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
   }, [searchTerm]);

   // ─── Client-side filtering ────────────────────────────────────────────
   const filteredRegistrations = useMemo(() => {
      let result = [...allRegistrations];

      // Search
      if (debouncedSearch) {
         const term = debouncedSearch.toLowerCase();
         result = result.filter(r =>
            r.id.toLowerCase().includes(term) ||
            r.studentName.toLowerCase().includes(term) ||
            r.studentEmail.toLowerCase().includes(term) ||
            r.courseName.toLowerCase().includes(term)
         );
      }

      // Status
      if (statusFilter) {
         result = result.filter(r => r.status === statusFilter);
      }

      // Date range
      if (startDate) {
         const start = new Date(startDate);
         result = result.filter(r => r.createdAtRaw && r.createdAtRaw >= start);
      }
      if (endDate) {
         const end = new Date(endDate);
         end.setHours(23, 59, 59, 999);
         result = result.filter(r => r.createdAtRaw && r.createdAtRaw <= end);
      }

      return result;
   }, [allRegistrations, debouncedSearch, statusFilter, startDate, endDate]);

   const totalElements = filteredRegistrations.length;
   const totalPages = Math.ceil(totalElements / pageSize);
   const paginatedData = filteredRegistrations.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

   // ─── Click outside ────────────────────────────────────────────────────
   useEffect(() => {
      const handleClick = (e: MouseEvent) => {
         if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
         if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusDropdown(false);
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
   }, []);

   // ─── Actions ─────────────────────────────────────────────────────────
   const handleApprove = async () => {
      if (!targetReg) return;
      try {
         setActionLoading(true);
         await updateDoc(doc(db, 'enrollments', targetReg.id), { status: 'completed' });
         showToast(`Đã duyệt đăng ký của ${targetReg.studentName}`, 'success');
         setActiveModal(null);
         setTargetReg(null);
         fetchRegistrations();
      } catch (error: any) {
         showToast('Duyệt thất bại: ' + (error.message || ''), 'error');
      } finally {
         setActionLoading(false);
      }
   };

   const handleReject = async () => {
      if (!targetReg) return;
      try {
         setActionLoading(true);
         await updateDoc(doc(db, 'enrollments', targetReg.id), { status: 'rejected' });
         showToast(`Đã từ chối đăng ký của ${targetReg.studentName}`, 'success');
         setActiveModal(null);
         setTargetReg(null);
         fetchRegistrations();
      } catch (error: any) {
         showToast('Từ chối thất bại: ' + (error.message || ''), 'error');
      } finally {
         setActionLoading(false);
      }
   };

   // ─── Excel Export ────────────────────────────────────────────────────
   const handleExportExcel = () => {
      if (filteredRegistrations.length === 0) {
         showToast('Không có dữ liệu để xuất', 'error');
         return;
      }

      const excelData = filteredRegistrations.map((reg, idx) => ({
         'STT': idx + 1,
         'Mã Đơn': reg.id,
         'Học Viên': reg.studentName,
         'Email': reg.studentEmail,
         'Khóa Học Đăng Ký': reg.courseName,
         'Học Phí': reg.coursePrice > 0 ? reg.coursePrice.toLocaleString('vi-VN') + 'đ' : 'Miễn phí',
         'Ngày Tạo': reg.createdAt,
         'Trạng Thái': reg.status === 'completed' ? 'Đã duyệt' : reg.status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt',
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-fit column widths
      const colWidths = Object.keys(excelData[0]).map(key => ({
         wch: Math.max(
            key.length + 2,
            ...excelData.map(row => String((row as any)[key]).length + 2)
         )
      }));
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Đăng Ký Khóa Học');

      const today = new Date().toLocaleDateString('vi-VN').replace(/\//g, '_');
      const fileName = `Danh_Sach_Dang_Ky_${today}.xlsx`;

      XLSX.writeFile(workbook, fileName);
      showToast(`Đã xuất ${filteredRegistrations.length} bản ghi ra file Excel`, 'success');
   };

   // ─── Status badge ────────────────────────────────────────────────────
   const statusBadge = (status: string) => {
      const config: Record<string, { styles: string; label: string }> = {
         pending: { styles: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', label: 'Chờ duyệt' },
         completed: { styles: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Đã duyệt' },
         rejected: { styles: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'Đã từ chối' },
      };
      const c = config[status] || config.pending;
      return (
         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.styles}`}>
            <div className="size-1.5 rounded-full bg-current"></div>
            {c.label}
         </span>
      );
   };

   // ─── Pagination ──────────────────────────────────────────────────────
   const getPageNumbers = () => {
      const pages: (number | '...')[] = [];
      if (totalPages <= 7) {
         for (let i = 0; i < totalPages; i++) pages.push(i);
      } else {
         pages.push(0);
         if (currentPage > 2) pages.push('...');
         for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) pages.push(i);
         if (currentPage < totalPages - 3) pages.push('...');
         pages.push(totalPages - 1);
      }
      return pages;
   };

   const startItem = totalElements > 0 ? currentPage * pageSize + 1 : 0;
   const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

   // Stats
   const pendingCount = allRegistrations.filter(r => r.status === 'pending').length;
   const completedCount = allRegistrations.filter(r => r.status === 'completed').length;
   const rejectedCount = allRegistrations.filter(r => r.status === 'rejected').length;

   return (
      <>
         <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
            <Sidebar role="admin" activePage="admin-registrations" onNavigate={onNavigate} />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
               {/* Header */}
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
                     {/* Title + Export button */}
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                           <h1 className="text-3xl font-bold tracking-tight">Đăng Ký Khóa Học</h1>
                           <p className="text-slate-500 dark:text-slate-400 mt-1">Theo dõi trạng thái đăng ký và xét duyệt học viên.</p>
                        </div>
                        <button
                           onClick={handleExportExcel}
                           className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-green-600 hover:bg-green-700 transition-all text-white text-sm font-bold shadow-lg shadow-green-600/30"
                        >
                           <Download size={18} />
                           <span>Xuất Excel</span>
                        </button>
                     </div>

                     {/* Stats cards */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 flex items-center gap-4">
                           <div className="flex items-center justify-center size-11 rounded-xl bg-yellow-500/10 text-yellow-500"><AlertTriangle size={22} /></div>
                           <div>
                              <p className="text-2xl font-bold">{pendingCount}</p>
                              <p className="text-xs text-slate-500 font-medium">Chờ duyệt</p>
                           </div>
                        </div>
                        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 flex items-center gap-4">
                           <div className="flex items-center justify-center size-11 rounded-xl bg-green-500/10 text-green-500"><CheckCircle size={22} /></div>
                           <div>
                              <p className="text-2xl font-bold">{completedCount}</p>
                              <p className="text-xs text-slate-500 font-medium">Đã duyệt</p>
                           </div>
                        </div>
                        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 flex items-center gap-4">
                           <div className="flex items-center justify-center size-11 rounded-xl bg-red-500/10 text-red-500"><XCircle size={22} /></div>
                           <div>
                              <p className="text-2xl font-bold">{rejectedCount}</p>
                              <p className="text-xs text-slate-500 font-medium">Đã từ chối</p>
                           </div>
                        </div>
                     </div>

                     {/* Filters */}
                     <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                           <div className="relative flex-1">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                              <input
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                                 className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl h-11 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                 placeholder="Tìm kiếm mã đơn, học viên, khóa học..."
                              />
                           </div>
                           <div className="flex gap-2">
                              {/* Date filter */}
                              <div className="relative" ref={dateRef}>
                                 <button
                                    onClick={() => { setShowDatePicker(!showDatePicker); setShowStatusDropdown(false); }}
                                    className={`flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-50 dark:bg-dark-bg border font-medium text-sm transition-colors ${startDate || endDate ? 'border-primary text-primary' : 'border-gray-200 dark:border-dark-border hover:border-primary'}`}
                                 >
                                    <Calendar size={18} />
                                    <span>Thời gian</span>
                                    {(startDate || endDate) && <span className="size-2 rounded-full bg-primary"></span>}
                                 </button>
                                 {showDatePicker && (
                                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl p-4 z-30 w-72">
                                       <p className="text-sm font-medium mb-3">Lọc theo thời gian</p>
                                       <div className="space-y-3">
                                          <div>
                                             <label className="text-xs text-slate-500 mb-1 block">Từ ngày</label>
                                             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                          </div>
                                          <div>
                                             <label className="text-xs text-slate-500 mb-1 block">Đến ngày</label>
                                             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                          </div>
                                          <div className="flex gap-2">
                                             <button onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(0); }} className="flex-1 h-8 rounded-lg bg-gray-100 dark:bg-dark-border text-sm font-medium hover:bg-gray-200 transition-colors">Xóa lọc</button>
                                             <button onClick={() => { setShowDatePicker(false); setCurrentPage(0); }} className="flex-1 h-8 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors">Áp dụng</button>
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </div>
                              {/* Status filter */}
                              <div className="relative" ref={statusRef}>
                                 <button
                                    onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowDatePicker(false); }}
                                    className={`flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-50 dark:bg-dark-bg border font-medium text-sm transition-colors ${statusFilter ? 'border-primary text-primary' : 'border-gray-200 dark:border-dark-border hover:border-primary'}`}
                                 >
                                    <Filter size={18} />
                                    <span>Trạng thái</span>
                                    <ChevronDown size={14} />
                                 </button>
                                 {showStatusDropdown && (
                                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl p-2 z-30 w-44">
                                       {[
                                          { label: 'Tất cả', value: null },
                                          { label: 'Chờ duyệt', value: 'pending' },
                                          { label: 'Đã duyệt', value: 'completed' },
                                          { label: 'Đã từ chối', value: 'rejected' },
                                       ].map(opt => (
                                          <button
                                             key={opt.label}
                                             onClick={() => { setStatusFilter(opt.value); setShowStatusDropdown(false); setCurrentPage(0); }}
                                             className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === opt.value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50 dark:hover:bg-dark-border'}`}
                                          >
                                             {opt.label}
                                          </button>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Table */}
                     <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm relative">
                        {/* Loading overlay */}
                        {loading && (
                           <div className="absolute inset-0 bg-white/60 dark:bg-dark-card/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
                              <div className="flex items-center gap-3 bg-white dark:bg-dark-card px-5 py-3 rounded-xl shadow-lg border border-gray-200 dark:border-dark-border">
                                 <Loader2 className="size-5 animate-spin text-primary" />
                                 <span className="text-sm font-medium">Đang tải...</span>
                              </div>
                           </div>
                        )}

                        <div className="flex-1 overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-gray-50 dark:bg-dark-bg sticky top-0 z-10">
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
                                 {!loading && paginatedData.length === 0 && (
                                    <tr>
                                       <td colSpan={6} className="p-12">
                                          <div className="flex flex-col items-center justify-center text-center">
                                             <div className="size-16 rounded-2xl bg-gray-100 dark:bg-dark-border flex items-center justify-center mb-4">
                                                <Users size={32} className="text-slate-400" />
                                             </div>
                                             <p className="text-lg font-bold mb-1">Không có đơn đăng ký nào</p>
                                             <p className="text-sm text-slate-500">
                                                {debouncedSearch || statusFilter || startDate
                                                   ? 'Không tìm thấy kết quả phù hợp. Thử thay đổi bộ lọc.'
                                                   : 'Chưa có đơn đăng ký khóa học nào trong hệ thống.'}
                                             </p>
                                          </div>
                                       </td>
                                    </tr>
                                 )}
                                 {paginatedData.map((reg) => (
                                    <tr key={reg.id} className="group hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                                       <td className="p-4">
                                          <span className="font-mono text-xs text-slate-500 bg-gray-100 dark:bg-dark-border px-2 py-1 rounded-md">
                                             #{reg.id.slice(0, 8)}
                                          </span>
                                       </td>
                                       <td className="p-4">
                                          <div className="flex items-center gap-3">
                                             <div className="size-9 rounded-full bg-cover bg-center border border-gray-200 dark:border-dark-border flex-shrink-0" style={{ backgroundImage: `url(${reg.studentAvatar})` }}></div>
                                             <div>
                                                <p className="font-bold">{reg.studentName}</p>
                                                <p className="text-xs text-slate-500">{reg.studentEmail}</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="p-4">
                                          <p className="font-medium line-clamp-1">{reg.courseName}</p>
                                          <p className="text-xs text-primary font-bold mt-0.5">
                                             {reg.coursePrice > 0 ? reg.coursePrice.toLocaleString('vi-VN') + 'đ' : 'Miễn phí'}
                                          </p>
                                       </td>
                                       <td className="p-4 text-slate-500">{reg.createdAt}</td>
                                       <td className="p-4 text-center">{statusBadge(reg.status)}</td>
                                       <td className="p-4">
                                          <div className="flex items-center justify-end gap-1">
                                             <button
                                                onClick={() => { setTargetReg(reg); setActiveModal('detail'); }}
                                                title="Xem chi tiết"
                                                className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                             >
                                                <Eye size={18} />
                                             </button>
                                             {reg.status === 'pending' && (
                                                <>
                                                   <button
                                                      onClick={() => { setTargetReg(reg); setActiveModal('approve'); }}
                                                      title="Duyệt"
                                                      className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                   >
                                                      <CheckCircle size={18} />
                                                   </button>
                                                   <button
                                                      onClick={() => { setTargetReg(reg); setActiveModal('reject'); }}
                                                      title="Từ chối"
                                                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                   >
                                                      <XCircle size={18} />
                                                   </button>
                                                </>
                                             )}
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>

                        {/* Pagination */}
                        <div className="border-t border-gray-200 dark:border-dark-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-dark-bg">
                           <div className="text-sm text-slate-500">
                              {totalElements > 0
                                 ? <>Hiển thị <span className="font-medium text-slate-900 dark:text-white">{startItem}-{endItem}</span> trong số <span className="font-medium text-slate-900 dark:text-white">{totalElements}</span> đăng ký</>
                                 : 'Không có dữ liệu'}
                           </div>
                           {totalPages > 1 && (
                              <div className="flex items-center gap-2">
                                 <div className="flex">
                                    <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="flex items-center justify-center h-9 px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-500 hover:text-primary hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                       <ChevronLeft size={18} />
                                    </button>
                                    {getPageNumbers().map((p, i) =>
                                       p === '...' ? (
                                          <span key={`dots-${i}`} className="flex items-center justify-center h-9 w-9 border border-r-0 border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-500 text-sm"><MoreHorizontal size={14} /></span>
                                       ) : (
                                          <button key={p} onClick={() => setCurrentPage(p as number)} className={`flex items-center justify-center h-9 w-9 border border-r-0 border-gray-300 dark:border-dark-border text-sm font-medium transition-colors ${currentPage === p ? 'bg-primary text-white' : 'bg-white dark:bg-dark-card text-slate-700 dark:text-slate-400 hover:bg-gray-50'}`}>
                                             {(p as number) + 1}
                                          </button>
                                       )
                                    )}
                                    <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="flex items-center justify-center h-9 px-3 rounded-r-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-500 hover:text-primary hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                       <ChevronRight size={18} />
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </main>
            </div>
         </div>

         {/* ── MODAL: Detail ─────────────────────────────────────────────── */}
         {activeModal === 'detail' && targetReg && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
               <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-border">
                     <h3 className="text-lg font-bold">Chi tiết đăng ký</h3>
                     <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-cover bg-center border-2 border-gray-200 dark:border-dark-border" style={{ backgroundImage: `url(${targetReg.studentAvatar})` }}></div>
                        <div>
                           <p className="font-bold text-lg">{targetReg.studentName}</p>
                           <p className="text-sm text-slate-500">{targetReg.studentEmail}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                           <p className="text-xs text-slate-500 mb-1">Mã đơn</p>
                           <p className="text-sm font-mono font-bold">#{targetReg.id.slice(0, 12)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                           <p className="text-xs text-slate-500 mb-1">Ngày tạo</p>
                           <p className="text-sm font-bold">{targetReg.createdAt}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                           <p className="text-xs text-slate-500 mb-1">Khóa học</p>
                           <p className="text-sm font-bold">{targetReg.courseName}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                           <p className="text-xs text-slate-500 mb-1">Học phí</p>
                           <p className="text-sm font-bold text-primary">{targetReg.coursePrice > 0 ? targetReg.coursePrice.toLocaleString('vi-VN') + 'đ' : 'Miễn phí'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Trạng thái:</span>
                        {statusBadge(targetReg.status)}
                     </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                     {targetReg.status === 'pending' && (
                        <>
                           <button onClick={() => { setActiveModal('reject'); }} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all">
                              <XCircle size={16} /> Từ chối
                           </button>
                           <button onClick={() => { setActiveModal('approve'); }} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-lg shadow-green-500/30 transition-all">
                              <CheckCircle size={16} /> Duyệt
                           </button>
                        </>
                     )}
                     {targetReg.status !== 'pending' && (
                        <button onClick={() => setActiveModal(null)} className="h-10 px-5 rounded-xl bg-gray-100 dark:bg-dark-border hover:bg-gray-200 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all">Đóng</button>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* ── MODAL: Approve Confirmation ────────────────────────────────── */}
         {activeModal === 'approve' && targetReg && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !actionLoading && setActiveModal(null)}>
               <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="flex items-center justify-center size-12 rounded-xl bg-green-500/10 text-green-500"><CheckCircle size={24} /></div>
                     <div>
                        <h3 className="text-lg font-bold">Duyệt đăng ký</h3>
                        <p className="text-sm text-slate-500">Xác nhận duyệt đơn đăng ký này.</p>
                     </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                     Duyệt đăng ký khóa học <strong>{targetReg.courseName}</strong> cho học viên <strong>{targetReg.studentName}</strong>?
                  </p>
                  <div className="flex items-center justify-end gap-3">
                     <button onClick={() => setActiveModal(null)} disabled={actionLoading} className="h-10 px-5 rounded-xl bg-gray-100 dark:bg-dark-border hover:bg-gray-200 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all disabled:opacity-50">Hủy</button>
                     <button onClick={handleApprove} disabled={actionLoading} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-lg shadow-green-500/30 transition-all disabled:opacity-50">
                        {actionLoading && <Loader2 size={16} className="animate-spin" />}
                        Xác nhận duyệt
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ── MODAL: Reject Confirmation ─────────────────────────────────── */}
         {activeModal === 'reject' && targetReg && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !actionLoading && setActiveModal(null)}>
               <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="flex items-center justify-center size-12 rounded-xl bg-red-500/10 text-red-500"><XCircle size={24} /></div>
                     <div>
                        <h3 className="text-lg font-bold">Từ chối đăng ký</h3>
                        <p className="text-sm text-slate-500">Hành động này sẽ từ chối đơn đăng ký.</p>
                     </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                     Từ chối đăng ký khóa học <strong>{targetReg.courseName}</strong> của học viên <strong>{targetReg.studentName}</strong>?
                  </p>
                  <div className="flex items-center justify-end gap-3">
                     <button onClick={() => setActiveModal(null)} disabled={actionLoading} className="h-10 px-5 rounded-xl bg-gray-100 dark:bg-dark-border hover:bg-gray-200 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all disabled:opacity-50">Hủy</button>
                     <button onClick={handleReject} disabled={actionLoading} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-500/30 transition-all disabled:opacity-50">
                        {actionLoading && <Loader2 size={16} className="animate-spin" />}
                        Xác nhận từ chối
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ── Toast ─────────────────────────────────────────────────────── */}
         {toast && (
            <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
               {toast.type === 'success' ? '✓' : '✕'} {toast.message}
            </div>
         )}
      </>
   );
};

export default AdminRegistrations;

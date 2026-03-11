import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
   Search,
   Bell,
   Plus,
   Filter,
   Calendar,
   Eye,
   Edit,
   Lock,
   Unlock,
   Trash2,
   ChevronLeft,
   ChevronRight,
   MoreHorizontal,
   Loader2,
   AlertTriangle,
   X,
   Download,
   CheckSquare,
   Users,
   ChevronDown
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../AuthContext';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

interface StudentListProps {
   onNavigate: (page: string) => void;
}

interface StudentData {
   id: string;
   name: string;
   email: string;
   phone: string;
   avatar: string;
   role: string;
   status: string;
   joinDate: string;
   joinDateRaw: Date | null;
   coursesEnrolled: number;
}

type ToastType = { message: string; type: 'success' | 'error' } | null;
type ModalType = 'add' | 'delete' | 'lock' | 'bulk-delete' | 'bulk-lock' | null;

const StudentList: React.FC<StudentListProps> = ({ onNavigate }) => {
   const { user } = useAuth();

   // Raw data from Firestore
   const [allStudents, setAllStudents] = useState<StudentData[]>([]);
   const [loading, setLoading] = useState(true);

   // Filter state
   const [searchTerm, setSearchTerm] = useState('');
   const [debouncedSearch, setDebouncedSearch] = useState('');
   const [statusFilter, setStatusFilter] = useState<string | null>(null);
   const [currentPage, setCurrentPage] = useState(0);
   const pageSize = 10;
   const [showDatePicker, setShowDatePicker] = useState(false);
   const [startDate, setStartDate] = useState('');
   const [endDate, setEndDate] = useState('');
   const [showOtherFilters, setShowOtherFilters] = useState(false);
   const [sortBy, setSortBy] = useState<string>('date-desc');

   // Selection state
   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

   // Modal state
   const [activeModal, setActiveModal] = useState<ModalType>(null);
   const [targetStudent, setTargetStudent] = useState<StudentData | null>(null);

   // Add student form
   const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', password: '' });
   const [addLoading, setAddLoading] = useState(false);

   // Action loading
   const [actionLoading, setActionLoading] = useState(false);

   // Toast
   const [toast, setToast] = useState<ToastType>(null);

   // Refs
   const dateRef = useRef<HTMLDivElement>(null);
   const filterRef = useRef<HTMLDivElement>(null);
   const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

   // ─── Toast helper ────────────────────────────────────────────────────
   const showToast = useCallback((message: string, type: 'success' | 'error') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
   }, []);

   // ─── Fetch all students from Firestore ────────────────────────────────
   const fetchStudents = useCallback(async () => {
      try {
         setLoading(true);
         const q = query(collection(db, 'users'), where('role', '==', 'student'));
         const querySnapshot = await getDocs(q);
         const fetched: StudentData[] = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const createdAt = data.createdAt?.toDate?.() || (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null);
            return {
               id: docSnap.id,
               name: data.name || 'Unknown',
               email: data.email || '',
               phone: data.phone || '',
               avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'U')}&background=6366f1&color=fff`,
               role: data.role || 'student',
               status: data.status || 'active',
               joinDate: createdAt ? createdAt.toLocaleDateString('vi-VN') : 'Mới đây',
               joinDateRaw: createdAt,
               coursesEnrolled: data.coursesEnrolled || 0,
            };
         });
         setAllStudents(fetched);
      } catch (error: any) {
         console.error('Fetch students error:', error);
         showToast('Không thể tải danh sách học viên: ' + (error.message || ''), 'error');
         setAllStudents([]);
      } finally {
         setLoading(false);
      }
   }, [showToast]);

   useEffect(() => { fetchStudents(); }, []);

   // ─── Debounced search ─────────────────────────────────────────────────
   useEffect(() => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
         setDebouncedSearch(searchTerm);
         setCurrentPage(0);
      }, 500);
      return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
   }, [searchTerm]);

   // ─── Client-side filtering + sorting + pagination ─────────────────────
   const filteredStudents = useMemo(() => {
      let result = [...allStudents];

      // Search filter
      if (debouncedSearch) {
         const term = debouncedSearch.toLowerCase();
         result = result.filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term) ||
            s.phone.toLowerCase().includes(term)
         );
      }

      // Status filter
      if (statusFilter) {
         result = result.filter(s => s.status === statusFilter.toLowerCase());
      }

      // Date range filter
      if (startDate) {
         const start = new Date(startDate);
         result = result.filter(s => s.joinDateRaw && s.joinDateRaw >= start);
      }
      if (endDate) {
         const end = new Date(endDate);
         end.setHours(23, 59, 59, 999);
         result = result.filter(s => s.joinDateRaw && s.joinDateRaw <= end);
      }

      // Sort
      switch (sortBy) {
         case 'name-asc':
            result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
            break;
         case 'date-desc':
            result.sort((a, b) => (b.joinDateRaw?.getTime() || 0) - (a.joinDateRaw?.getTime() || 0));
            break;
         case 'courses-desc':
            result.sort((a, b) => b.coursesEnrolled - a.coursesEnrolled);
            break;
      }

      return result;
   }, [allStudents, debouncedSearch, statusFilter, startDate, endDate, sortBy]);

   const totalElements = filteredStudents.length;
   const totalPages = Math.ceil(totalElements / pageSize);
   const paginatedStudents = filteredStudents.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

   // ─── Click outside to close dropdowns ────────────────────────────────
   useEffect(() => {
      const handleClick = (e: MouseEvent) => {
         if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
         if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowOtherFilters(false);
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
   }, []);

   // ─── Selection helpers ───────────────────────────────────────────────
   const toggleSelect = (id: string) => {
      setSelectedIds(prev => {
         const next = new Set(prev);
         next.has(id) ? next.delete(id) : next.add(id);
         return next;
      });
   };

   const toggleSelectAll = () => {
      if (selectedIds.size === paginatedStudents.length) {
         setSelectedIds(new Set());
      } else {
         setSelectedIds(new Set(paginatedStudents.map(s => s.id)));
      }
   };

   // ─── Actions ─────────────────────────────────────────────────────────
   const handleAddStudent = async () => {
      if (!addForm.name || !addForm.email) {
         showToast('Vui lòng nhập tên và email', 'error');
         return;
      }
      const pwd = addForm.password || '123456';
      if (pwd.length < 6) {
         showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
         return;
      }
      try {
         setAddLoading(true);

         // Create a secondary Firebase app to create the auth account
         // without logging out the current admin
         const secondaryApp = initializeApp(
            {
               apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
               authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
               projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            },
            'secondary-admin-create-' + Date.now()
         );
         const secondaryAuth = getAuth(secondaryApp);

         // Create Firebase Auth account
         const userCredential = await createUserWithEmailAndPassword(secondaryAuth, addForm.email, pwd);
         const uid = userCredential.user.uid;

         // Save to Firestore with same UID (matches normal registration format)
         await setDoc(doc(db, 'users', uid), {
            name: addForm.name,
            email: addForm.email,
            phone: addForm.phone || '',
            role: 'student',
            status: 'active',
            createdAt: serverTimestamp(),
            coursesEnrolled: 0,
            avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(addForm.name),
         });

         // Clean up secondary app
         await deleteApp(secondaryApp);

         showToast('Thêm học viên thành công!', 'success');
         setActiveModal(null);
         setAddForm({ name: '', email: '', phone: '', password: '' });
         fetchStudents();
      } catch (error: any) {
         console.error('Add student error:', error);
         if (error.code === 'auth/email-already-in-use') {
            showToast('Email đã được sử dụng!', 'error');
         } else if (error.code === 'auth/weak-password') {
            showToast('Mật khẩu quá yếu, cần ít nhất 6 ký tự', 'error');
         } else {
            showToast('Thêm học viên thất bại: ' + (error.message || ''), 'error');
         }
      } finally {
         setAddLoading(false);
      }
   };

   const handleDelete = async () => {
      if (!targetStudent) return;
      try {
         setActionLoading(true);
         await deleteDoc(doc(db, 'users', targetStudent.id));
         showToast(`Đã xóa học viên ${targetStudent.name}`, 'success');
         setActiveModal(null);
         setTargetStudent(null);
         fetchStudents();
      } catch (error: any) {
         showToast('Xóa thất bại: ' + (error.message || ''), 'error');
      } finally {
         setActionLoading(false);
      }
   };

   const handleLockToggle = async () => {
      if (!targetStudent) return;
      try {
         setActionLoading(true);
         const newStatus = targetStudent.status === 'locked' ? 'active' : 'locked';
         await updateDoc(doc(db, 'users', targetStudent.id), { status: newStatus });
         showToast(newStatus === 'locked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', 'success');
         setActiveModal(null);
         setTargetStudent(null);
         fetchStudents();
      } catch (error: any) {
         showToast('Thao tác thất bại: ' + (error.message || ''), 'error');
      } finally {
         setActionLoading(false);
      }
   };

   const handleBulkDelete = async () => {
      try {
         setActionLoading(true);
         const promises = Array.from(selectedIds).map(id => deleteDoc(doc(db, 'users', id)));
         await Promise.all(promises);
         showToast(`Đã xóa ${selectedIds.size} học viên`, 'success');
         setActiveModal(null);
         setSelectedIds(new Set());
         fetchStudents();
      } catch (error: any) {
         showToast('Xóa hàng loạt thất bại: ' + (error.message || ''), 'error');
      } finally {
         setActionLoading(false);
      }
   };

   const handleBulkLock = async () => {
      try {
         setActionLoading(true);
         const promises = Array.from(selectedIds).map(id => updateDoc(doc(db, 'users', id), { status: 'locked' }));
         await Promise.all(promises);
         showToast(`Đã khóa ${selectedIds.size} tài khoản`, 'success');
         setActiveModal(null);
         setSelectedIds(new Set());
         fetchStudents();
      } catch (error: any) {
         showToast('Khóa hàng loạt thất bại: ' + (error.message || ''), 'error');
      } finally {
         setActionLoading(false);
      }
   };

   const handleExportCSV = () => {
      const selected = allStudents.filter(s => selectedIds.has(s.id));
      const header = 'ID,Tên,Email,Điện thoại,Trạng thái,Ngày đăng ký,Khóa học\n';
      const rows = selected.map(s => `${s.id},"${s.name}","${s.email}","${s.phone}",${s.status},${s.joinDate},${s.coursesEnrolled}`).join('\n');
      const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'students.csv'; a.click();
      URL.revokeObjectURL(url);
      showToast(`Đã xuất ${selected.length} học viên`, 'success');
   };

   // ─── Pagination helpers ──────────────────────────────────────────────
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

   // ─── Status badge ────────────────────────────────────────────────────
   const statusBadge = (status: string) => {
      const styles = status === 'active'
         ? 'bg-green-500/10 text-green-600 border-green-500/10'
         : status === 'locked'
            ? 'bg-red-500/10 text-red-600 border-red-500/10'
            : 'bg-slate-500/10 text-slate-600 border-slate-500/10';
      const label = status === 'active' ? 'Hoạt động' : status === 'locked' ? 'Đã khóa' : 'Chưa xác thực';
      return (
         <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles}`}>
            <div className="size-1.5 rounded-full bg-current"></div>
            {label}
         </div>
      );
   };

   return (
      <>
         <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
            <Sidebar role="admin" activePage="admin-students" onNavigate={onNavigate} />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
               {/* Header */}
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
                           <p className="text-sm font-bold leading-none">{user?.name || 'Admin'}</p>
                           <p className="text-xs text-slate-500 mt-1">Quản trị viên</p>
                        </div>
                        <div className="size-10 rounded-full bg-cover bg-center border-2 border-gray-200 dark:border-dark-border" style={{ backgroundImage: 'url(https://picsum.photos/seed/admin/100/100)' }}></div>
                     </div>
                  </div>
               </header>

               <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
                  <div className="w-full max-w-[1200px] flex flex-col gap-6">
                     {/* Title + Add button */}
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                           <h1 className="text-3xl font-bold tracking-tight">Quản Lý Học Viên</h1>
                           <p className="text-slate-500 dark:text-slate-400 mt-1">Danh sách và quản lý thông tin học viên trong hệ thống.</p>
                        </div>
                        <button
                           onClick={() => { setActiveModal('add'); setAddForm({ name: '', email: '', phone: '', password: '' }); }}
                           className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary hover:bg-blue-600 transition-all text-white text-sm font-bold shadow-lg shadow-primary/30"
                        >
                           <Plus size={20} />
                           <span>Thêm học viên mới</span>
                        </button>
                     </div>

                     {/* Bulk actions bar */}
                     {selectedIds.size > 0 && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between gap-4">
                           <div className="flex items-center gap-2">
                              <CheckSquare size={18} className="text-primary" />
                              <span className="text-sm font-medium">Đã chọn <strong>{selectedIds.size}</strong> học viên</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <button onClick={handleExportCSV} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-sm font-medium hover:border-primary transition-colors">
                                 <Download size={14} /> Xuất CSV
                              </button>
                              <button onClick={() => setActiveModal('bulk-lock')} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 text-sm font-medium hover:bg-amber-500/20 transition-colors">
                                 <Lock size={14} /> Khóa
                              </button>
                              <button onClick={() => setActiveModal('bulk-delete')} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-colors">
                                 <Trash2 size={14} /> Xóa
                              </button>
                              <button onClick={() => setSelectedIds(new Set())} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                                 <X size={16} />
                              </button>
                           </div>
                        </div>
                     )}

                     {/* Filters */}
                     <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                           <div className="relative flex-1">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                              <input
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                                 className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl h-11 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                 placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                              />
                           </div>
                           <div className="flex gap-2">
                              {/* Date filter */}
                              <div className="relative" ref={dateRef}>
                                 <button
                                    onClick={() => { setShowDatePicker(!showDatePicker); setShowOtherFilters(false); }}
                                    className={`flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-50 dark:bg-dark-bg border font-medium text-sm transition-colors ${startDate || endDate ? 'border-primary text-primary' : 'border-gray-200 dark:border-dark-border hover:border-primary'}`}
                                 >
                                    <Calendar size={18} />
                                    <span>Ngày đăng ký</span>
                                    {(startDate || endDate) && <span className="size-2 rounded-full bg-primary"></span>}
                                 </button>
                                 {showDatePicker && (
                                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl p-4 z-30 w-72">
                                       <p className="text-sm font-medium mb-3">Lọc theo ngày đăng ký</p>
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
                              {/* Other filters */}
                              <div className="relative" ref={filterRef}>
                                 <button
                                    onClick={() => { setShowOtherFilters(!showOtherFilters); setShowDatePicker(false); }}
                                    className="flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border font-medium text-sm hover:border-primary transition-colors"
                                 >
                                    <Filter size={18} />
                                    <span>Bộ lọc khác</span>
                                    <ChevronDown size={14} />
                                 </button>
                                 {showOtherFilters && (
                                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl p-3 z-30 w-52">
                                       <p className="text-xs text-slate-500 px-2 mb-2">Sắp xếp theo</p>
                                       {[
                                          { label: 'Tên A-Z', value: 'name-asc' },
                                          { label: 'Ngày mới nhất', value: 'date-desc' },
                                          { label: 'Khóa học giảm dần', value: 'courses-desc' },
                                       ].map(opt => (
                                          <button
                                             key={opt.value}
                                             onClick={() => { setSortBy(opt.value); setShowOtherFilters(false); setCurrentPage(0); }}
                                             className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === opt.value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50 dark:hover:bg-dark-border'}`}
                                          >
                                             {opt.label}
                                          </button>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                        {/* Status filter buttons */}
                        <div className="flex gap-2 flex-wrap items-center">
                           <span className="text-sm font-medium text-slate-500 mr-2">Trạng thái:</span>
                           {[
                              { label: 'Tất cả', value: null },
                              { label: 'Đang hoạt động', value: 'ACTIVE' },
                              { label: 'Đã khóa', value: 'LOCKED' },
                           ].map(btn => (
                              <button
                                 key={btn.label}
                                 onClick={() => { setStatusFilter(btn.value); setCurrentPage(0); }}
                                 className={`h-8 px-4 rounded-lg text-sm font-medium transition-colors ${statusFilter === btn.value
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'border border-gray-200 dark:border-dark-border text-slate-500 hover:text-primary hover:border-primary'
                                    }`}
                              >
                                 {btn.label}
                              </button>
                           ))}
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
                                    <th className="p-4 w-[50px] text-center">
                                       <input type="checkbox" checked={paginatedStudents.length > 0 && selectedIds.size === paginatedStudents.length} onChange={toggleSelectAll} className="rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-primary size-4 cursor-pointer" />
                                    </th>
                                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Học viên</th>
                                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Liên hệ</th>
                                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày đăng ký</th>
                                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Khóa học</th>
                                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-sm">
                                 {!loading && paginatedStudents.length === 0 && (
                                    <tr>
                                       <td colSpan={7} className="p-12">
                                          <div className="flex flex-col items-center justify-center text-center">
                                             <div className="size-16 rounded-2xl bg-gray-100 dark:bg-dark-border flex items-center justify-center mb-4">
                                                <Users size={32} className="text-slate-400" />
                                             </div>
                                             <p className="text-lg font-bold mb-1">Không có học viên nào</p>
                                             <p className="text-sm text-slate-500 mb-4">
                                                {debouncedSearch || statusFilter || startDate
                                                   ? 'Không tìm thấy kết quả phù hợp. Thử thay đổi bộ lọc.'
                                                   : 'Hãy thêm học viên đầu tiên vào hệ thống.'}
                                             </p>
                                             {!debouncedSearch && !statusFilter && (
                                                <button onClick={() => setActiveModal('add')} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-all">
                                                   <Plus size={16} /> Thêm học viên
                                                </button>
                                             )}
                                          </div>
                                       </td>
                                    </tr>
                                 )}
                                 {paginatedStudents.map((student) => (
                                    <tr key={student.id} className={`group hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors ${selectedIds.has(student.id) ? 'bg-primary/5' : ''}`}>
                                       <td className="p-4 text-center">
                                          <input type="checkbox" checked={selectedIds.has(student.id)} onChange={() => toggleSelect(student.id)} className="rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-primary size-4 cursor-pointer" />
                                       </td>
                                       <td className="p-4">
                                          <div className="flex items-center gap-3">
                                             <div className="size-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-dark-border flex-shrink-0" style={{ backgroundImage: `url(${student.avatar})` }}></div>
                                             <div>
                                                <p className="font-bold">{student.name}</p>
                                                <p className="text-xs text-slate-500">{student.id}</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="p-4">
                                          <div className="flex flex-col">
                                             <span className="truncate max-w-[200px]">{student.email}</span>
                                             <span className="text-xs text-slate-500 mt-0.5">{student.phone || 'N/A'}</span>
                                          </div>
                                       </td>
                                       <td className="p-4 text-slate-600 dark:text-slate-400">{student.joinDate}</td>
                                       <td className="p-4 text-center">
                                          <span className="inline-flex items-center justify-center size-7 rounded-full bg-gray-100 dark:bg-dark-border text-xs font-bold">{student.coursesEnrolled}</span>
                                       </td>
                                       <td className="p-4">
                                          {statusBadge(student.status)}
                                       </td>
                                       <td className="p-4">
                                          <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                             <button onClick={() => onNavigate(`student-profile-view:${student.id}`)} title="Xem chi tiết" className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Eye size={18} /></button>
                                             <button onClick={() => onNavigate(`student-profile-edit:${student.id}`)} title="Chỉnh sửa" className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"><Edit size={18} /></button>
                                             <button onClick={() => { setTargetStudent(student); setActiveModal('lock'); }} title={student.status === 'locked' ? 'Mở khóa' : 'Khóa'} className="p-1.5 text-slate-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors">
                                                {student.status === 'locked' ? <Unlock size={18} /> : <Lock size={18} />}
                                             </button>
                                             <button onClick={() => { setTargetStudent(student); setActiveModal('delete'); }} title="Xóa" className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
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
                                 ? <>Hiển thị <span className="font-medium text-slate-900 dark:text-white">{startItem}-{endItem}</span> trong số <span className="font-medium text-slate-900 dark:text-white">{totalElements}</span> học viên</>
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

         {/* ── MODAL: Add Student ────────────────────────────────────────── */}
         {activeModal === 'add' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !addLoading && setActiveModal(null)}>
               <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-border">
                     <h3 className="text-lg font-bold">Thêm học viên mới</h3>
                     <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                        <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Nhập họ và tên" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1.5">Email <span className="text-red-500">*</span></label>
                        <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="email@example.com" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1.5">Số điện thoại</label>
                        <input type="tel" value={addForm.phone || ''} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0901234567" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1.5">Mật khẩu</label>
                        <input type="password" value={addForm.password || ''} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Mặc định: 123456" />
                     </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                     <button onClick={() => setActiveModal(null)} disabled={addLoading} className="h-10 px-5 rounded-xl bg-gray-100 dark:bg-dark-border hover:bg-gray-200 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all disabled:opacity-50">Hủy</button>
                     <button onClick={handleAddStudent} disabled={addLoading} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-primary/30 transition-all disabled:opacity-50">
                        {addLoading && <Loader2 size={16} className="animate-spin" />}
                        <span>Thêm học viên</span>
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ── MODAL: Delete Confirmation ─────────────────────────────────── */}
         {activeModal === 'delete' && targetStudent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !actionLoading && setActiveModal(null)}>
               <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="flex items-center justify-center size-12 rounded-xl bg-red-500/10 text-red-500"><Trash2 size={24} /></div>
                     <div>
                        <h3 className="text-lg font-bold">Xóa học viên</h3>
                        <p className="text-sm text-slate-500">Hành động này không thể hoàn tác.</p>
                     </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                     Bạn có chắc chắn muốn xóa học viên <strong>{targetStudent.name}</strong>? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                  </p>
                  <div className="flex items-center justify-end gap-3">
                     <button onClick={() => setActiveModal(null)} disabled={actionLoading} className="h-10 px-5 rounded-xl bg-gray-100 dark:bg-dark-border hover:bg-gray-200 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all disabled:opacity-50">Hủy</button>
                     <button onClick={handleDelete} disabled={actionLoading} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-500/30 transition-all disabled:opacity-50">
                        {actionLoading && <Loader2 size={16} className="animate-spin" />}
                        Xóa học viên
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ── MODAL: Lock Confirmation ───────────────────────────────────── */}
         {activeModal === 'lock' && targetStudent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !actionLoading && setActiveModal(null)}>
               <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4">
                     <div className={`flex items-center justify-center size-12 rounded-xl ${targetStudent.status === 'locked' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        <AlertTriangle size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold">{targetStudent.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</h3>
                        <p className="text-sm text-slate-500">Hành động này có thể hoàn tác.</p>
                     </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                     Bạn có chắc chắn muốn <strong>{targetStudent.status === 'locked' ? 'mở khóa' : 'khóa'}</strong> tài khoản học viên <strong>{targetStudent.name}</strong>?
                     {targetStudent.status !== 'locked' && ' Học viên sẽ không thể đăng nhập sau khi bị khóa.'}
                  </p>
                  <div className="flex items-center justify-end gap-3">
                     <button onClick={() => setActiveModal(null)} disabled={actionLoading} className="h-10 px-5 rounded-xl bg-gray-100 dark:bg-dark-border hover:bg-gray-200 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all disabled:opacity-50">Hủy</button>
                     <button onClick={handleLockToggle} disabled={actionLoading} className={`flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 ${targetStudent.status === 'locked' ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30' : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'}`}>
                        {actionLoading && <Loader2 size={16} className="animate-spin" />}
                        {targetStudent.status === 'locked' ? 'Xác nhận mở khóa' : 'Xác nhận khóa'}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ── MODAL: Bulk Delete Confirmation ────────────────────────────── */}
         {activeModal === 'bulk-delete' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !actionLoading && setActiveModal(null)}>
               <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="flex items-center justify-center size-12 rounded-xl bg-red-500/10 text-red-500"><Trash2 size={24} /></div>
                     <div>
                        <h3 className="text-lg font-bold">Xóa hàng loạt</h3>
                        <p className="text-sm text-slate-500">Hành động này không thể hoàn tác.</p>
                     </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                     Bạn có chắc chắn muốn xóa <strong>{selectedIds.size}</strong> học viên đã chọn?
                  </p>
                  <div className="flex items-center justify-end gap-3">
                     <button onClick={() => setActiveModal(null)} disabled={actionLoading} className="h-10 px-5 rounded-xl bg-gray-100 dark:bg-dark-border hover:bg-gray-200 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all disabled:opacity-50">Hủy</button>
                     <button onClick={handleBulkDelete} disabled={actionLoading} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-500/30 transition-all disabled:opacity-50">
                        {actionLoading && <Loader2 size={16} className="animate-spin" />}
                        Xóa {selectedIds.size} học viên
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ── MODAL: Bulk Lock Confirmation ──────────────────────────────── */}
         {activeModal === 'bulk-lock' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !actionLoading && setActiveModal(null)}>
               <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="flex items-center justify-center size-12 rounded-xl bg-amber-500/10 text-amber-500"><Lock size={24} /></div>
                     <div>
                        <h3 className="text-lg font-bold">Khóa hàng loạt</h3>
                        <p className="text-sm text-slate-500">Hành động này có thể hoàn tác.</p>
                     </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                     Bạn có chắc chắn muốn khóa <strong>{selectedIds.size}</strong> tài khoản đã chọn?
                  </p>
                  <div className="flex items-center justify-end gap-3">
                     <button onClick={() => setActiveModal(null)} disabled={actionLoading} className="h-10 px-5 rounded-xl bg-gray-100 dark:bg-dark-border hover:bg-gray-200 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all disabled:opacity-50">Hủy</button>
                     <button onClick={handleBulkLock} disabled={actionLoading} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50">
                        {actionLoading && <Loader2 size={16} className="animate-spin" />}
                        Khóa {selectedIds.size} tài khoản
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ── Toast ─────────────────────────────────────────────────────── */}
         {toast && (
            <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium text-white transition-all animate-in slide-in-from-bottom-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
               {toast.type === 'success' ? '✓' : '✕'} {toast.message}
            </div>
         )}
      </>
   );
};

export default StudentList;

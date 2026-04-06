import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Eye,
  Edit,
  Lock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  BookOpen,
  CalendarDays,
  Shield,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ControlSelect from '../components/filters/ControlSelect';
import { User } from '../types';
import { adminCreateStudent, adminGetStudents, adminUpdateStudent, adminUpdateStudentStatus } from '../api';
import { showAlert } from '../components/dialogs/DialogProvider';
import { showErrorToast, showInfoToast, showSuccessToast } from '../components/feedback/ToastProvider';

interface StudentListProps {
  onNavigate: (page: string) => void;
}

const PAGE_SIZE = 10;
const getShortId = (value?: string) => (value ? value.replace(/-/g, '').slice(0, 8).toUpperCase() : 'N/A');
const getUserLabel = (student: User) => student.userCode || getShortId(student.id);

const SORT_LABELS = {
  LATEST: 'Mới đăng ký nhất',
  OLDEST: 'Đăng ký lâu nhất',
  NAME_ASC: 'Tên A-Z',
  NAME_DESC: 'Tên Z-A',
} as const;

const StudentList: React.FC<StudentListProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sortMode, setSortMode] = useState<'LATEST' | 'OLDEST' | 'NAME_ASC' | 'NAME_DESC'>('LATEST');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentFormMode, setStudentFormMode] = useState<'create' | 'edit'>('create');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({ fullName: '', email: '', password: '123456', phone: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  const emailValidator = (value: string) => /\S+@\S+\.\S+/.test(value.trim()) ? null : 'Email không hợp lệ.';
  const phoneValidator = (value: string) => {
    if (!value.trim()) return null;
    return /^[0-9+()\-\s]{0,20}$/.test(value.trim()) ? null : 'Số điện thoại không hợp lệ.';
  };

  const load = async (status?: string) => {
    try {
      const data = await adminGetStudents(status);
      setStudents(data as User[]);
      setStatusFilter(status);
      setError('');
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const keyword = search.toLowerCase();
    return students.filter((student) =>
      (student.name || student.fullName || '').toLowerCase().includes(keyword) ||
      (student.email || '').toLowerCase().includes(keyword) ||
      (student.phone || '').toLowerCase().includes(keyword),
    );
  }, [search, students]);

  const sortedStudents = useMemo(() => {
    const list = [...filteredStudents];
    switch (sortMode) {
      case 'OLDEST':
        list.sort((a, b) => new Date(a.joinDate || 0).getTime() - new Date(b.joinDate || 0).getTime());
        break;
      case 'NAME_ASC':
        list.sort((a, b) => String(a.name || a.fullName || '').localeCompare(String(b.name || b.fullName || ''), 'vi'));
        break;
      case 'NAME_DESC':
        list.sort((a, b) => String(b.name || b.fullName || '').localeCompare(String(a.name || a.fullName || ''), 'vi'));
        break;
      default:
        list.sort((a, b) => new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime());
        break;
    }
    return list;
  }, [filteredStudents, sortMode]);

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / PAGE_SIZE));
  const paginatedStudents = sortedStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, students.length]);

  const toggleLock = async (student: User) => {
    try {
      const nextStatus = student.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
      await adminUpdateStudentStatus(student.id, nextStatus);
      await load(statusFilter);
      showSuccessToast('Cập nhật thành công');
      if (selectedStudent?.id === student.id) {
        setSelectedStudent({ ...student, status: nextStatus });
      }
    } catch {
      showErrorToast();
    }
  };

  const openCreateModal = () => {
    setStudentFormMode('create');
    setEditingStudentId(null);
    setFormValues({ fullName: '', email: '', password: '123456', phone: '' });
    setFormErrors({});
    setIsStudentModalOpen(true);
  };

  const handleView = (student: User) => {
    setSelectedStudent(student);
  };

  const openEditModal = (student: User) => {
    setStudentFormMode('edit');
    setEditingStudentId(student.id);
    setFormValues({
      fullName: student.fullName || student.name || '',
      email: student.email || '',
      password: '',
      phone: student.phone || '',
    });
    setFormErrors({});
    setIsStudentModalOpen(true);
  };

  const validateStudentForm = () => {
    const nextErrors: Record<string, string> = {};
    if (formValues.fullName.trim().length < 2) nextErrors.fullName = 'Họ và tên tối thiểu 2 ký tự.';
    const emailError = emailValidator(formValues.email);
    if (emailError) nextErrors.email = emailError;
    if (studentFormMode === 'create' && formValues.password.trim().length < 6) {
      nextErrors.password = 'Mật khẩu tối thiểu 6 ký tự.';
    }
    if (studentFormMode === 'edit' && formValues.password.trim() && formValues.password.trim().length < 6) {
      nextErrors.password = 'Mật khẩu mới tối thiểu 6 ký tự.';
    }
    const phoneError = phoneValidator(formValues.phone);
    if (phoneError) nextErrors.phone = phoneError;
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const closeStudentModal = () => {
    if (formSubmitting) return;
    setIsStudentModalOpen(false);
    setFormErrors({});
  };

  const handleSubmitStudent = async () => {
    if (!validateStudentForm()) return;

    setFormSubmitting(true);
    try {
      if (studentFormMode === 'create') {
        await adminCreateStudent({
          fullName: formValues.fullName.trim(),
          email: formValues.email.trim(),
          password: formValues.password.trim(),
          phone: formValues.phone.trim() || undefined,
        });
      } else if (editingStudentId) {
        await adminUpdateStudent({
          id: editingStudentId,
          fullName: formValues.fullName.trim(),
          email: formValues.email.trim(),
          phone: formValues.phone.trim() || undefined,
          password: formValues.password.trim() || undefined,
        });
      }

      await load(statusFilter);
      showSuccessToast('Cập nhật thành công');
      setIsStudentModalOpen(false);
    } catch {
      const message = 'Đã xảy ra lỗi, vui lòng thử lại.';
      showErrorToast();
      await showAlert({ title: 'Thông báo', message, tone: 'danger' });
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="admin" activePage="admin-students" onNavigate={onNavigate} />

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/90 px-6 py-3 backdrop-blur-md dark:border-dark-border dark:bg-dark-card/90">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold leading-tight">Quản lý học viên</h2>
          </div>
          <div className="flex flex-1 items-center justify-end gap-6">
            <button onClick={() => showInfoToast('Không có thông báo mới.')} className="relative text-slate-500 transition-colors hover:text-primary">
              <Bell size={20} />
              <span className="absolute right-0 top-0 size-2 rounded-full border-2 border-white bg-red-500 dark:border-dark-bg"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-none">Admin User</p>
                <p className="mt-1 text-xs text-slate-500">Quản trị viên</p>
              </div>
              <div className="size-10 rounded-full border-2 border-gray-200 bg-cover bg-center dark:border-dark-border" style={{ backgroundImage: 'url(https://picsum.photos/seed/admin/100/100)' }}></div>
            </div>
          </div>
        </header>

        <main className="flex flex-1 justify-center overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex w-full max-w-[1200px] flex-col gap-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý học viên</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">Danh sách và thông tin học viên trong hệ thống.</p>
              </div>
              <button onClick={openCreateModal} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-blue-600">
                <Plus size={20} />
                <span>Thêm học viên mới</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-dark-border dark:bg-dark-bg"
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                  />
                </div>
                <div className="flex gap-2">
                  <ControlSelect
                    value={sortMode}
                    onChange={(value) => setSortMode(value as typeof sortMode)}
                    options={[
                      { value: 'LATEST', label: SORT_LABELS.LATEST },
                      { value: 'OLDEST', label: SORT_LABELS.OLDEST },
                      { value: 'NAME_ASC', label: SORT_LABELS.NAME_ASC },
                      { value: 'NAME_DESC', label: SORT_LABELS.NAME_DESC },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-sm font-medium text-slate-500">Trạng thái:</span>
                <button onClick={() => load()} className="h-8 rounded-lg bg-gray-100 px-4 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-gray-700">Tất cả</button>
                <button onClick={() => load('ACTIVE')} className="h-8 rounded-lg border border-gray-200 px-4 text-sm font-medium text-slate-500 transition-colors hover:border-primary hover:text-primary dark:border-dark-border">Đang hoạt động</button>
                <button onClick={() => load('LOCKED')} className="h-8 rounded-lg border border-gray-200 px-4 text-sm font-medium text-slate-500 transition-colors hover:border-primary hover:text-primary dark:border-dark-border">Đã khóa</button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-gray-50 px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-bg dark:ring-dark-border">
                  Trạng thái: {statusFilter || 'Tất cả'}
                </span>
                <span className="rounded-full bg-gray-50 px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-bg dark:ring-dark-border">
                  Sắp xếp: {SORT_LABELS[sortMode]}
                </span>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card">
              <div className="flex-1 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-dark-bg">
                    <tr>
                      <th className="w-[50px] p-4 text-center"><input type="checkbox" className="size-4 rounded border-gray-300 bg-transparent text-primary focus:ring-primary dark:border-gray-600" /></th>
                      <th className="p-4 text-xs font-medium uppercase tracking-wider text-slate-500">Học viên</th>
                      <th className="p-4 text-xs font-medium uppercase tracking-wider text-slate-500">Liên hệ</th>
                      <th className="p-4 text-xs font-medium uppercase tracking-wider text-slate-500">Ngày đăng ký</th>
                      <th className="p-4 text-center text-xs font-medium uppercase tracking-wider text-slate-500">Khóa học</th>
                      <th className="p-4 text-xs font-medium uppercase tracking-wider text-slate-500">Trạng thái</th>
                      <th className="p-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm dark:divide-dark-border">
                    {paginatedStudents.map((student) => (
                      <tr key={student.id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-dark-border/30">
                        <td className="p-4 text-center"><input type="checkbox" className="size-4 rounded border-gray-300 bg-transparent text-primary focus:ring-primary dark:border-gray-600" /></td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full border border-gray-200 bg-cover bg-center dark:border-dark-border" style={{ backgroundImage: `url(${student.avatar || student.avatarUrl || 'https://picsum.photos/seed/user/100/100'})` }}></div>
                            <div>
                              <p className="font-bold">{student.name || student.fullName}</p>
                              <p className="text-xs text-slate-500">{getUserLabel(student)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="truncate">{student.email}</span>
                            <span className="mt-0.5 text-xs text-slate-500">{student.phone}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{student.joinDate}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex size-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold dark:bg-dark-border">{student.coursesEnrolled || 0}</span>
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                            student.status === 'ACTIVE'
                              ? 'border-green-500/10 bg-green-500/10 text-green-600'
                              : student.status === 'LOCKED'
                                ? 'border-red-500/10 bg-red-500/10 text-red-600'
                                : 'border-slate-500/10 bg-slate-500/10 text-slate-600'
                          }`}>
                            <div className="size-1.5 rounded-full bg-current"></div>
                            {student.status === 'ACTIVE' ? 'Đang hoạt động' : student.status === 'LOCKED' ? 'Đã khóa' : 'Chưa xác thực'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                            <button onClick={() => handleView(student)} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary"><Eye size={18} /></button>
                            <button onClick={() => openEditModal(student)} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-amber-500/10 hover:text-amber-500"><Edit size={18} /></button>
                            <button onClick={() => toggleLock(student)} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-500"><Lock size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 p-4 sm:flex-row dark:border-dark-border dark:bg-dark-bg">
                <div className="text-sm text-slate-500">
                  Hiển thị <span className="font-medium text-slate-900 dark:text-white">{filteredStudents.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)}</span> trong số <span className="font-medium text-slate-900 dark:text-white">{filteredStudents.length}</span> học viên
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    <button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="flex h-9 items-center justify-center rounded-l-lg border border-r-0 border-gray-300 bg-white px-3 text-slate-500 transition-colors hover:bg-gray-50 hover:text-primary disabled:opacity-50 dark:border-dark-border dark:bg-dark-card"><ChevronLeft size={18} /></button>
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`flex h-9 w-9 items-center justify-center border border-r-0 border-gray-300 text-sm font-medium dark:border-dark-border ${currentPage === pageNumber ? 'bg-primary text-white' : 'bg-white text-slate-700 transition-colors hover:bg-gray-50 dark:bg-dark-card dark:text-slate-400'}`}>
                          {pageNumber}
                        </button>
                      );
                    })}
                    {totalPages > 3 && <span className="flex h-9 w-9 items-center justify-center border border-r-0 border-gray-300 bg-white text-sm text-slate-500 dark:border-dark-border dark:bg-dark-card"><MoreHorizontal size={14} /></span>}
                    <button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="flex h-9 items-center justify-center rounded-r-lg border border-gray-300 bg-white px-3 text-slate-500 transition-colors hover:bg-gray-50 hover:text-primary disabled:opacity-50 dark:border-dark-border dark:bg-dark-card"><ChevronRight size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[155] flex items-center justify-center px-4 py-6">
          <button className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setSelectedStudent(null)} aria-label="Đóng chi tiết học viên" />
          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-dark-border">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Chi tiết học viên</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Thông tin hồ sơ và trạng thái học tập của học viên.</p>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-gray-100 dark:hover:bg-dark-border">Đóng</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[220px,1fr]">
              <div className="rounded-2xl border border-gray-200 bg-slate-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                <div className="mx-auto mb-4 size-24 rounded-full border-4 border-white bg-cover bg-center shadow-md dark:border-dark-card" style={{ backgroundImage: `url(${selectedStudent.avatar || selectedStudent.avatarUrl || 'https://picsum.photos/seed/user/160/160'})` }}></div>
                <h4 className="text-center text-lg font-bold">{selectedStudent.fullName || selectedStudent.name}</h4>
                <p className="mt-1 text-center text-sm text-slate-500">{getUserLabel(selectedStudent)}</p>
                <div className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ${
                  selectedStudent.status === 'ACTIVE'
                    ? 'bg-green-500/10 text-green-600'
                    : selectedStudent.status === 'LOCKED'
                      ? 'bg-red-500/10 text-red-600'
                      : 'bg-slate-500/10 text-slate-600'
                }`}>
                  <Shield size={14} />
                  {selectedStudent.status === 'ACTIVE' ? 'Đang hoạt động' : selectedStudent.status === 'LOCKED' ? 'Đã khóa' : 'Chưa xác thực'}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-border dark:bg-dark-bg">
                  <div className="mb-2 flex items-center gap-2 text-slate-500"><Mail size={16} /> Email</div>
                  <p className="break-all font-semibold">{selectedStudent.email || 'Chưa cập nhật'}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-border dark:bg-dark-bg">
                  <div className="mb-2 flex items-center gap-2 text-slate-500"><Phone size={16} /> Số điện thoại</div>
                  <p className="font-semibold">{selectedStudent.phone || 'Chưa cập nhật'}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-border dark:bg-dark-bg">
                  <div className="mb-2 flex items-center gap-2 text-slate-500"><CalendarDays size={16} /> Ngày đăng ký</div>
                  <p className="font-semibold">{selectedStudent.joinDate || 'Chưa cập nhật'}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-border dark:bg-dark-bg">
                  <div className="mb-2 flex items-center gap-2 text-slate-500"><BookOpen size={16} /> Khóa học đã tham gia</div>
                  <p className="font-semibold">{selectedStudent.coursesEnrolled || 0} khóa học</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-border dark:bg-dark-bg sm:col-span-2">
                  <p className="mb-2 text-sm font-medium text-slate-500">Thao tác nhanh</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => { setSelectedStudent(null); openEditModal(selectedStudent); }} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
                      Chỉnh sửa học viên
                    </button>
                    <button onClick={() => toggleLock(selectedStudent)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:border-dark-border dark:text-slate-300 dark:hover:bg-dark-border">
                      {selectedStudent.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isStudentModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center px-4 py-6">
          <button className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={closeStudentModal} aria-label="Đóng form học viên" />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{studentFormMode === 'create' ? 'Thêm học viên mới' : 'Cập nhật học viên'}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {studentFormMode === 'create' ? 'Nhập đầy đủ thông tin để tạo học viên mới.' : 'Cập nhật thông tin học viên, hoặc nhập mật khẩu mới nếu cần đổi.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Họ và tên *</label>
                <input value={formValues.fullName} onChange={(event) => setFormValues((prev) => ({ ...prev, fullName: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder="Nhập họ và tên" />
                {formErrors.fullName && <p className="text-sm text-red-500">{formErrors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email *</label>
                <input type="email" value={formValues.email} onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder="student@example.com" />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu {studentFormMode === 'create' ? '*' : '(để trống nếu giữ nguyên)'}</label>
                <input type="password" value={formValues.password} onChange={(event) => setFormValues((prev) => ({ ...prev, password: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder={studentFormMode === 'create' ? 'Tối thiểu 6 ký tự' : 'Nhập mật khẩu mới nếu muốn đổi'} />
                {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Số điện thoại</label>
                <input value={formValues.phone} onChange={(event) => setFormValues((prev) => ({ ...prev, phone: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder="Nhập số điện thoại nếu có" />
                {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-slate-50/80 px-6 py-4 dark:border-dark-border dark:bg-dark-bg/40">
              <button onClick={closeStudentModal} disabled={formSubmitting} className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-card dark:text-slate-300 dark:hover:bg-dark-border">
                Hủy
              </button>
              <button onClick={handleSubmitStudent} disabled={formSubmitting} className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
                {formSubmitting ? 'Đang lưu...' : studentFormMode === 'create' ? 'Thêm học viên' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;

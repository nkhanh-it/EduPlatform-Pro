import React, { useEffect, useState } from 'react';
import { Search, Bell, Plus, Filter, MoreVertical, Edit, Trash2, Star, BookOpen, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Course } from '../types';
import { adminCreateCourse, adminDeleteCourse, adminGetCourses, adminUpdateCourse } from '../api';
import { showAlert, showConfirm, showPrompt } from '../components/dialogs/DialogProvider';
import { showErrorToast, showInfoToast, showSuccessToast } from '../components/feedback/ToastProvider';

interface AdminCoursesProps {
  onNavigate: (page: string) => void;
}

const AdminCourses: React.FC<AdminCoursesProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'HIDDEN'>('ALL');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseFormMode, setCourseFormMode] = useState<'create' | 'edit'>('create');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseFormValues, setCourseFormValues] = useState({
    title: '',
    instructorName: '',
    category: '',
    description: '',
    thumbnailUrl: '',
    price: '500000',
    originalPrice: '1000000',
    totalLessons: '12',
    published: true,
  });
  const [courseFormErrors, setCourseFormErrors] = useState<Record<string, string>>({});
  const [courseFormSubmitting, setCourseFormSubmitting] = useState(false);

  const moneyValidator = (value: string) => {
    const amount = Number(value);
    if (Number.isNaN(amount) || amount < 0) return 'Giá trị phải là số không âm.';
    return null;
  };

  const lessonValidator = (value: string) => {
    const amount = Number(value);
    if (!Number.isInteger(amount) || amount < 0) return 'Số bài học phải là số nguyên không âm.';
    return null;
  };

  const thumbnailValidator = (value: string) => {
    if (!value.trim()) return null;
    try {
      new URL(value.trim());
      return null;
    } catch {
      return 'Đường dẫn ảnh không hợp lệ.';
    }
  };

  const load = async (query: string, category: string, status: 'ALL' | 'PUBLISHED' | 'HIDDEN') => {
    try {
      const published = status === 'ALL' ? undefined : status === 'PUBLISHED';
      const data = await adminGetCourses(category, query, published);
      setCourses(data as Course[]);
      setError('');
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    }
  };

  useEffect(() => {
    load(search, categoryFilter, statusFilter);
  }, [search, categoryFilter, statusFilter]);

  const handleDelete = async (id: string) => {
    const ok = await showConfirm({
      title: 'Xóa khóa học',
      message: 'Bạn có chắc chắn muốn xóa khóa học này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await adminDeleteCourse(id);
      if (selectedCourse?.id === id) setSelectedCourse(null);
      await load(search, categoryFilter, statusFilter);
      showSuccessToast('Cập nhật thành công');
    } catch {
      showErrorToast();
    }
  };

  const openCreateModal = () => {
    setCourseFormMode('create');
    setEditingCourseId(null);
    setCourseFormValues({
      title: '',
      instructorName: '',
      category: 'Web Dev',
      description: '',
      thumbnailUrl: 'https://picsum.photos/seed/new/800/450',
      price: '500000',
      originalPrice: '1000000',
      totalLessons: '12',
      published: true,
    });
    setCourseFormErrors({});
    setIsCourseModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setCourseFormMode('edit');
    setEditingCourseId(course.id);
    setCourseFormValues({
      title: course.title || '',
      instructorName: course.instructor || '',
      category: course.category || '',
      description: '',
      thumbnailUrl: course.thumbnail || '',
      price: String(course.price ?? 0),
      originalPrice: String(course.originalPrice ?? course.price ?? 0),
      totalLessons: String(course.totalLessons ?? 0),
      published: Boolean(course.published),
    });
    setCourseFormErrors({});
    setIsCourseModalOpen(true);
    setSelectedCourse(null);
  };

  const handleTogglePublished = async (course: Course) => {
    try {
      await adminUpdateCourse(course.id, { published: !course.published });
      await load(search, categoryFilter, statusFilter);
      setSelectedCourse((current) => (current?.id === course.id ? { ...current, published: !current.published } : current));
      showSuccessToast('Cập nhật thành công');
    } catch {
      showErrorToast();
    }
  };

  const validateCourseForm = () => {
    const nextErrors: Record<string, string> = {};
    if (courseFormValues.title.trim().length < 2) nextErrors.title = 'Tên khóa học tối thiểu 2 ký tự.';
    if (courseFormValues.instructorName.trim().length < 2) nextErrors.instructorName = 'Tên giảng viên tối thiểu 2 ký tự.';
    if (courseFormValues.category.trim().length < 2) nextErrors.category = 'Danh mục tối thiểu 2 ký tự.';
    const priceError = moneyValidator(courseFormValues.price);
    if (priceError) nextErrors.price = priceError;
    const originalPriceError = moneyValidator(courseFormValues.originalPrice);
    if (originalPriceError) nextErrors.originalPrice = originalPriceError;
    const totalLessonsError = lessonValidator(courseFormValues.totalLessons);
    if (totalLessonsError) nextErrors.totalLessons = totalLessonsError;
    const thumbnailError = thumbnailValidator(courseFormValues.thumbnailUrl);
    if (thumbnailError) nextErrors.thumbnailUrl = thumbnailError;
    if (!nextErrors.price && !nextErrors.originalPrice) {
      const price = Number(courseFormValues.price);
      const originalPrice = Number(courseFormValues.originalPrice);
      if (originalPrice < price) nextErrors.originalPrice = 'Giá gốc phải lớn hơn hoặc bằng giá bán.';
    }
    setCourseFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const closeCourseModal = () => {
    if (courseFormSubmitting) return;
    setIsCourseModalOpen(false);
    setCourseFormErrors({});
  };

  const handleSubmitCourse = async () => {
    if (!validateCourseForm()) return;
    setCourseFormSubmitting(true);
    try {
      const payload = {
        title: courseFormValues.title.trim(),
        instructorName: courseFormValues.instructorName.trim(),
        category: courseFormValues.category.trim(),
        description: courseFormValues.description.trim() || undefined,
        thumbnailUrl: courseFormValues.thumbnailUrl.trim() || undefined,
        price: Number(courseFormValues.price),
        originalPrice: Number(courseFormValues.originalPrice),
        totalLessons: Number(courseFormValues.totalLessons),
      };
      if (courseFormMode === 'create') {
        await adminCreateCourse(payload);
      } else if (editingCourseId) {
        await adminUpdateCourse(editingCourseId, { ...payload, published: courseFormValues.published });
      }
      await load(search, categoryFilter, statusFilter);
      showSuccessToast('Cập nhật thành công');
      setIsCourseModalOpen(false);
    } catch (err: any) {
      const message = err?.message || 'Đã xảy ra lỗi, vui lòng thử lại.';
      showErrorToast();
      await showAlert({ title: 'Thông báo', message, tone: 'danger' });
    } finally {
      setCourseFormSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="admin" activePage="admin-courses" onNavigate={onNavigate} />
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/90 px-6 py-3 backdrop-blur-md dark:border-dark-border dark:bg-dark-card/90">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold leading-tight">Quản lý khóa học</h2>
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
                <h1 className="text-3xl font-bold tracking-tight">Danh sách khóa học</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">Quản lý nội dung, giá và trạng thái các khóa học.</p>
              </div>
              <button onClick={openCreateModal} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-blue-600">
                <Plus size={20} />
                <span>Tạo khóa học mới</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-dark-border dark:bg-dark-bg" placeholder="Tìm kiếm tên khóa học, giảng viên..." />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const value = await showPrompt({ title: 'Lọc theo danh mục', message: 'Nhập danh mục muốn lọc.', inputLabel: 'Danh mục', defaultValue: categoryFilter });
                      if (value) setCategoryFilter(value);
                    }}
                    className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium transition-colors hover:border-primary dark:border-dark-border dark:bg-dark-bg"
                  >
                    <Filter size={18} />
                    <span>Danh mục</span>
                  </button>
                  <button
                    onClick={() => {
                      const next = statusFilter === 'ALL' ? 'PUBLISHED' : statusFilter === 'PUBLISHED' ? 'HIDDEN' : 'ALL';
                      setStatusFilter(next);
                    }}
                    className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium transition-colors hover:border-primary dark:border-dark-border dark:bg-dark-bg"
                  >
                    <Filter size={18} />
                    <span>{statusFilter === 'ALL' ? 'Tất cả' : statusFilter === 'PUBLISHED' ? 'Công khai' : 'Ẩn'}</span>
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-card">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-dark-border dark:bg-dark-bg">
                    <tr>
                      <th className="p-4 text-xs font-medium uppercase tracking-wider text-slate-500">Thông tin khóa học</th>
                      <th className="p-4 text-xs font-medium uppercase tracking-wider text-slate-500">Giảng viên</th>
                      <th className="p-4 text-xs font-medium uppercase tracking-wider text-slate-500">Thống kê</th>
                      <th className="p-4 text-xs font-medium uppercase tracking-wider text-slate-500">Giá bán</th>
                      <th className="p-4 text-center text-xs font-medium uppercase tracking-wider text-slate-500">Trạng thái</th>
                      <th className="p-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm dark:divide-dark-border">
                    {courses.map((course) => (
                      <tr key={course.id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-dark-border/30">
                        <td className="max-w-[300px] p-4">
                          <div className="flex gap-3">
                            <div className="h-10 w-16 shrink-0 rounded-lg border border-gray-200 bg-cover bg-center dark:border-dark-border" style={{ backgroundImage: `url(${course.thumbnail})` }}></div>
                            <div className="min-w-0">
                              <p className="line-clamp-1 font-bold transition-colors group-hover:text-primary">{course.title}</p>
                              <p className="text-xs text-slate-500">{course.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{course.instructor}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1"><Users size={12} /> {course.reviews} học viên</div>
                            <div className="flex items-center gap-1"><BookOpen size={12} /> {course.totalLessons || 24} bài học</div>
                            <div className="flex items-center gap-1"><Star size={12} className="text-yellow-500" fill="currentColor" /> {course.rating}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-primary">{Number(course.price).toLocaleString('vi-VN')}đ</span>
                            <span className="text-xs text-slate-400 line-through">{course.originalPrice ? Number(course.originalPrice).toLocaleString('vi-VN') : ''}đ</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleTogglePublished(course)} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${course.published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {course.published ? 'Công khai' : 'Ẩn'}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(course)} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(course.id)} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-500"><Trash2 size={18} /></button>
                            <button onClick={() => setSelectedCourse(course)} className="rounded-lg p-2 text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-white"><MoreVertical size={18} /></button>
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

      {selectedCourse && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 py-6">
          <button className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedCourse(null)} aria-label="Đóng chi tiết khóa học" />
          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <div className="relative h-56 bg-slate-900">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${selectedCourse.thumbnail})` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">{selectedCourse.category || 'Khóa học'}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedCourse.published ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700/70 text-slate-200'}`}>
                    {selectedCourse.published ? 'Đang công khai' : 'Đang ẩn'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold sm:text-3xl">{selectedCourse.title}</h3>
                <p className="mt-2 text-sm text-slate-200">Giảng viên: {selectedCourse.instructor || 'Đang cập nhật'}</p>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-border dark:bg-dark-bg">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Giá bán</p>
                    <p className="mt-2 text-2xl font-bold text-primary">{Number(selectedCourse.price || 0).toLocaleString('vi-VN')}đ</p>
                    <p className="mt-1 text-sm text-slate-400 line-through">{selectedCourse.originalPrice ? Number(selectedCourse.originalPrice).toLocaleString('vi-VN') : '0'}đ</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-border dark:bg-dark-bg">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Bài học</p>
                    <p className="mt-2 text-2xl font-bold">{selectedCourse.totalLessons || 0}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tổng số bài</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-border dark:bg-dark-bg">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Đánh giá</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Star size={18} className="text-yellow-500" fill="currentColor" />
                      <p className="text-2xl font-bold">{selectedCourse.rating || 0}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedCourse.reviews || 0} học viên</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
                  <h4 className="text-lg font-bold">Thông tin khóa học</h4>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mã khóa học</p>
                      <p className="mt-2 font-medium">{selectedCourse.id}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Danh mục</p>
                      <p className="mt-2 font-medium">{selectedCourse.category || 'Đang cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Giảng viên</p>
                      <p className="mt-2 font-medium">{selectedCourse.instructor || 'Đang cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái</p>
                      <p className="mt-2 font-medium">{selectedCourse.published ? 'Công khai' : 'Ẩn'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hành động nhanh</p>
                  <div className="mt-4 space-y-3">
                    <button onClick={() => openEditModal(selectedCourse)} className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                      Chỉnh sửa khóa học
                    </button>
                    <button onClick={() => handleTogglePublished(selectedCourse)} className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-100 dark:border-dark-border dark:bg-dark-card dark:text-slate-200 dark:hover:bg-dark-border">
                      {selectedCourse.published ? 'Ẩn khóa học' : 'Công khai khóa học'}
                    </button>
                    <button onClick={() => handleDelete(selectedCourse.id)} className="flex w-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
                      Xóa khóa học
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-sm text-slate-500 dark:border-dark-border dark:bg-dark-card dark:text-slate-400">
                  Kiểm tra kỹ thông tin giảng viên, giá bán và trạng thái hiển thị trước khi cập nhật.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCourseModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center px-4 py-6">
          <button className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={closeCourseModal} aria-label="Đóng form khóa học" />
          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{courseFormMode === 'create' ? 'Tạo khóa học mới' : 'Cập nhật khóa học'}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Nhập đầy đủ thông tin khóa học để lưu và hiển thị đúng trên hệ thống.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tên khóa học *</label>
                <input value={courseFormValues.title} onChange={(event) => setCourseFormValues((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder="Nhập tên khóa học" />
                {courseFormErrors.title && <p className="text-sm text-red-500">{courseFormErrors.title}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Giảng viên *</label>
                <input value={courseFormValues.instructorName} onChange={(event) => setCourseFormValues((prev) => ({ ...prev, instructorName: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder="Nhập tên giảng viên" />
                {courseFormErrors.instructorName && <p className="text-sm text-red-500">{courseFormErrors.instructorName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Danh mục *</label>
                <input value={courseFormValues.category} onChange={(event) => setCourseFormValues((prev) => ({ ...prev, category: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder="Ví dụ: Web Dev" />
                {courseFormErrors.category && <p className="text-sm text-red-500">{courseFormErrors.category}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
                <textarea value={courseFormValues.description} onChange={(event) => setCourseFormValues((prev) => ({ ...prev, description: event.target.value }))} rows={4} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder="Mô tả ngắn cho khóa học" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Thumbnail URL</label>
                <input value={courseFormValues.thumbnailUrl} onChange={(event) => setCourseFormValues((prev) => ({ ...prev, thumbnailUrl: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder="https://..." />
                {courseFormErrors.thumbnailUrl && <p className="text-sm text-red-500">{courseFormErrors.thumbnailUrl}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Giá bán *</label>
                <input type="number" value={courseFormValues.price} onChange={(event) => setCourseFormValues((prev) => ({ ...prev, price: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" />
                {courseFormErrors.price && <p className="text-sm text-red-500">{courseFormErrors.price}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Giá gốc *</label>
                <input type="number" value={courseFormValues.originalPrice} onChange={(event) => setCourseFormValues((prev) => ({ ...prev, originalPrice: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" />
                {courseFormErrors.originalPrice && <p className="text-sm text-red-500">{courseFormErrors.originalPrice}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Số bài học *</label>
                <input type="number" value={courseFormValues.totalLessons} onChange={(event) => setCourseFormValues((prev) => ({ ...prev, totalLessons: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" />
                {courseFormErrors.totalLessons && <p className="text-sm text-red-500">{courseFormErrors.totalLessons}</p>}
              </div>
              <div className="flex items-center gap-3 pt-8">
                <input id="published" type="checkbox" checked={courseFormValues.published} onChange={(event) => setCourseFormValues((prev) => ({ ...prev, published: event.target.checked }))} className="size-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="published" className="text-sm font-medium text-slate-700 dark:text-slate-300">Công khai khóa học ngay sau khi lưu</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-slate-50/80 px-6 py-4 dark:border-dark-border dark:bg-dark-bg/40">
              <button onClick={closeCourseModal} disabled={courseFormSubmitting} className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-card dark:text-slate-300 dark:hover:bg-dark-border">Hủy</button>
              <button onClick={handleSubmitCourse} disabled={courseFormSubmitting} className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
                {courseFormSubmitting ? 'Đang lưu...' : courseFormMode === 'create' ? 'Tạo khóa học' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;

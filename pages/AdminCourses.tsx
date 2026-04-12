import React, { useEffect, useState } from 'react';
import { Search, Bell, Plus, Filter, MoreVertical, Edit, Trash2, Star, BookOpen, Users, Video, UploadCloud } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ControlSelect from '../components/filters/ControlSelect';
import { Course, Lesson } from '../types';
import { adminCreateCourse, adminCreateLesson, adminDeleteCourse, adminDeleteLesson, adminGetCourseLessons, adminGetCourses, adminUpdateCourse, adminUpdateLesson, completeMediaUpload, createMediaUploadSession, uploadMediaChunk } from '../api';
import { showAlert, showConfirm, showPrompt } from '../components/dialogs/DialogProvider';
import { showErrorToast, showInfoToast, showSuccessToast } from '../components/feedback/ToastProvider';

interface AdminCoursesProps {
  onNavigate: (page: string) => void;
  role: 'admin' | 'instructor';
}

const formatLessonDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const MEDIA_CHUNK_SIZE = 5 * 1024 * 1024;

const getShortId = (value?: string) => (value ? value.replace(/-/g, '').slice(0, 8).toUpperCase() : 'N/A');
const getCourseLabel = (course?: Course | null) => (course?.courseCode || getShortId(course?.id));

const detectVideoDuration = (file: File) =>
  new Promise<number>((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      video.load();
    };

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.max(0, Math.round(video.duration)) : 0;
      cleanup();
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Không thể đọc thời lượng video.'));
    };

    video.src = objectUrl;
  });

const AdminCourses: React.FC<AdminCoursesProps> = ({ onNavigate, role }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'HIDDEN'>('ALL');
  const [sortMode, setSortMode] = useState<'TITLE_ASC' | 'TITLE_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'INSTRUCTOR_ASC'>('TITLE_ASC');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseFormMode, setCourseFormMode] = useState<'create' | 'edit'>('create');
  const [lessonFormMode, setLessonFormMode] = useState<'create' | 'edit'>('create');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [courseFormValues, setCourseFormValues] = useState({
    title: '',
    instructorName: role === 'instructor' ? 'Tự động theo tài khoản giảng viên' : '',
    category: '',
    description: '',
    thumbnailUrl: '',
    price: '500000',
    originalPrice: '1000000',
    totalLessons: '12',
    published: true,
  });
  const [lessonFormValues, setLessonFormValues] = useState({
    title: '',
    orderIndex: '1',
    durationSeconds: '600',
    preview: false,
    mediaFileId: '',
  });
  const [lessonMediaFile, setLessonMediaFile] = useState<File | null>(null);
  const [lessonUploadProgress, setLessonUploadProgress] = useState(0);
  const [courseFormErrors, setCourseFormErrors] = useState<Record<string, string>>({});
  const [lessonFormErrors, setLessonFormErrors] = useState<Record<string, string>>({});
  const [courseFormSubmitting, setCourseFormSubmitting] = useState(false);
  const [lessonFormSubmitting, setLessonFormSubmitting] = useState(false);

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

  const load = async (
    query: string,
    category: string,
    status: 'ALL' | 'PUBLISHED' | 'HIDDEN',
    preserveSelectedId?: string | null,
  ) => {
    try {
      const published = status === 'ALL' ? undefined : status === 'PUBLISHED';
      const data = await adminGetCourses(category, query, published);
      setCourses(data as Course[]);
      setSelectedCourse((current) => {
        const targetId = preserveSelectedId ?? current?.id;
        return targetId ? (data as Course[]).find((item) => item.id === targetId) || null : current;
      });
      setError('');
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    }
  };

  const loadLessons = async (courseId: string) => {
    setLessonLoading(true);
    try {
      const data = await adminGetCourseLessons(courseId);
      setCourseLessons((data as Lesson[]).slice().sort((a, b) => a.orderIndex - b.orderIndex));
    } catch {
      setCourseLessons([]);
      showErrorToast();
    } finally {
      setLessonLoading(false);
    }
  };

  useEffect(() => {
    load(search, categoryFilter, statusFilter);
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    if (!selectedCourse?.id) {
      setCourseLessons([]);
      return;
    }
    loadLessons(selectedCourse.id);
  }, [selectedCourse?.id]);

  const sortedCourses = React.useMemo(() => {
    const list = [...courses];
    switch (sortMode) {
      case 'TITLE_DESC':
        list.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
        break;
      case 'PRICE_ASC':
        list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'PRICE_DESC':
        list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'INSTRUCTOR_ASC':
        list.sort((a, b) => String(a.instructor || '').localeCompare(String(b.instructor || ''), 'vi'));
        break;
      default:
        list.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        break;
    }
    return list;
  }, [courses, sortMode]);

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
      instructorName: role === 'instructor' ? 'Tự động theo tài khoản giảng viên' : '',
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

  const openCreateLessonModal = () => {
    if (!selectedCourse) return;
    setLessonFormMode('create');
    setEditingLessonId(null);
    setLessonFormValues({
      title: '',
      orderIndex: String(courseLessons.length + 1),
      durationSeconds: '',
      preview: false,
      mediaFileId: '',
    });
    setLessonMediaFile(null);
    setLessonUploadProgress(0);
    setLessonFormErrors({});
    setIsLessonModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setCourseFormMode('edit');
    setEditingCourseId(course.id);
    setCourseFormValues({
      title: course.title || '',
      instructorName: role === 'instructor' ? 'Tự động theo tài khoản giảng viên' : course.instructor || '',
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

  const openEditLessonModal = (lesson: Lesson) => {
    setLessonFormMode('edit');
    setEditingLessonId(lesson.id);
    setLessonFormValues({
      title: lesson.title || '',
      orderIndex: String(lesson.orderIndex || 1),
      durationSeconds: String(lesson.durationSeconds ?? 0),
      preview: Boolean(lesson.preview),
      mediaFileId: lesson.mediaFileId || '',
    });
    setLessonMediaFile(null);
    setLessonUploadProgress(0);
    setLessonFormErrors({});
    setIsLessonModalOpen(true);
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
    if (role !== 'instructor' && courseFormValues.instructorName.trim().length < 2) nextErrors.instructorName = 'Tên giảng viên tối thiểu 2 ký tự.';
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

  const validateLessonForm = () => {
    const nextErrors: Record<string, string> = {};
    if (lessonFormValues.title.trim().length < 2) nextErrors.title = 'Tên bài học tối thiểu 2 ký tự.';
    const orderIndex = Number(lessonFormValues.orderIndex);
    if (!Number.isInteger(orderIndex) || orderIndex < 1) nextErrors.orderIndex = 'Thứ tự bài học phải từ 1 trở lên.';
    const durationSeconds = Number(lessonFormValues.durationSeconds);
    if (!Number.isInteger(durationSeconds) || durationSeconds < 0) nextErrors.durationSeconds = 'Thời lượng phải là số nguyên không âm.';
    setLessonFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLessonMediaFileChange = async (file: File | null) => {
    setLessonMediaFile(file);
    if (!file) {
      if (lessonFormMode === 'create') {
        setLessonFormValues((prev) => ({ ...prev, durationSeconds: '' }));
      }
      return;
    }

    try {
      const durationSeconds = await detectVideoDuration(file);
      setLessonFormValues((prev) => ({
        ...prev,
        durationSeconds: String(durationSeconds),
      }));
      setLessonFormErrors((prev) => {
        const next = { ...prev };
        delete next.durationSeconds;
        return next;
      });
    } catch {
      showInfoToast('Không thể tự đọc thời lượng video. Bạn có thể nhập thủ công.');
    }
  };

  const closeCourseModal = () => {
    if (courseFormSubmitting) return;
    setIsCourseModalOpen(false);
    setCourseFormErrors({});
  };

  const closeLessonModal = () => {
    if (lessonFormSubmitting) return;
    setIsLessonModalOpen(false);
    setLessonFormErrors({});
    setLessonMediaFile(null);
    setLessonUploadProgress(0);
  };

  const uploadSelectedLessonVideo = async () => {
    if (!lessonMediaFile) {
      return lessonFormValues.mediaFileId || undefined;
    }

    const session = await createMediaUploadSession({
      fileName: lessonMediaFile.name,
      mimeType: lessonMediaFile.type || 'video/mp4',
      totalSize: lessonMediaFile.size,
      chunkSize: MEDIA_CHUNK_SIZE,
    });

    const totalChunks = Math.ceil(lessonMediaFile.size / MEDIA_CHUNK_SIZE);
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
      const start = chunkIndex * MEDIA_CHUNK_SIZE;
      const end = Math.min(start + MEDIA_CHUNK_SIZE, lessonMediaFile.size);
      const chunk = lessonMediaFile.slice(start, end);
      await uploadMediaChunk(session.uploadId, chunkIndex, chunk);
      setLessonUploadProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
    }

    const completed = await completeMediaUpload(session.uploadId);
    if (!completed.mediaFileId) {
      throw new Error('Không thể hoàn tất upload video.');
    }

    return completed.mediaFileId;
  };

  const handleSubmitCourse = async () => {
    if (!validateCourseForm()) return;
    setCourseFormSubmitting(true);
    try {
      const payload = {
        title: courseFormValues.title.trim(),
        instructorName: role === 'instructor' ? undefined : courseFormValues.instructorName.trim(),
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

  const handleSubmitLesson = async () => {
    if (!selectedCourse || !validateLessonForm()) return;
    setLessonFormSubmitting(true);
    try {
      const uploadedMediaFileId = await uploadSelectedLessonVideo();
      const payload = {
        title: lessonFormValues.title.trim(),
        orderIndex: Number(lessonFormValues.orderIndex),
        durationSeconds: Number(lessonFormValues.durationSeconds),
        preview: lessonFormValues.preview,
        mediaFileId: uploadedMediaFileId,
        clearMedia: lessonFormMode === 'edit' && !uploadedMediaFileId && !lessonMediaFile,
      };

      if (lessonFormMode === 'create') {
        await adminCreateLesson(selectedCourse.id, payload);
      } else if (editingLessonId) {
        await adminUpdateLesson(editingLessonId, payload);
      }

      await Promise.all([
        loadLessons(selectedCourse.id),
        load(search, categoryFilter, statusFilter, selectedCourse.id),
      ]);
      showSuccessToast('Cập nhật thành công');
      setIsLessonModalOpen(false);
    } catch (err: any) {
      const message = err?.message || 'Đã xảy ra lỗi, vui lòng thử lại.';
      showErrorToast();
      await showAlert({ title: 'Thông báo', message, tone: 'danger' });
    } finally {
      setLessonFormSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourse) return;
    const ok = await showConfirm({
      title: 'Xóa bài học',
      message: 'Bạn có chắc chắn muốn xóa bài học này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      tone: 'danger',
    });
    if (!ok) return;

    try {
      await adminDeleteLesson(lessonId);
      await Promise.all([
        loadLessons(selectedCourse.id),
        load(search, categoryFilter, statusFilter, selectedCourse.id),
      ]);
      showSuccessToast('Cập nhật thành công');
    } catch {
      showErrorToast();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role={role} activePage="admin-courses" onNavigate={onNavigate} />
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
                <p className="text-sm font-bold leading-none">{role === 'admin' ? 'Admin User' : 'Instructor User'}</p>
                <p className="mt-1 text-xs text-slate-500">{role === 'admin' ? 'Quản trị viên' : 'Giảng viên'}</p>
              </div>
              <div className="size-10 rounded-full border-2 border-gray-200 bg-cover bg-center dark:border-dark-border" style={{ backgroundImage: 'url(https://picsum.photos/seed/admin/100/100)' }}></div>
            </div>
          </div>
        </header>

        <main className="flex flex-1 justify-center overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex w-full max-w-[1200px] flex-col gap-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{role === 'admin' ? 'Danh sách khóa học' : 'Khóa học của tôi'}</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{role === 'admin' ? 'Quản lý nội dung, giá và trạng thái các khóa học.' : 'Quản lý nội dung và bài học cho các khóa học do bạn phụ trách.'}</p>
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
                  <ControlSelect
                    value={sortMode}
                    onChange={(value) => setSortMode(value as typeof sortMode)}
                    options={[
                      { value: 'TITLE_ASC', label: 'Tên A-Z' },
                      { value: 'TITLE_DESC', label: 'Tên Z-A' },
                      { value: 'INSTRUCTOR_ASC', label: 'Giảng viên A-Z' },
                      { value: 'PRICE_ASC', label: 'Giá thấp đến cao' },
                      { value: 'PRICE_DESC', label: 'Giá cao đến thấp' },
                    ]}
                  />
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
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-gray-50 px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-bg dark:ring-dark-border">
                  Trạng thái: {statusFilter === 'ALL' ? 'Tất cả' : statusFilter === 'PUBLISHED' ? 'Công khai' : 'Ẩn'}
                </span>
                <span className="rounded-full bg-gray-50 px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-bg dark:ring-dark-border">
                  Sắp xếp: {{
                    TITLE_ASC: 'Tên A-Z',
                    TITLE_DESC: 'Tên Z-A',
                    INSTRUCTOR_ASC: 'Giảng viên A-Z',
                    PRICE_ASC: 'Giá thấp đến cao',
                    PRICE_DESC: 'Giá cao đến thấp',
                  }[sortMode]}
                </span>
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
                    {sortedCourses.map((course) => (
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
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card">
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

            <div className="grid flex-1 gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[1fr_1.35fr]">
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
                      <p className="mt-2 font-medium">{getCourseLabel(selectedCourse)}</p>
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
                  <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-slate-500 dark:border-dark-border dark:bg-dark-bg dark:text-slate-400">
                    Bạn có thể upload video nội bộ cho từng bài học ở danh sách bên phải. Hệ thống sẽ phát video qua backend riêng của dự án.
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
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
                <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 dark:border-dark-border sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-lg font-bold">Danh sách bài học</h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Thêm từng buổi học và gắn video nội bộ cho từng bài học tại đây.</p>
                  </div>
                  <button onClick={openCreateLessonModal} className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                    <Plus size={18} />
                    Thêm bài học
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {lessonLoading ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-slate-500 dark:border-dark-border dark:bg-dark-bg dark:text-slate-400">
                      Đang tải danh sách bài học...
                    </div>
                  ) : courseLessons.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-slate-500 dark:border-dark-border dark:bg-dark-bg dark:text-slate-400">
                      Chưa có bài học nào. Bạn có thể bấm <strong>Thêm bài học</strong> để tạo buổi đầu tiên.
                    </div>
                  ) : (
                    courseLessons.map((lesson) => (
                      <div key={lesson.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-border dark:bg-dark-bg">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Buổi {lesson.orderIndex}</span>
                              {lesson.preview && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Preview</span>}
                            </div>
                            <p className="mt-3 font-semibold text-slate-900 dark:text-white">{lesson.title}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1"><Video size={14} /> {formatLessonDuration(lesson.durationSeconds)}</span>
                              {lesson.mediaFileId ? (
                                lesson.mediaProcessing ? (
                                  <span className="flex items-center gap-1 text-amber-600"><UploadCloud size={14} /> Đang xử lý video</span>
                                ) : (
                                  <span className="flex items-center gap-1 text-emerald-600"><UploadCloud size={14} /> Đã gắn video nội bộ</span>
                                )
                              ) : (
                                <span>Chưa có video</span>
                              )}
                            </div>
                            <p className="mt-2 truncate text-xs text-slate-500 dark:text-slate-400">{lesson.mediaFileName || 'Bạn chưa upload video cho bài học này.'}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button onClick={() => openEditLessonModal(lesson)} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary"><Edit size={18} /></button>
                            <button onClick={() => handleDeleteLesson(lesson.id)} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-500"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                <input value={courseFormValues.instructorName} onChange={(event) => setCourseFormValues((prev) => ({ ...prev, instructorName: event.target.value }))} disabled={role === 'instructor'} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder="Nhập tên giảng viên" />
                {role === 'instructor' && <p className="text-xs text-slate-500 dark:text-slate-400">Tên giảng viên được lấy theo tài khoản đăng nhập của bạn.</p>}
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

      {isLessonModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center px-4 py-6">
          <button className="absolute inset-0 bg-slate-950/65 backdrop-blur-md" onClick={closeLessonModal} aria-label="Đóng form bài học" />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/15 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-dark-card">
            <div className="border-b border-slate-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_42%),linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.9))] px-6 py-5 dark:border-dark-border dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_42%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(15,23,42,0.92))]">
              <div className="mb-3 inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Lesson Studio
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{lessonFormMode === 'create' ? 'Thêm bài học mới' : 'Cập nhật bài học'}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Khóa học: <span className="font-semibold text-slate-800 dark:text-white">{selectedCourse.title}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tên bài học *</label>
                <input value={lessonFormValues.title} onChange={(event) => setLessonFormValues((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" placeholder="Ví dụ: Buổi 1 - Giới thiệu khóa học" />
                {lessonFormErrors.title && <p className="text-sm text-red-500">{lessonFormErrors.title}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Thứ tự bài *</label>
                <input type="number" value={lessonFormValues.orderIndex} onChange={(event) => setLessonFormValues((prev) => ({ ...prev, orderIndex: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" />
                {lessonFormErrors.orderIndex && <p className="text-sm text-red-500">{lessonFormErrors.orderIndex}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Thời lượng (giây) *</label>
                <input type="number" value={lessonFormValues.durationSeconds} onChange={(event) => setLessonFormValues((prev) => ({ ...prev, durationSeconds: event.target.value }))} placeholder="Tự động lấy từ video đã chọn" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white" />
                {lessonFormErrors.durationSeconds && <p className="text-sm text-red-500">{lessonFormErrors.durationSeconds}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950/70">
                  <div className="mb-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">File video nội bộ</label>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Chọn video nguồn cho bài học. Hệ thống sẽ tự nhận diện thời lượng trước khi lưu.</p>
                  </div>
                  <input type="file" accept="video/*" onChange={(event) => void handleLessonMediaFileChange(event.target.files?.[0] || null)} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold file:text-primary hover:file:bg-primary/15 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white dark:file:bg-primary/15" />
                </div>
                {lessonFormValues.mediaFileId ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300">
                    Video hiện tại: {courseLessons.find((lesson) => lesson.id === editingLessonId)?.mediaFileName || 'Đã gắn video'}
                    <button
                      type="button"
                      onClick={() => setLessonFormValues((prev) => ({ ...prev, mediaFileId: '' }))}
                      className="ml-3 font-semibold underline"
                    >
                      Gỡ video
                    </button>
                  </div>
                ) : null}
                {lessonMediaFile ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Đã chọn: {lessonMediaFile.name} {lessonUploadProgress > 0 ? `(${lessonUploadProgress}%)` : ''}</p>
                ) : null}
                {!lessonMediaFile && editingLessonId && courseLessons.find((lesson) => lesson.id === editingLessonId)?.mediaProcessing ? (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Video hiện tại đang được xử lý nền để tối ưu phát HLS.</p>
                ) : null}
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <input id="preview-lesson" type="checkbox" checked={lessonFormValues.preview} onChange={(event) => setLessonFormValues((prev) => ({ ...prev, preview: event.target.checked }))} className="size-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="preview-lesson" className="text-sm font-medium text-slate-700 dark:text-slate-300">Cho phép xem thử bài học này</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-slate-50/80 px-6 py-4 dark:border-dark-border dark:bg-dark-bg/40">
              <button onClick={closeLessonModal} disabled={lessonFormSubmitting} className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-card dark:text-slate-300 dark:hover:bg-dark-border">Hủy</button>
              <button onClick={handleSubmitLesson} disabled={lessonFormSubmitting} className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
                {lessonFormSubmitting ? 'Đang lưu...' : lessonFormMode === 'create' ? 'Tạo bài học' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;

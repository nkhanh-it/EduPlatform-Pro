import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { getCourse, getCourseLessons, getMyEnrollments, getSelectedCourseId, setSelectedCourseId, setSelectedLessonId } from '../api';
import { Course, Enrollment, Lesson } from '../types';
import { showErrorToast } from '../components/feedback/ToastProvider';

interface CourseDetailProps {
  onNavigate: (page: string) => void;
}

const highlightItems = [
  { icon: Sparkles, title: 'Lộ trình rõ ràng', description: 'Nội dung được sắp xếp theo từng bước để dễ theo học và áp dụng.' },
  { icon: ShieldCheck, title: 'Học trọn đời', description: 'Có thể xem lại bất kỳ lúc nào sau khi đã đăng ký khóa học.' },
  { icon: GraduationCap, title: 'Phù hợp thực tế', description: 'Tập trung vào kỹ năng có thể dùng ngay trong học tập và công việc.' },
];

const CourseDetail: React.FC<CourseDetailProps> = ({ onNavigate }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const courseId = getSelectedCourseId();
    if (!courseId) {
      onNavigate('courses');
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [courseData, lessonData] = await Promise.all([
          getCourse(courseId),
          getCourseLessons(courseId).catch(() => []),
        ]);

        setCourse(courseData as Course);
        setLessons((lessonData as Lesson[]).sort((a, b) => a.orderIndex - b.orderIndex));

        try {
          const enrollmentData = await getMyEnrollments();
          setEnrollments(enrollmentData as Enrollment[]);
        } catch {
          setEnrollments([]);
        }
      } catch {
        setError('Đã xảy ra lỗi, vui lòng thử lại.');
        showErrorToast('Đã xảy ra lỗi, vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [onNavigate]);

  const enrollment = useMemo(
    () => enrollments.find((item) => item.course?.id === course?.id),
    [course?.id, enrollments],
  );

  const isAuthenticated = Boolean(localStorage.getItem('token'));
  const role = (() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? JSON.parse(raw).role as 'ADMIN' | 'STUDENT' : null;
    } catch {
      return null;
    }
  })();
  const isStudent = role === 'STUDENT';
  const isAdmin = role === 'ADMIN';
  const isEnrolled = Boolean(enrollment);
  const firstLesson = lessons[0] || null;
  const previewLesson = lessons.find((lesson) => lesson.preview) || firstLesson;

  const heroDescription = useMemo(() => {
    if (course?.description?.trim()) {
      return course.description.trim();
    }

    return `${course?.title || 'Khóa học này'} được thiết kế để giúp bạn nắm chắc kiến thức nền tảng, luyện tập theo từng bài học và ứng dụng vào tình huống thực tế.`;
  }, [course?.description, course?.title]);

  const detailParagraphs = useMemo(() => {
    const source = course?.description?.trim();
    if (source) {
      return source
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [
      `Bạn sẽ đi từ phần nền tảng đến các nội dung quan trọng nhất của ${course?.category || 'khóa học'}, theo cấu trúc bài học dễ theo dõi và dễ ôn lại.`,
      'Khóa học phù hợp cho người mới bắt đầu lẫn người đang muốn hệ thống lại kiến thức để áp dụng tốt hơn trong học tập và công việc.',
    ];
  }, [course?.category, course?.description]);

  const handlePrimaryAction = () => {
    if (!course) {
      return;
    }

    setSelectedCourseId(course.id);

    if (isAdmin) {
      onNavigate('admin-courses');
      return;
    }

    if (isEnrolled) {
      if (previewLesson?.id) {
        setSelectedLessonId(previewLesson.id);
      }
      onNavigate('course-player');
      return;
    }

    if (!isAuthenticated) {
      onNavigate('auth');
      return;
    }

    onNavigate('checkout');
  };

  const primaryActionLabel = isAdmin
    ? 'Quay lại quản lý khóa học'
    : isEnrolled
      ? 'Học ngay'
      : !isAuthenticated
        ? 'Đăng nhập để mua'
        : 'Mua khóa học';

  const secondaryActionLabel = isEnrolled ? 'Xem bài học' : 'Xem nội dung khóa học';

  if (loading) {
    return <div className="min-h-screen bg-[#f5f7f8] dark:bg-[#101922]" />;
  }

  if (!course || error) {
    return (
      <div className="min-h-screen bg-[#f5f7f8] px-4 py-12 text-slate-900 dark:bg-[#101922] dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-dark-border dark:bg-dark-card">
          <h1 className="text-2xl font-bold">Không tìm thấy khóa học</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Đã xảy ra lỗi, vui lòng thử lại.</p>
          <button
            onClick={() => onNavigate('courses')}
            className="mt-6 inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            Quay lại danh sách khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/85 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('courses')}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-dark-border dark:hover:text-white"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
          <button
            onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : isAuthenticated ? 'student-dashboard' : 'landing')}
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Edu Platform
          </button>
        </div>
      </header>

      <main className="pb-16">
        <section className="relative overflow-hidden border-b border-gray-200 bg-slate-950 text-white dark:border-dark-border">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_28%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_380px] lg:px-8 lg:py-16">
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-100">
                <Layers3 size={14} />
                {course.category || 'Khóa học nổi bật'}
              </div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{course.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">{heroDescription}</p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  <Users size={16} />
                  {course.reviews || 0} học viên quan tâm
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  <Star size={16} className="text-yellow-300" fill="currentColor" />
                  {Number(course.rating || 0).toFixed(1)} đánh giá
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  <BookOpen size={16} />
                  {lessons.length || course.totalLessons || 0} bài học
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  <GraduationCap size={16} />
                  {course.instructor}
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/8 shadow-2xl backdrop-blur-sm">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${course.thumbnail || 'https://picsum.photos/seed/course-detail/1200/720'})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
                </div>
                <div className="space-y-5 p-6">
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-white">{Number(course.price || 0).toLocaleString('vi-VN')}đ</span>
                    {course.originalPrice ? (
                      <span className="pb-1 text-sm text-slate-400 line-through">{Number(course.originalPrice).toLocaleString('vi-VN')}đ</span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/5 p-4 text-sm">
                    <div>
                      <p className="text-slate-400">Giảng viên</p>
                      <p className="mt-1 font-semibold text-white">{course.instructor}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Số bài học</p>
                      <p className="mt-1 font-semibold text-white">{lessons.length || course.totalLessons || 0}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handlePrimaryAction}
                      className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-primary-hover"
                    >
                      {primaryActionLabel}
                    </button>
                    <button
                      onClick={() => document.getElementById('lesson-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      {secondaryActionLabel}
                    </button>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      Truy cập đầy đủ nội dung sau khi đăng ký
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      Học theo tiến độ cá nhân, xem lại bất kỳ lúc nào
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      Nội dung phù hợp cho cả desktop và mobile
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
          <div className="space-y-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card sm:p-8">
              <h2 className="text-2xl font-bold">Về khóa học</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                {detailParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div id="lesson-list" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Nội dung khóa học</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {lessons.length || course.totalLessons || 0} bài học được sắp xếp theo lộ trình rõ ràng.
                  </p>
                </div>
                {isEnrolled && previewLesson ? (
                  <button
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setSelectedLessonId(previewLesson.id);
                      onNavigate('course-player');
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    <PlayCircle size={18} />
                    Học ngay
                  </button>
                ) : null}
              </div>

              <div className="mt-6 space-y-3">
                {(lessons.length ? lessons : Array.from({ length: course.totalLessons || 0 }, (_, index) => ({
                  id: `placeholder-${index + 1}`,
                  title: `Bài học ${index + 1}`,
                  orderIndex: index + 1,
                  durationSeconds: 0,
                  preview: index === 0,
                } as Lesson))).map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-slate-50/80 px-4 py-4 dark:border-dark-border dark:bg-dark-bg/70"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-semibold text-slate-900 dark:text-white">{lesson.title}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={14} />
                            {lesson.durationSeconds ? `${Math.max(1, Math.round(lesson.durationSeconds / 60))} phút` : 'Đang cập nhật'}
                          </span>
                          {lesson.preview ? (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-semibold text-emerald-600 dark:text-emerald-400">Xem thử</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
              <h3 className="text-lg font-bold">Thông tin nổi bật</h3>
              <div className="mt-5 space-y-4">
                {highlightItems.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-gray-100 bg-slate-50 p-4 dark:border-dark-border dark:bg-dark-bg/70">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                        <item.icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
              <h3 className="text-lg font-bold">Phù hợp với ai</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <p>Người mới bắt đầu muốn có lộ trình học rõ ràng.</p>
                <p>Người đang đi học hoặc đi làm cần học thêm kỹ năng thực tế.</p>
                <p>Người muốn học lại bài bản để áp dụng tốt hơn vào công việc.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CourseDetail;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  PlayCircle,
  Info,
  Folder,
  MessageSquare,
  CheckCircle,
  Circle,
  ChevronRight,
  Search,
  Award,
} from 'lucide-react';
import {
  getCourse,
  getCourseLessons,
  getMyEnrollments,
  getSelectedCourseId,
  getSelectedLessonId,
  setSelectedLessonId,
  updateEnrollmentProgress,
} from '../api';
import { Course, Enrollment, Lesson } from '../types';

interface CoursePlayerProps {
  onNavigate: (page: string) => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const getGumletEmbedUrl = (lesson: Lesson | null) => {
  if (!lesson) return null;
  const raw = lesson.gumletPlaybackUrl?.trim();
  return raw || null;
};

const CoursePlayer: React.FC<CoursePlayerProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'desc' | 'docs' | 'discussion'>('desc');
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const selectedCourseId = getSelectedCourseId();
      if (!selectedCourseId) {
        setError('Đã xảy ra lỗi, vui lòng thử lại.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [courseData, lessonData, enrollmentData] = await Promise.all([
          getCourse(selectedCourseId),
          getCourseLessons(selectedCourseId),
          getMyEnrollments(),
        ]);

        const matchedEnrollment =
          (enrollmentData as Enrollment[]).find((item) => item.course?.id === selectedCourseId) || null;

        if (!matchedEnrollment) {
          setError('Đã xảy ra lỗi, vui lòng thử lại.');
          setLoading(false);
          return;
        }

        const normalizedLessons = (lessonData as Lesson[]).slice().sort((a, b) => a.orderIndex - b.orderIndex);
        const completedCount = Math.max(0, Math.min(matchedEnrollment.completedLessons || 0, normalizedLessons.length));
        const initialCompletedIds = normalizedLessons.slice(0, completedCount).map((lesson) => lesson.id);
        const storedLessonId = getSelectedLessonId();
        const firstIncomplete = normalizedLessons[completedCount]?.id || normalizedLessons[0]?.id || null;
        const nextActiveLessonId = normalizedLessons.some((lesson) => lesson.id === storedLessonId) ? storedLessonId : firstIncomplete;

        setCourse(courseData as Course);
        setLessons(normalizedLessons);
        setEnrollment(matchedEnrollment);
        setCompletedLessonIds(initialCompletedIds);
        setActiveLessonId(nextActiveLessonId);

        if (nextActiveLessonId) setSelectedLessonId(nextActiveLessonId);
      } catch {
        setError('Đã xảy ra lỗi, vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredLessons = useMemo(() => {
    if (!search) return lessons;
    return lessons.filter((lesson) => lesson.title.toLowerCase().includes(search.toLowerCase()));
  }, [lessons, search]);

  const activeLessonIndex = lessons.findIndex((lesson) => lesson.id === activeLessonId);
  const activeLesson = activeLessonIndex >= 0 ? lessons[activeLessonIndex] : null;
  const activeLessonEmbedUrl = getGumletEmbedUrl(activeLesson);
  const completedCount = completedLessonIds.length;
  const totalLessons = lessons.length || enrollment?.totalLessons || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const persistProgress = async (nextCompletedIds: string[]) => {
    if (!enrollment) return;
    const nextCompletedLessons = Math.min(nextCompletedIds.length, lessons.length);
    const nextProgressPercent = lessons.length > 0 ? Math.round((nextCompletedLessons / lessons.length) * 100) : 0;

    setSaving(true);
    try {
      const updated = await updateEnrollmentProgress(enrollment.id, {
        progressPercent: nextProgressPercent,
        completedLessons: nextCompletedLessons,
        totalLessons: lessons.length,
      });
      setEnrollment(updated as Enrollment);
      setCompletedLessonIds(nextCompletedIds);
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setSelectedLessonId(lessonId);
  };

  const handleCompleteAndNext = async () => {
    if (!activeLesson || activeLessonIndex < 0) return;

    const nextCompletedIds = completedLessonIds.includes(activeLesson.id)
      ? completedLessonIds
      : [...completedLessonIds, activeLesson.id];

    await persistProgress(nextCompletedIds);

    const nextLesson = lessons[activeLessonIndex + 1];
    if (nextLesson) handleSelectLesson(nextLesson.id);
  };

  const handlePreviousLesson = () => {
    if (activeLessonIndex <= 0) return;
    handleSelectLesson(lessons[activeLessonIndex - 1].id);
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < 0 || activeLessonIndex >= lessons.length - 1) return;
    handleSelectLesson(lessons[activeLessonIndex + 1].id);
  };

  const isCompleted = (lessonId: string) => completedLessonIds.includes(lessonId);
  if (loading) {
    return <div className="min-h-screen bg-[#f5f7f8] px-6 py-10 text-sm text-slate-500">Đang tải trình phát khóa học...</div>;
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-[#f5f7f8] px-6 py-10">
        <p className="mb-4 text-sm text-red-500">{error}</p>
        <button onClick={() => onNavigate('student-courses')} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">
          Quay lại khóa học của tôi
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <header className="z-20 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-dark-border dark:bg-dark-bg">
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate('student-courses')} className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
            <ArrowLeft size={20} />
            <span>Khóa học của tôi</span>
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-dark-border"></div>
          <h1 className="hidden text-lg font-bold leading-tight md:block">{course?.title || 'Course Player'}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative size-10">
              <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                <circle className="stroke-gray-200 dark:stroke-dark-border" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                <circle className="stroke-primary" cx="18" cy="18" fill="none" r="16" strokeDasharray="100" strokeDashoffset={100 - progressPercent} strokeLinecap="round" strokeWidth="3"></circle>
              </svg>
              <div className="absolute left-1/2 top-1/2 text-[10px] font-bold -translate-x-1/2 -translate-y-1/2">{progressPercent}%</div>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tiến độ của bạn</p>
              <p className="text-sm font-bold">{completedCount}/{totalLessons} bài học</p>
            </div>
          </div>
          <div className="size-9 cursor-pointer rounded-full border-2 border-white bg-cover bg-center bg-no-repeat shadow-sm dark:border-dark-border" style={{ backgroundImage: 'url(https://picsum.photos/seed/user1/100/100)' }}></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 justify-center overflow-y-auto bg-gray-50 p-4 dark:bg-dark-bg md:p-6 lg:p-8">
          <div className="flex w-full max-w-5xl flex-col gap-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
              {activeLessonEmbedUrl ? (
                <iframe
                  key={activeLesson?.id}
                  className="absolute inset-0 h-full w-full"
                  src={activeLessonEmbedUrl}
                  title={activeLesson?.title || course?.title || 'Video bài học'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${course?.thumbnail || 'https://picsum.photos/seed/code/1920/1080'})` }}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/55 px-6 text-center text-white">
                    <PlayCircle size={56} className="text-white/80" />
                    <div>
                      <p className="text-lg font-semibold">Bài học này chưa có video</p>
                      <p className="mt-2 text-sm text-white/75">Bạn có thể vào quản lý khóa học và dán link phát video Gumlet cho buổi học này.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 dark:border-dark-border md:flex-row md:items-center">
              <div>
                <h2 className="mb-1 text-2xl font-bold">{activeLesson ? `Bài ${activeLesson.orderIndex}: ${activeLesson.title}` : course?.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Giảng viên: {course?.instructor || 'Đang cập nhật'} • Danh mục: {course?.category || 'Tổng hợp'}</p>
              </div>
              <div className="shrink-0 flex gap-3">
                <button onClick={handlePreviousLesson} disabled={activeLessonIndex <= 0} className="flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 font-medium transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-dark-border dark:hover:bg-dark-card">
                  <ArrowLeft size={20} /> Bài trước
                </button>
                <button onClick={handleNextLesson} disabled={activeLessonIndex < 0 || activeLessonIndex >= lessons.length - 1} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-600 disabled:opacity-50">
                  Bài tiếp theo <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div>
              <div className="flex gap-8 border-b border-gray-200 dark:border-dark-border">
                <button onClick={() => setActiveTab('desc')} className={`flex items-center gap-2 border-b-2 pb-3 text-sm ${activeTab === 'desc' ? 'border-primary font-bold text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>
                  <Info size={18} /> Mô tả
                </button>
                <button onClick={() => setActiveTab('docs')} className={`flex items-center gap-2 border-b-2 pb-3 text-sm ${activeTab === 'docs' ? 'border-primary font-bold text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>
                  <Folder size={18} /> Tài liệu
                </button>
                <button onClick={() => setActiveTab('discussion')} className={`flex items-center gap-2 border-b-2 pb-3 text-sm ${activeTab === 'discussion' ? 'border-primary font-bold text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>
                  <MessageSquare size={18} /> Thảo luận
                </button>
              </div>
              <div className="py-6">
                {activeTab === 'desc' && (
                  <div className="prose max-w-none text-slate-600 dark:prose-invert dark:text-slate-300">
                    <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Về bài học này</h3>
                    <p className="mb-4 leading-relaxed">
                      Bạn đang học <strong>{activeLesson?.title || course?.title}</strong>. Hệ thống sẽ tự động lưu tiến độ sau khi bạn hoàn thành từng bài.
                    </p>
                    <ul className="mb-6 list-disc space-y-2 pl-5 marker:text-primary">
                      <li>Tổng số bài học: {totalLessons}</li>
                      <li>Đã hoàn thành: {completedCount}</li>
                      <li>Trạng thái ghi danh: {enrollment?.status || 'N/A'}</li>
                    </ul>
                    <button onClick={handleCompleteAndNext} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover">
                      Đánh dấu hoàn thành bài này
                    </button>
                  </div>
                )}
                {activeTab === 'docs' && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-card dark:text-slate-300">
                    Tài liệu cho bài học này đang được cập nhật.
                  </div>
                )}
                {activeTab === 'discussion' && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-card dark:text-slate-300">
                    Khu vực thảo luận đang được cập nhật.
                  </div>
                )}
                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                {saving && <p className="mt-4 text-sm text-slate-500">Đang lưu tiến độ...</p>}
              </div>
            </div>
          </div>
        </main>

        <aside className="flex w-80 shrink-0 flex-col border-l border-gray-200 bg-white dark:border-dark-border dark:bg-dark-sidebar lg:w-96">
          <div className="border-b border-gray-200 p-4 dark:border-dark-border">
            <h3 className="mb-3 font-bold">Nội dung khóa học</h3>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg bg-gray-100 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-dark-bg" placeholder="Tìm kiếm bài học..." />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="border-b border-gray-100 dark:border-dark-border/50">
              <div className="flex w-full items-center justify-between bg-gray-50/50 p-4 text-left dark:bg-dark-card">
                <div>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Course</p>
                  <h4 className="text-sm font-bold">{course?.title}</h4>
                </div>
                <span className="text-xs font-medium text-slate-500">{filteredLessons.length}/{lessons.length}</span>
              </div>
              <div className="bg-white dark:bg-dark-sidebar">
                {filteredLessons.map((lesson) => {
                  const lessonCompleted = isCompleted(lesson.id);
                  const isActive = lesson.id === activeLessonId;

                  return (
                    <button key={lesson.id} onClick={() => handleSelectLesson(lesson.id)} className={`flex w-full items-start gap-3 p-3 pl-4 text-left transition-colors ${isActive ? 'border-r-4 border-primary bg-blue-50 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-dark-card'}`}>
                      {lessonCompleted ? (
                        <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-500" />
                      ) : isActive ? (
                        <PlayCircle size={20} className="mt-0.5 shrink-0 text-primary" />
                      ) : (
                        <Circle size={20} className="mt-0.5 shrink-0 text-slate-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm ${isActive ? 'font-bold text-primary' : 'font-medium'}`}>
                          {lesson.orderIndex}. {lesson.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <PlayCircle size={14} className={isActive ? 'text-primary/70' : 'text-slate-400'} />
                          <span className="text-xs text-slate-500">{formatDuration(lesson.durationSeconds)}</span>
                          {lesson.preview && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">Preview</span>}
                          {lesson.gumletPlaybackUrl && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">Gumlet</span>}
                          {isActive && <span className="ml-auto rounded bg-primary px-1.5 text-[10px] text-white">Đang học</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-dark-border dark:bg-dark-bg">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-500">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hoàn thành khóa học để nhận chứng chỉ</p>
                <p className="text-sm font-bold">{course?.title || 'Chưa chọn khóa học'}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;




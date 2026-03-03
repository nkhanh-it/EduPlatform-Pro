import React from 'react';
import { 
  ArrowLeft, 
  PlayCircle, 
  Settings, 
  Maximize, 
  Volume2, 
  Info, 
  Folder, 
  MessageSquare, 
  Star,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Search,
  Award
} from 'lucide-react';

interface CoursePlayerProps {
  onNavigate: (page: string) => void;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg px-6 py-3 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate('student-courses')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft size={20} />
            <span>Khóa học của tôi</span>
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-dark-border"></div>
          <h1 className="text-lg font-bold leading-tight hidden md:block">Mastering ReactJS: Từ Cơ Bản Đến Nâng Cao</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative size-10">
              <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                <circle className="stroke-gray-200 dark:stroke-dark-border" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                <circle className="stroke-primary" cx="18" cy="18" fill="none" r="16" strokeDasharray="100" strokeDashoffset="65" strokeLinecap="round" strokeWidth="3"></circle>
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[10px] font-bold">35%</div>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tiến độ của bạn</p>
              <p className="text-sm font-bold">12/34 Bài học</p>
            </div>
          </div>
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-9 border-2 border-white dark:border-dark-border shadow-sm cursor-pointer" style={{ backgroundImage: 'url(https://picsum.photos/seed/user1/100/100)' }}></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Player Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex justify-center bg-gray-50 dark:bg-dark-bg">
          <div className="w-full max-w-5xl flex flex-col gap-6">
            {/* Video Player */}
            <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black group aspect-video">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://picsum.photos/seed/code/1920/1080)' }}>
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-all cursor-pointer">
                    <button className="flex items-center justify-center rounded-full size-20 bg-primary/90 text-white hover:bg-primary hover:scale-105 transition-all shadow-lg backdrop-blur-sm">
                      <PlayCircle size={48} className="ml-1" />
                    </button>
                 </div>
                 <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-full flex flex-col gap-2">
                       <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer">
                          <div className="w-[35%] h-full bg-primary relative"></div>
                       </div>
                       <div className="flex justify-between text-white text-xs font-medium">
                          <div className="flex items-center gap-4">
                             <PlayCircle size={20} className="cursor-pointer hover:text-primary" />
                             <Volume2 size={20} className="cursor-pointer hover:text-primary" />
                             <span>04:20 / 12:45</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <Settings size={20} className="cursor-pointer hover:text-primary" />
                             <Maximize size={20} className="cursor-pointer hover:text-primary" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Lesson Title & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-dark-border pb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Chương 2, Bài 5: React Hooks - useEffect</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Cập nhật lần cuối: 24/05/2024</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border font-medium hover:bg-gray-100 dark:hover:bg-dark-card transition-colors">
                  <ArrowLeft size={20} /> Bài trước
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-colors">
                  Bài tiếp theo <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-8 border-b border-gray-200 dark:border-dark-border">
                <button className="pb-3 border-b-2 border-primary text-primary font-bold text-sm flex items-center gap-2">
                  <Info size={18} /> Mô tả
                </button>
                <button className="pb-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-primary font-medium text-sm transition-colors flex items-center gap-2">
                  <Folder size={18} /> Tài liệu <span className="bg-gray-100 dark:bg-dark-card text-[10px] py-0.5 px-1.5 rounded-full ml-1">2</span>
                </button>
                <button className="pb-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-primary font-medium text-sm transition-colors flex items-center gap-2">
                  <MessageSquare size={18} /> Thảo luận <span className="bg-gray-100 dark:bg-dark-card text-[10px] py-0.5 px-1.5 rounded-full ml-1">14</span>
                </button>
              </div>
              <div className="py-6">
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-3">Về bài học này</h3>
                  <p className="leading-relaxed mb-4">
                    Trong bài học này, chúng ta sẽ đi sâu vào <code className="bg-gray-100 dark:bg-dark-card px-1.5 py-0.5 rounded text-sm text-primary">useEffect</code> Hook. 
                    Đây là một trong những hook quan trọng nhất để xử lý side effects trong functional components.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-6 marker:text-primary">
                    <li>Cách lifecycle methods hoạt động trong Class component và sự tương đồng với useEffect.</li>
                    <li>Cách sử dụng dependency array để tối ưu hiệu năng.</li>
                    <li>Cách cleanup effects để tránh memory leaks.</li>
                  </ul>
                  <div className="bg-blue-50 dark:bg-primary/10 border border-blue-100 dark:border-primary/20 rounded-lg p-4 flex gap-3 items-start">
                    <Info size={20} className="text-primary mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Mẹo nhỏ</h4>
                      <p className="text-sm">Hãy chắc chắn bạn đã hoàn thành bài tập về <code className="text-primary font-mono text-xs">useState</code> trước khi bắt đầu bài này để có nền tảng tốt nhất.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar Lesson List */}
        <aside className="w-80 lg:w-96 bg-white dark:bg-dark-sidebar border-l border-gray-200 dark:border-dark-border flex flex-col shrink-0">
           <div className="p-4 border-b border-gray-200 dark:border-dark-border">
              <h3 className="font-bold mb-3">Nội dung khóa học</h3>
              <div className="relative">
                 <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input className="w-full bg-gray-100 dark:bg-dark-bg text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-slate-500" placeholder="Tìm kiếm bài học..." />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto">
              {/* Module 1 */}
              <div className="border-b border-gray-100 dark:border-dark-border/50">
                 <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-border transition-colors text-left group">
                    <div>
                       <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-0.5">Module 1</p>
                       <h4 className="text-sm font-bold group-hover:text-primary">Giới thiệu & Cài đặt</h4>
                    </div>
                    <ChevronDown size={20} className="text-slate-400" />
                 </button>
                 <div className="bg-white dark:bg-dark-sidebar">
                    {['Chào mừng bạn đến khóa học', 'Cài đặt môi trường VS Code'].map((lesson, idx) => (
                       <div key={idx} className="flex items-start gap-3 p-3 pl-4 hover:bg-gray-50 dark:hover:bg-dark-card cursor-pointer group">
                          <CheckCircle size={20} className="text-green-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium group-hover:text-primary truncate">{idx + 1}. {lesson}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <PlayCircle size={14} className="text-slate-400" />
                                <span className="text-xs text-slate-500">05:00</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Module 2 */}
              <div className="border-b border-gray-100 dark:border-dark-border/50">
                 <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-border transition-colors text-left group">
                    <div>
                       <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-0.5">Module 2</p>
                       <h4 className="text-sm font-bold group-hover:text-primary">Core Concepts & Hooks</h4>
                    </div>
                    <ChevronDown size={20} className="text-slate-400" />
                 </button>
                 <div className="bg-white dark:bg-dark-sidebar">
                    <div className="flex items-start gap-3 p-3 pl-4 hover:bg-gray-50 dark:hover:bg-dark-card cursor-pointer group">
                       <CheckCircle size={20} className="text-green-500 mt-0.5" />
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium group-hover:text-primary">3. Tổng quan về Components</p>
                          <div className="flex items-center gap-2 mt-1">
                             <PlayCircle size={14} className="text-slate-400" />
                             <span className="text-xs text-slate-500">10:15</span>
                          </div>
                       </div>
                    </div>
                    
                    {/* Active Lesson */}
                    <div className="flex items-start gap-3 p-3 pl-4 bg-blue-50 dark:bg-primary/10 border-r-4 border-primary cursor-pointer">
                       <PlayCircle size={20} className="text-primary mt-0.5" />
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-primary">5. React Hooks - useEffect</p>
                          <div className="flex items-center gap-2 mt-1">
                             <PlayCircle size={14} className="text-primary/70" />
                             <span className="text-xs text-primary/80">12:45</span>
                             <span className="text-[10px] bg-primary text-white px-1.5 rounded ml-auto">Đang học</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 pl-4 hover:bg-gray-50 dark:hover:bg-dark-card cursor-pointer group opacity-60">
                       <Circle size={20} className="text-slate-400 mt-0.5" />
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium group-hover:text-primary">6. Custom Hooks</p>
                          <div className="flex items-center gap-2 mt-1">
                             <PlayCircle size={14} className="text-slate-400" />
                             <span className="text-xs text-slate-500">08:20</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-gray-50 dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center gap-3">
                 <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500">
                    <Award size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hoàn thành khóa học để nhận</p>
                    <p className="text-sm font-bold">Chứng chỉ ReactJS Master</p>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;

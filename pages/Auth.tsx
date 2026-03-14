import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Github, BookOpen } from 'lucide-react';
import { login, register, setAuthSession } from '../api';
import { showErrorToast, showInfoToast, showSuccessToast } from '../components/feedback/ToastProvider';

interface AuthProps {
  onNavigate: (page: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  const validate = () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return 'Email không hợp lệ.';
    if (!password || password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';
    if (!isLogin && fullName.trim().length < 2) return 'Họ và tên tối thiểu 2 ký tự.';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      showErrorToast('Đã xảy ra lỗi, vui lòng thử lại.');
      return;
    }

    setLoading(true);
    setError('');
    setAuthNotice('');
    try {
      const response = isLogin
        ? await login({ email, password })
        : await register({ fullName, email, password });

      setAuthSession(response);
      showSuccessToast(isLogin ? 'Đăng nhập thành công' : 'Đăng ký thành công');

      if (response.user?.role === 'ADMIN') onNavigate('admin-dashboard');
      else onNavigate('student-dashboard');
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
      showErrorToast('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthNotice = (provider: 'Google' | 'GitHub') => {
    setError('');
    setAuthNotice(`${provider} chưa được cấu hình cho dự án này. Vui lòng đăng nhập bằng email và mật khẩu.`);
    showInfoToast('Đang xử lý...');
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#101922]">
      <div className="relative hidden overflow-hidden bg-[#0d7ff2] lg:flex lg:w-1/2">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary/80 to-sky-700/80" />
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop)' }} />

        <div className="relative z-20 flex w-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <BookOpen size={24} />
            </div>
            <span className="font-display text-2xl font-bold">EduPlatform</span>
          </div>

          <div className="space-y-6">
            <h1 className="font-display text-5xl font-bold leading-tight">
              Bắt đầu hành trình
              <br />
              học tập của bạn.
            </h1>
            <p className="max-w-md text-lg text-white/80">
              Tham gia cùng hàng nghìn học viên và chuyên gia. Nâng cao kỹ năng, mở rộng cơ hội nghề nghiệp ngay hôm nay.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/70">
            <span>© 2026 EduPlatform</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#f5f7f8] p-6 dark:bg-[#101922] sm:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
              {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {isLogin ? 'Vui lòng nhập thông tin để đăng nhập.' : 'Điền thông tin bên dưới để bắt đầu miễn phí.'}
            </p>
          </div>

          <div className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="text" className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-card dark:text-white" placeholder="Nguyễn Văn A" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="email" className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-card dark:text-white" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu</label>
                {isLogin && (
                  <button type="button" onClick={() => setAuthNotice('Bạn có thể đổi mật khẩu trong phần cài đặt sau khi đăng nhập.')} className="text-sm font-medium text-primary hover:text-primary-hover">
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="password" className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-card dark:text-white" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover disabled:opacity-60">
              {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
              <ArrowRight size={20} />
            </button>

            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            {authNotice && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">{authNotice}</p>}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-dark-border" /></div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#f5f7f8] px-4 text-slate-500 dark:bg-[#101922]">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleOAuthNotice('Google')} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-50 dark:border-dark-border dark:bg-dark-card dark:hover:bg-dark-border">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button onClick={() => handleOAuthNotice('GitHub')} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-50 dark:border-dark-border dark:bg-dark-card dark:hover:bg-dark-border">
                <Github size={20} className="text-slate-900 dark:text-white" />
                GitHub
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setAuthNotice(''); }} className="font-bold text-primary transition-colors hover:text-primary-hover">
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

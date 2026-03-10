import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Github, BookOpen } from 'lucide-react';

interface AuthProps {
  onNavigate: (page: string) => void;
}

import { useAuth } from '../AuthContext';
import { firestoreService } from '../firestoreService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface AuthProps {
  onNavigate: (page: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // UI State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Authenticate with Firebase Auth
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Fetch user document to get role
        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          onNavigate(userData.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
        } else {
          onNavigate('student-dashboard');
        }
      } else {
        // Register in Firebase Auth
        const { createUserWithEmailAndPassword, signOut } = await import('firebase/auth');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Add to Firestore database
        const { setDoc, doc } = await import('firebase/firestore');
        const newUserData = {
          name,
          email,
          phone,
          role: 'student',
          avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name)
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);

        // Sign out immediately to prevent auto-login
        await signOut(auth);

        // Show success and switch to login
        setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email đã được sử dụng!');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Email hoặc mật khẩu không chính xác!');
      } else if (err.code === 'auth/weak-password') {
        setError('Mật khẩu quá yếu, cần ít nhất 6 ký tự.');
      } else {
        setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex bg-white dark:bg-[#101922]">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0d7ff2] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-purple-600/80 z-10" />
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop)' }}></div>

        <div className="relative z-20 flex flex-col justify-between p-12 w-full text-white">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <span className="text-2xl font-bold font-display">EduPlatform</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold font-display leading-tight">
              Bắt đầu hành trình<br />học tập của bạn.
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Tham gia cùng hơn 10,000 học viên và chuyên gia. Nâng cao kỹ năng, mở rộng cơ hội nghề nghiệp ngay hôm nay.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/60">
            <span>© 2023 EduPlatform Inc.</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#f5f7f8] dark:bg-[#101922]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
              {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
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
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card py-3 pl-10 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card py-3 pl-10 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu</label>
                {isLogin && <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover">Quên mật khẩu?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card py-3 pl-10 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded-xl">{error}</div>}
            {successMsg && <div className="p-3 text-sm text-green-600 bg-green-100 dark:bg-green-900/30 rounded-xl">{successMsg}</div>}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-white font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản')}
              {!isLoading && <ArrowRight size={20} />}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-dark-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#f5f7f8] dark:bg-[#101922] px-4 text-slate-500">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-border transition-all">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-border transition-all">
                <Github size={20} className="text-slate-900 dark:text-white" />
                GitHub
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-primary hover:text-primary-hover transition-colors"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

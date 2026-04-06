<<<<<<< Updated upstream
import React, { useEffect, useState } from 'react';
import { User, Lock, Bell, CreditCard, LogOut, Camera, Save, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { changeMyPassword, clearAuthSession, getMe, setStoredUser, updateMe } from '../api';
=======
﻿import React, { useEffect, useMemo, useState } from 'react';
import { User, Lock, CreditCard, LogOut, Camera, Save, BookOpen, Clock3, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { changeMyPassword, clearAuthSession, getMe, getMyEnrollments, setStoredUser, updateMe } from '../api';
import { Enrollment } from '../types';
>>>>>>> Stashed changes
import { showPrompt } from '../components/dialogs/DialogProvider';
import { showErrorToast, showInfoToast, showSuccessToast, showWarningToast } from '../components/feedback/ToastProvider';

interface SettingsProps {
  onNavigate: (page: string) => void;
  role: 'student' | 'admin' | 'instructor';
}

<<<<<<< Updated upstream
const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('profile');
=======
type SettingsTab = 'profile' | 'security' | 'billing';

type ProfileSnapshot = {
  fullName?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
};

const formatCurrency = (value?: number | null) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const formatDate = (value?: string) => {
  if (!value) return 'Đang cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Đang cập nhật';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const Settings: React.FC<SettingsProps> = ({ onNavigate, role }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
>>>>>>> Stashed changes
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phone, setPhone] = useState('');
<<<<<<< Updated upstream
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [original, setOriginal] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
=======
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [original, setOriginal] = useState<ProfileSnapshot | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
>>>>>>> Stashed changes

  useEffect(() => {
    const load = async () => {
      try {
<<<<<<< Updated upstream
        const me = await getMe();
=======
        const [me, myEnrollments] = await Promise.all([
          getMe(),
          role === 'student' ? getMyEnrollments() : Promise.resolve([]),
        ]);
>>>>>>> Stashed changes
        setFullName(me.fullName || '');
        setDisplayName(me.displayName || '');
        setBio(me.bio || '');
        setAvatarUrl(me.avatarUrl || '');
        setPhone(me.phone || '');
<<<<<<< Updated upstream
        setOriginal(me);
      } catch {
        // ignore
      }
    };
    load();
  }, []);
=======
        setEmail(me.email || '');
        setOriginal(me);
        setEnrollments(myEnrollments as Enrollment[]);
      } catch {
        showErrorToast();
      } finally {
        setHistoryLoading(false);
      }
    };
    load();
  }, [role]);

  const purchasedSummary = useMemo(() => {
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((item) => (item.progressPercent || 0) >= 100).length;
    const inProgressCourses = enrollments.filter((item) => (item.progressPercent || 0) > 0 && (item.progressPercent || 0) < 100).length;
    const totalSpent = enrollments.reduce((sum, item) => sum + Number(item.course?.price || 0), 0);
    return { totalCourses, completedCourses, inProgressCourses, totalSpent };
  }, [enrollments]);
>>>>>>> Stashed changes

  const handleSave = async () => {
    if (fullName.trim().length < 2) {
      setMessage('Đã xảy ra lỗi, vui lòng thử lại.');
      showWarningToast();
      return;
    }
    setSaving(true);
    setMessage('');
    try {
<<<<<<< Updated upstream
      const updated = await updateMe({ fullName, displayName, avatarUrl, phone, bio });
=======
      const updated = await updateMe({
        fullName: fullName.trim(),
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      });
>>>>>>> Stashed changes
      setStoredUser(updated);
      setOriginal(updated);
      setMessage('Lưu thành công');
      showSuccessToast('Lưu thành công');
    } catch {
      const nextMessage = 'Đã xảy ra lỗi, vui lòng thử lại.';
      setMessage(nextMessage);
      showErrorToast(nextMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!original) return;
    setFullName(original.fullName || '');
    setDisplayName(original.displayName || '');
    setBio(original.bio || '');
    setAvatarUrl(original.avatarUrl || '');
    setPhone(original.phone || '');
<<<<<<< Updated upstream
    setMessage('Đã khôi phục dữ liệu ban đầu.');
    showInfoToast('Đã khôi phục dữ liệu ban đầu.');
=======
    setEmail(original.email || '');
    setMessage('Cập nhật thành công');
    showInfoToast('Cập nhật thành công');
>>>>>>> Stashed changes
  };

  const handleChangeAvatar = () => {
    showPrompt({
      title: 'Cập nhật ảnh đại diện',
<<<<<<< Updated upstream
      message: 'Nhập URL mới cho ảnh đại diện.',
      inputLabel: 'Avatar URL',
=======
      message: 'Nhập đường dẫn ảnh mới cho tài khoản của bạn.',
      inputLabel: 'Link ảnh',
>>>>>>> Stashed changes
      inputType: 'url',
      defaultValue: avatarUrl || '',
    }).then((url) => {
      if (url !== null) setAvatarUrl(url);
    });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Đã xảy ra lỗi, vui lòng thử lại.');
      showWarningToast();
      return;
    }
<<<<<<< Updated upstream
    if (newPassword !== confirmPassword) {
=======
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
>>>>>>> Stashed changes
      setMessage('Đã xảy ra lỗi, vui lòng thử lại.');
      showWarningToast();
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await changeMyPassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Cập nhật thành công');
      showSuccessToast('Cập nhật thành công');
    } catch {
      const nextMessage = 'Đã xảy ra lỗi, vui lòng thử lại.';
      setMessage(nextMessage);
      showErrorToast(nextMessage);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
<<<<<<< Updated upstream
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'security', label: 'Mật khẩu và bảo mật', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'billing', label: 'Thanh toán', icon: CreditCard },
=======
    { id: 'profile' as const, label: 'Thông tin cá nhân', icon: User },
    { id: 'security' as const, label: 'Mật khẩu', icon: Lock },
    ...(role === 'student' ? [{ id: 'billing' as const, label: 'Lịch sử mua', icon: CreditCard }] : []),
>>>>>>> Stashed changes
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
<<<<<<< Updated upstream
      <Sidebar role="student" activePage="settings" onNavigate={onNavigate} />
=======
      <Sidebar role={role} activePage="settings" onNavigate={onNavigate} />
>>>>>>> Stashed changes

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/90 md:px-10">
          <h1 className="text-xl font-bold">Cài đặt tài khoản</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
<<<<<<< Updated upstream
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-4">
=======
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-4">
>>>>>>> Stashed changes
            <div className="space-y-1 lg:col-span-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200 dark:bg-dark-card dark:ring-dark-border'
                      : 'text-slate-600 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-dark-card/50'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              <div className="mx-4 my-2 h-px bg-gray-200 dark:bg-dark-border"></div>
              <button
                onClick={() => {
                  clearAuthSession();
                  onNavigate('auth');
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>

<<<<<<< Updated upstream
            <div className="lg:col-span-3">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card">
                {activeTab === 'profile' && (
                  <div className="space-y-8 p-6 md:p-8">
                    <div>
                      <h2 className="text-lg font-bold">Hồ sơ công khai</h2>
                      <p className="text-sm text-slate-500">Thông tin này sẽ hiển thị trong tài khoản của bạn.</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="size-24 rounded-full border-4 border-white bg-cover bg-center shadow-md dark:border-dark-card" style={{ backgroundImage: `url(${avatarUrl || 'https://picsum.photos/seed/user1/200/200'})` }}></div>
                        <button onClick={handleChangeAvatar} className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-primary p-2 text-white shadow-lg transition-colors hover:bg-primary-hover dark:border-dark-card">
                          <Camera size={16} />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{fullName || 'Học viên'}</h3>
                        <p className="mb-2 text-sm text-slate-500">Học viên</p>
                        <button onClick={handleChangeAvatar} className="rounded-lg border border-primary/20 px-3 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/5">
                          Thay đổi ảnh đại diện
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Họ và tên</label>
                        <input type="text" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên hiển thị</label>
                        <input type="text" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Số điện thoại</label>
                        <input type="text" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Giới thiệu bản thân</label>
                        <textarea rows={4} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                      </div>
                    </div>

                    {message && <p className="text-sm text-slate-500">{message}</p>}

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-dark-border">
                      <button onClick={handleCancel} className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-gray-100 dark:hover:bg-dark-border">Hủy bỏ</button>
                      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-60">
                        <Save size={18} /> Lưu thay đổi
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8 p-6 md:p-8">
                    <div>
                      <h2 className="text-lg font-bold">Mật khẩu và bảo mật</h2>
                      <p className="text-sm text-slate-500">Quản lý mật khẩu và xác thực 2 bước.</p>
                    </div>

                    <div className="max-w-md space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
                        <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
                        <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Xác nhận mật khẩu mới</label>
                        <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 dark:border-dark-border">
                      <h3 className="mb-4 font-bold">Xác thực 2 bước (2FA)</h3>
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-border dark:bg-dark-bg">
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-green-100 p-2 text-green-600">
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Tin nhắn SMS</p>
                            <p className="text-xs text-slate-500">Mã xác thực sẽ được gửi về số điện thoại của bạn.</p>
                          </div>
                        </div>
                        <div className="relative inline-block h-6 w-12 rounded-full bg-green-500">
                          <div className="absolute left-6 top-1 h-4 w-4 rounded-full bg-white shadow-sm"></div>
                        </div>
                      </div>
                    </div>

                    {message && <p className="text-sm text-slate-500">{message}</p>}

                    <div className="flex justify-end pt-2">
                      <button onClick={handleChangePassword} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-60">
                        <Save size={18} /> Cập nhật mật khẩu
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-4 p-6 md:p-8">
                    <h2 className="text-lg font-bold">Thông báo</h2>
                    <p className="text-sm text-slate-500">Bạn sẽ nhận email khi giao dịch thành công, ghi danh được duyệt hoặc khóa học được cập nhật.</p>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-dark-border dark:bg-dark-bg">
                      Hệ thống đang áp dụng các thông báo mặc định cho tài khoản của bạn.
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-4 p-6 md:p-8">
                    <h2 className="text-lg font-bold">Thanh toán</h2>
                    <p className="text-sm text-slate-500">Bạn có thể chuyển sang trang thanh toán khi cần mua khóa học.</p>
                    <button onClick={() => onNavigate('checkout')} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">
                      Đi đến trang checkout
                    </button>
                  </div>
                )}
              </div>
=======
            <div className="space-y-6 lg:col-span-3">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{role === 'student' ? 'Khóa học đã mua' : 'Vai trò hệ thống'}</p>
                  <p className="mt-2 text-2xl font-bold">{role === 'student' ? purchasedSummary.totalCourses : role === 'admin' ? 'Admin' : 'Instructor'}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{role === 'student' ? 'Đang học' : 'Tên hiển thị'}</p>
                  <p className="mt-2 text-2xl font-bold">{role === 'student' ? purchasedSummary.inProgressCourses : (displayName || fullName || 'Đang cập nhật')}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{role === 'student' ? 'Tổng chi phí' : 'Email đăng nhập'}</p>
                  <p className="mt-2 text-2xl font-bold text-primary">{role === 'student' ? formatCurrency(purchasedSummary.totalSpent) : (email || 'Đang cập nhật')}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card">
                {activeTab === 'profile' && (
                  <div className="space-y-8 p-6 md:p-8">
                    <div>
                      <h2 className="text-lg font-bold">Thông tin cá nhân</h2>
                      <p className="text-sm text-slate-500">Cập nhật hồ sơ để thông tin tài khoản luôn chính xác.</p>
                    </div>

                    <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg md:flex-row md:items-center">
                      <div className="relative">
                        <div className="size-24 rounded-full border-4 border-white bg-cover bg-center shadow-md dark:border-dark-card" style={{ backgroundImage: `url(${avatarUrl || 'https://picsum.photos/seed/user1/200/200'})` }}></div>
                        <button onClick={handleChangeAvatar} className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-primary p-2 text-white shadow-lg transition-colors hover:bg-primary-hover dark:border-dark-card">
                          <Camera size={16} />
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold">{fullName || 'Học viên'}</h3>
                        <p className="mt-1 text-sm text-slate-500">{email || 'Chưa có email'}</p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Ảnh đại diện sẽ hiển thị ở trang học và hồ sơ của bạn.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Họ và tên</label>
                        <input type="text" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên hiển thị</label>
                        <input type="text" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                        <input type="email" className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-slate-500 focus:outline-none dark:border-dark-border dark:bg-dark-bg" value={email} readOnly />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Số điện thoại</label>
                        <input type="text" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Giới thiệu bản thân</label>
                        <textarea rows={4} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-bg" value={bio} onChange={(e) => setBio(e.target.value)} />
                      </div>
                    </div>

                    {message && <p className="text-sm text-slate-500">{message}</p>}

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-dark-border">
                      <button onClick={handleCancel} className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-gray-100 dark:hover:bg-dark-border">Khôi phục</button>
                      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-60">
                        <Save size={18} /> Lưu thay đổi
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8 p-6 md:p-8">
                    <div>
                      <h2 className="text-lg font-bold">Đổi mật khẩu</h2>
                      <p className="text-sm text-slate-500">Chỉ giữ lại phần bảo mật bạn đang dùng thật trong hệ thống.</p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                      <div className="max-w-md space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
                          <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-card" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
                          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-card" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Xác nhận mật khẩu mới</label>
                          <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-border dark:bg-dark-card" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Lưu ý bảo mật</p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nên dùng mật khẩu dài từ 6 ký tự trở lên và không dùng lại mật khẩu cũ.</p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Phiên đăng nhập</p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sau khi đổi mật khẩu thành công, bạn nên đăng nhập lại trên các thiết bị khác nếu có.</p>
                      </div>
                    </div>

                    {message && <p className="text-sm text-slate-500">{message}</p>}

                    <div className="flex justify-end pt-2">
                      <button onClick={handleChangePassword} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-60">
                        <Save size={18} /> Cập nhật mật khẩu
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-6 p-6 md:p-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-lg font-bold">Lịch sử mua khóa học</h2>
                        <p className="text-sm text-slate-500">Theo dõi các khóa học bạn đã đăng ký và tiến độ học hiện tại.</p>
                      </div>
                      <button onClick={() => onNavigate('courses')} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover">
                        Mua thêm khóa học
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                        <div className="flex items-center gap-3">
                          <BookOpen size={18} className="text-primary" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">Khóa học đã đăng ký</p>
                        </div>
                        <p className="mt-3 text-2xl font-bold">{purchasedSummary.totalCourses}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                        <div className="flex items-center gap-3">
                          <Clock3 size={18} className="text-amber-500" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">Đang học</p>
                        </div>
                        <p className="mt-3 text-2xl font-bold">{purchasedSummary.inProgressCourses}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={18} className="text-emerald-500" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">Đã hoàn thành</p>
                        </div>
                        <p className="mt-3 text-2xl font-bold">{purchasedSummary.completedCourses}</p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-dark-border">
                      <div className="grid grid-cols-[1.7fr,0.9fr,0.9fr,0.8fr] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-dark-border dark:bg-dark-bg">
                        <span>Khóa học</span>
                        <span>Ngày mua</span>
                        <span>Thanh toán</span>
                        <span>Tiến độ</span>
                      </div>

                      {historyLoading ? (
                        <div className="bg-white px-5 py-8 text-sm text-slate-500 dark:bg-dark-card dark:text-slate-400">Đang xử lý...</div>
                      ) : enrollments.length === 0 ? (
                        <div className="bg-white px-5 py-8 text-sm text-slate-500 dark:bg-dark-card dark:text-slate-400">Bạn chưa có khóa học nào.</div>
                      ) : (
                        <div className="divide-y divide-gray-100 bg-white dark:divide-dark-border dark:bg-dark-card">
                          {enrollments.map((item) => (
                            <div key={item.id} className="grid grid-cols-[1.7fr,0.9fr,0.9fr,0.8fr] gap-4 px-5 py-4 text-sm">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{item.course?.title}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.course?.instructor}</p>
                              </div>
                              <div className="text-slate-500 dark:text-slate-400">{formatDate(item.enrolledAt)}</div>
                              <div>
                                <p className="font-semibold text-primary">{formatCurrency(item.course?.price)}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.status === 'APPROVED' ? 'Đã ghi danh' : item.status === 'PENDING' ? 'Đang chờ duyệt' : 'Đã từ chối'}</p>
                              </div>
                              <div>
                                <p className="font-semibold">{item.progressPercent || 0}%</p>
                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-dark-bg">
                                  <div className="h-full rounded-full bg-primary" style={{ width: `${item.progressPercent || 0}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
>>>>>>> Stashed changes
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import {
   User,
   Lock,
   Bell,
   CreditCard,
   Globe,
   Moon,
   LogOut,
   Camera,
   Save,
   ShieldCheck
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../AuthContext';

interface SettingsProps {
   onNavigate: (page: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
   const { user, logout } = useAuth();
   const [activeTab, setActiveTab] = useState('profile');

   const tabs = [
      { id: 'profile', label: 'Thông tin cá nhân', icon: User },
      { id: 'security', label: 'Đăng nhập & Bảo mật', icon: Lock },
      { id: 'notifications', label: 'Thông báo', icon: Bell },
      { id: 'billing', label: 'Thanh toán', icon: CreditCard },
   ];

   return (
      <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
         <Sidebar role="student" activePage="profile" onNavigate={onNavigate} />

         <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <header className="h-16 flex-shrink-0 border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-bg/90 backdrop-blur-md px-6 md:px-10 flex items-center gap-4 sticky top-0 z-20">
               <h1 className="text-xl font-bold">Cài đặt tài khoản</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-10">
               <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                  {/* Settings Nav */}
                  <div className="lg:col-span-1 space-y-1">
                     {tabs.map(tab => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === tab.id
                              ? 'bg-white dark:bg-dark-card text-primary shadow-sm ring-1 ring-gray-200 dark:ring-dark-border'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-dark-card/50'
                              }`}
                        >
                           <tab.icon size={18} />
                           {tab.label}
                        </button>
                     ))}
                     <div className="h-px bg-gray-200 dark:bg-dark-border my-2 mx-4"></div>
                     <button
                        onClick={async () => {
                           await logout();
                           onNavigate('auth');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                     >
                        <LogOut size={18} /> Đăng xuất
                     </button>
                  </div>

                  {/* Settings Content */}
                  <div className="lg:col-span-3">
                     <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden">

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                           <div className="p-6 md:p-8 space-y-8">
                              <div>
                                 <h2 className="text-lg font-bold">Hồ sơ công khai</h2>
                                 <p className="text-sm text-slate-500">Thông tin này sẽ hiển thị cho những người dùng khác.</p>
                              </div>

                              {/* Avatar Upload */}
                              <div className="flex items-center gap-6">
                                 <div className="relative">
                                    <div className="size-24 rounded-full bg-cover bg-center border-4 border-white dark:border-dark-card shadow-md" style={{ backgroundImage: `url(${user?.avatar || 'https://picsum.photos/seed/user1/200/200'})` }}></div>
                                    <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white hover:bg-primary-hover shadow-lg transition-colors border-2 border-white dark:border-dark-card">
                                       <Camera size={16} />
                                    </button>
                                 </div>
                                 <div>
                                    <h3 className="font-bold text-lg">{user?.name || 'Học viên'}</h3>
                                    <p className="text-sm text-slate-500 mb-2">Học viên</p>
                                    <button className="text-xs font-bold text-primary border border-primary/20 px-3 py-1 rounded-lg hover:bg-primary/5 transition-colors">Thay đổi ảnh đại diện</button>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Họ và tên</label>
                                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:outline-none focus:ring-1 focus:ring-primary" defaultValue={user?.name || "Nguyễn Văn A"} />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên hiển thị</label>
                                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:outline-none focus:ring-1 focus:ring-primary" defaultValue={user?.name?.replace(/\s+/g, '') || "NguyenVanA"} />
                                 </div>
                                 <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Giới thiệu bản thân</label>
                                    <textarea rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="Đam mê lập trình Web và UI/UX Design. Đang học ReactJS tại EduPlatform."></textarea>
                                 </div>
                              </div>

                              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
                                 <button className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">Hủy bỏ</button>
                                 <button className="px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25 transition-colors flex items-center gap-2">
                                    <Save size={18} /> Lưu thay đổi
                                 </button>
                              </div>
                           </div>
                        )}

                        {/* Security Tab (Simplified) */}
                        {activeTab === 'security' && (
                           <div className="p-6 md:p-8 space-y-8">
                              <div>
                                 <h2 className="text-lg font-bold">Bảo mật tài khoản</h2>
                                 <p className="text-sm text-slate-500">Quản lý mật khẩu và xác thực 2 bước.</p>
                              </div>

                              <div className="space-y-4 max-w-md">
                                 <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
                                    <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:outline-none focus:ring-1 focus:ring-primary" />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
                                    <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:outline-none focus:ring-1 focus:ring-primary" />
                                 </div>
                              </div>

                              <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
                                 <h3 className="font-bold mb-4">Xác thực 2 bước (2FA)</h3>
                                 <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                                    <div className="flex items-center gap-4">
                                       <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                          <ShieldCheck size={24} />
                                       </div>
                                       <div>
                                          <p className="font-bold text-sm">Tin nhắn văn bản (SMS)</p>
                                          <p className="text-xs text-slate-500">Mã xác thực gửi về +84 912 *** ***</p>
                                       </div>
                                    </div>
                                    <div className="relative inline-block w-12 h-6 rounded-full bg-green-500 cursor-pointer">
                                       <div className="absolute left-6 top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all"></div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}

                     </div>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
};

export default Settings;
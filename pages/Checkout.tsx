import React, { useEffect, useState } from 'react';
import {
   CreditCard,
   Wallet,
   CheckCircle,
   ShieldCheck,
   ArrowLeft,
   QrCode
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Course } from '../types';
import { useAuth } from '../AuthContext';

interface CheckoutProps {
   onNavigate: (page: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
   const { user } = useAuth();
   const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | 'qr'>('card');
   const [course, setCourse] = useState<Course | null>(null);

   useEffect(() => {
      const fetchCourse = async () => {
         try {
            // Fallback mock since api is discarded
            setCourse({
               id: '1',
               title: 'Fullstack React & Node.js',
               instructor: 'Tech Master',
               thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&q=80&w=1000',
               category: 'Web Dev',
               rating: 4.9,
               reviews: 2150,
               price: 1500000,
               originalPrice: 3000000,
               totalLessons: 45,
               completedLessons: 0,
               progress: 0
            });
         } catch (error) {
            console.error('Fetch checkout course error', error);
         }
      };
      fetchCourse();
   }, []);

   return (
      <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
         <Sidebar role="student" activePage="courses" onNavigate={onNavigate} />

         <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Header */}
            <header className="h-16 flex-shrink-0 border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-bg/90 backdrop-blur-md px-6 md:px-10 flex items-center gap-4 sticky top-0 z-20">
               <button onClick={() => onNavigate('courses')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border text-slate-500">
                  <ArrowLeft size={20} />
               </button>
               <h1 className="text-xl font-bold">Thanh toán khóa học</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-10">
               <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Left Column: Payment Details */}
                  <div className="lg:col-span-2 space-y-8">
                     {/* Billing Info */}
                     <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Thông tin đăng ký</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Họ và tên</label>
                              <input type="text" className="w-full rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:outline-none" defaultValue={user?.name || "Nguyễn Văn A"} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                              <input type="email" className="w-full rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:outline-none" defaultValue={user?.email || "nguyenvana@email.com"} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Số điện thoại</label>
                              <input type="tel" className="w-full rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:outline-none" defaultValue={user?.phone || "0912 345 678"} />
                           </div>
                        </div>
                     </div>

                     {/* Payment Method Selection */}
                     <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Phương thức thanh toán</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <div
                              onClick={() => setPaymentMethod('card')}
                              className={`cursor-pointer rounded-xl p-4 border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 dark:border-dark-border hover:border-gray-300'}`}
                           >
                              <CreditCard size={32} />
                              <span className="text-sm font-bold">Thẻ quốc tế</span>
                           </div>
                           <div
                              onClick={() => setPaymentMethod('momo')}
                              className={`cursor-pointer rounded-xl p-4 border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'momo' ? 'border-[#a50064] bg-[#a50064]/5 text-[#a50064]' : 'border-gray-100 dark:border-dark-border hover:border-gray-300'}`}
                           >
                              <Wallet size={32} />
                              <span className="text-sm font-bold">Ví MoMo</span>
                           </div>
                           <div
                              onClick={() => setPaymentMethod('qr')}
                              className={`cursor-pointer rounded-xl p-4 border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'qr' ? 'border-green-500 bg-green-500/5 text-green-500' : 'border-gray-100 dark:border-dark-border hover:border-gray-300'}`}
                           >
                              <QrCode size={32} />
                              <span className="text-sm font-bold">Chuyển khoản QR</span>
                           </div>
                        </div>

                        {/* Conditional Payment Content */}
                        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border">
                           {paymentMethod === 'card' && (
                              <div className="space-y-4">
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Số thẻ</label>
                                    <div className="relative">
                                       <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                       <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-1 focus:ring-primary" />
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                       <label className="text-xs font-bold uppercase text-slate-500">Hết hạn</label>
                                       <input type="text" placeholder="MM/YY" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-1 focus:ring-primary" />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-xs font-bold uppercase text-slate-500">CVC</label>
                                       <input type="text" placeholder="123" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-1 focus:ring-primary" />
                                    </div>
                                 </div>
                              </div>
                           )}
                           {paymentMethod === 'momo' && (
                              <div className="text-center py-4">
                                 <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Quét mã QR bằng ứng dụng MoMo để thanh toán</p>
                                 <div className="size-40 bg-white p-2 mx-auto rounded-lg mb-2">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=momo_payment" alt="MoMo QR" className="w-full h-full" />
                                 </div>
                              </div>
                           )}
                           {paymentMethod === 'qr' && (
                              <div className="text-center py-4">
                                 <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Quét mã VietQR bằng ứng dụng ngân hàng</p>
                                 <div className="size-40 bg-white p-2 mx-auto rounded-lg mb-2">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bank_transfer" alt="Bank QR" className="w-full h-full" />
                                 </div>
                                 <p className="text-xs font-mono bg-white dark:bg-dark-card inline-block px-3 py-1 rounded border border-gray-200 dark:border-dark-border mt-2">Nội dung: EDU ORDER 12345</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Order Summary */}
                  <div className="lg:col-span-1">
                     <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm sticky top-24">
                        <h3 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h3>

                        {course && (
                           <div className="flex gap-4 mb-6">
                              <div className="size-20 rounded-lg bg-cover bg-center flex-shrink-0 bg-gray-100" style={{ backgroundImage: `url(${course.thumbnail})` }}></div>
                              <div>
                                 <h4 className="font-bold text-sm line-clamp-2 mb-1">{course.title}</h4>
                                 <p className="text-xs text-slate-500">{course.instructor}</p>
                              </div>
                           </div>
                        )}

                        {course && (
                           <>
                              <div className="space-y-3 py-4 border-y border-gray-100 dark:border-dark-border">
                                 <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Giá gốc</span>
                                    <span className="text-slate-400 line-through">{course.originalPrice.toLocaleString('vi-VN')}đ</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Giá khuyến mãi</span>
                                    <span className="font-medium">{course.price.toLocaleString('vi-VN')}đ</span>
                                 </div>
                                 <div className="flex justify-between text-sm text-green-500">
                                    <span>Giảm giá</span>
                                    <span>-50%</span>
                                 </div>
                              </div>

                              <div className="flex justify-between items-center py-4 mb-4">
                                 <span className="font-bold text-lg">Tổng cộng</span>
                                 <span className="font-bold text-2xl text-primary">{course.price.toLocaleString('vi-VN')}đ</span>
                              </div>
                           </>
                        )}

                        <div className="space-y-3">
                           <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all">
                              Thanh toán ngay
                           </button>
                           <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-2">
                              <ShieldCheck size={14} /> Thanh toán an toàn & bảo mật
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
};

export default Checkout;

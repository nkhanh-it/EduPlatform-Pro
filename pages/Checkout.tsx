import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, Wallet, ShieldCheck, ArrowLeft, QrCode } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Course, User } from '../types';
import { checkout, getCourses, getMe, getSelectedCourseId } from '../api';
import { showAlert } from '../components/dialogs/DialogProvider';

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | 'qr'>('card');
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const me = await getMe();
        setUser(me as User);
      } catch {
        setUser(null);
      }

      try {
        const data = await getCourses('All', '');
        const list = data as Course[];
        const selectedId = getSelectedCourseId();
        const selected = list.find((c) => c.id === selectedId) || list[0] || null;
        setCourse(selected);
      } catch {
        setCourse(null);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setFormErrors({});
    setError('');
  }, [paymentMethod]);

  const discountPercent = useMemo(() => {
    if (!course?.originalPrice || !course?.price || Number(course.originalPrice) <= 0) return 0;
    const discount = 100 - Math.round((Number(course.price) / Number(course.originalPrice)) * 100);
    return Math.max(discount, 0);
  }, [course]);

  const validatePaymentForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!course) nextErrors.course = 'Đã xảy ra lỗi, vui lòng thử lại.';
    if (!user) nextErrors.user = 'Đã xảy ra lỗi, vui lòng thử lại.';

    if (paymentMethod === 'card') {
      const normalizedCardNumber = cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(normalizedCardNumber)) nextErrors.cardNumber = 'Đã xảy ra lỗi, vui lòng thử lại.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.trim())) nextErrors.expiry = 'Đã xảy ra lỗi, vui lòng thử lại.';
      if (!/^\d{3,4}$/.test(cvc.trim())) nextErrors.cvc = 'Đã xảy ra lỗi, vui lòng thử lại.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validatePaymentForm() || !course) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const method = paymentMethod === 'card' ? 'CARD' : paymentMethod === 'momo' ? 'MOMO' : 'QR';
      const transaction = await checkout(course.id, method);
      const successMessage = 'Cập nhật thành công';
      setSuccess(successMessage);
      await showAlert({
        title: 'Thanh toán thành công',
        message: `Mã giao dịch: ${transaction.id}\nKhóa học: ${course.title}\nPhương thức: ${method}`,
        tone: 'success',
      });
      onNavigate('student-courses');
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="student" activePage="courses" onNavigate={onNavigate} />

      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/90 md:px-10">
          <button onClick={() => onNavigate('courses')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Thanh toán khóa học</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                <h2 className="text-lg font-bold mb-4">Thông tin đăng ký</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Họ và tên</label>
                    <input type="text" className="w-full rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border px-4 py-2.5 text-sm" value={user?.fullName || ''} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                    <input type="email" className="w-full rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border px-4 py-2.5 text-sm" value={user?.email || ''} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Số điện thoại</label>
                    <input type="tel" className="w-full rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border px-4 py-2.5 text-sm" value={user?.phone || ''} readOnly />
                  </div>
                </div>
                {formErrors.user && <p className="mt-3 text-sm text-red-500">{formErrors.user}</p>}
              </div>

              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                <h2 className="text-lg font-bold mb-4">Phương thức thanh toán</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div onClick={() => setPaymentMethod('card')} className={`cursor-pointer rounded-xl p-4 border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 dark:border-dark-border hover:border-gray-300'}`}>
                    <CreditCard size={32} />
                    <span className="text-sm font-bold">Thẻ quốc tế</span>
                  </div>
                  <div onClick={() => setPaymentMethod('momo')} className={`cursor-pointer rounded-xl p-4 border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'momo' ? 'border-[#a50064] bg-[#a50064]/5 text-[#a50064]' : 'border-gray-100 dark:border-dark-border hover:border-gray-300'}`}>
                    <Wallet size={32} />
                    <span className="text-sm font-bold">Ví MoMo</span>
                  </div>
                  <div onClick={() => setPaymentMethod('qr')} className={`cursor-pointer rounded-xl p-4 border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'qr' ? 'border-green-500 bg-green-500/5 text-green-500' : 'border-gray-100 dark:border-dark-border hover:border-gray-300'}`}>
                    <QrCode size={32} />
                    <span className="text-sm font-bold">Chuyển khoản QR</span>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-dark-border dark:bg-dark-bg">
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Số thẻ</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input type="text" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        {formErrors.cardNumber && <p className="text-sm text-red-500">{formErrors.cardNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Hết hạn</label>
                          <input type="text" value={expiry} onChange={(event) => setExpiry(event.target.value)} placeholder="MM/YY" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-1 focus:ring-primary" />
                          {formErrors.expiry && <p className="text-sm text-red-500">{formErrors.expiry}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">CVC</label>
                          <input type="text" value={cvc} onChange={(event) => setCvc(event.target.value)} placeholder="123" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-1 focus:ring-primary" />
                          {formErrors.cvc && <p className="text-sm text-red-500">{formErrors.cvc}</p>}
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

            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm sticky top-24">
                <h3 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h3>

                <div className="flex gap-4 mb-6">
                  <div className="size-20 rounded-lg bg-cover bg-center flex-shrink-0 bg-gray-100" style={{ backgroundImage: `url(${course?.thumbnail || 'https://picsum.photos/seed/course/800/450'})` }}></div>
                  <div>
                    <h4 className="font-bold text-sm line-clamp-2 mb-1">{course?.title || 'Khóa học'}</h4>
                    <p className="text-xs text-slate-500">{course?.instructor || 'Giảng viên'}</p>
                  </div>
                </div>

                <div className="space-y-3 py-4 border-y border-gray-100 dark:border-dark-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Giá gốc</span>
                    <span className="text-slate-400 line-through">{course?.originalPrice ? Number(course.originalPrice).toLocaleString('vi-VN') : ''}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Giá khuyến mãi</span>
                    <span className="font-medium">{course?.price ? Number(course.price).toLocaleString('vi-VN') : '0'}đ</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Giảm giá</span>
                    <span>-{discountPercent}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-4 mb-4">
                  <span className="font-bold text-lg">Tổng cộng</span>
                  <span className="font-bold text-2xl text-primary">{course?.price ? Number(course.price).toLocaleString('vi-VN') : '0'}đ</span>
                </div>

                {formErrors.course && <p className="text-sm text-red-500 mb-3">{formErrors.course}</p>}
                {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
                {success && <p className="text-sm text-green-600 mb-3">{success}</p>}

                <div className="space-y-3">
                  <button onClick={handleCheckout} disabled={loading || !course} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all disabled:opacity-60">
                    {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
                  </button>
                  <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-2">
                    <ShieldCheck size={14} /> Thanh toán an toàn và bảo mật
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

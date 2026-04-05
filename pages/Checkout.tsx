import React, { useEffect, useMemo, useState } from 'react';
<<<<<<< Updated upstream
import { CreditCard, Wallet, ShieldCheck, ArrowLeft, QrCode } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Course, User } from '../types';
import { checkout, getCourses, getMe, getSelectedCourseId } from '../api';
import { showAlert } from '../components/dialogs/DialogProvider';
=======
import {
  AlertTriangle,
  ArrowLeft,
  BadgePercent,
  CheckCircle2,
  ChevronRight,
  CircleOff,
  CreditCard,
  QrCode,
  Receipt,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { checkout, getCourses, getMe, getSelectedCourseId, getTransaction, type TransactionDto } from '../api';
import { Course, User } from '../types';
>>>>>>> Stashed changes

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

const formatCurrency = (value?: number | null) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
<<<<<<< Updated upstream
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | 'qr'>('card');
=======
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>('card');
>>>>>>> Stashed changes
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
<<<<<<< Updated upstream
  const [success, setSuccess] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
=======
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'failed' | null;
    transaction: TransactionDto | null;
  }>({
    status: null,
    transaction: null,
  });
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
        const selected = list.find((c) => c.id === selectedId) || list[0] || null;
=======
        const selected = list.find((item) => item.id === selectedId) || list[0] || null;
>>>>>>> Stashed changes
        setCourse(selected);
      } catch {
        setCourse(null);
      }
    };
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    load();
  }, []);

  useEffect(() => {
<<<<<<< Updated upstream
    setFormErrors({});
    setError('');
  }, [paymentMethod]);
=======
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('paymentStatus');
    const transactionId = params.get('transactionId');

    if (!paymentStatus) {
      return;
    }

    if (!transactionId) {
      setPaymentResult({
        status: paymentStatus === 'success' ? 'success' : 'failed',
        transaction: null,
      });
      return;
    }

    getTransaction(transactionId)
      .then((transaction) => {
        setPaymentResult({
          status: paymentStatus === 'success' ? 'success' : 'failed',
          transaction,
        });
      })
      .catch(() => {
        setPaymentResult({
          status: paymentStatus === 'success' ? 'success' : 'failed',
          transaction: null,
        });
      });
  }, []);
>>>>>>> Stashed changes

  const discountPercent = useMemo(() => {
    if (!course?.originalPrice || !course?.price || Number(course.originalPrice) <= 0) return 0;
    const discount = 100 - Math.round((Number(course.price) / Number(course.originalPrice)) * 100);
    return Math.max(discount, 0);
  }, [course]);

<<<<<<< Updated upstream
=======
  const savings = useMemo(() => {
    if (!course?.originalPrice || !course?.price) return 0;
    return Math.max(Number(course.originalPrice) - Number(course.price), 0);
  }, [course]);

  const isPaymentSuccessful = paymentResult.status === 'success' || paymentResult.transaction?.status === 'SUCCESS';
  const isPaymentFailed = paymentResult.status === 'failed' || paymentResult.transaction?.status === 'FAILED';

  const methodContent = useMemo(() => {
    if (paymentMethod === 'qr') {
      return {
        title: 'Thanh toán bằng VNPAY QR',
        summary: 'Quét mã bằng ứng dụng ngân hàng hoặc ví điện tử có hỗ trợ VNPAY-QR.',
        accent: 'border-green-400/40 bg-green-500/10 text-green-300',
        icon: <QrCode size={22} />,
        steps: [
          'Hệ thống tạo giao dịch và chuyển sang cổng VNPAY.',
          'Bạn chọn phương thức QR và quét mã trong trang thanh toán.',
          'Khi VNPAY xác nhận thành công, khóa học mới được mở.',
        ],
      };
    }

    return {
      title: 'Thanh toán bằng thẻ hoặc ATM',
      summary: 'Dùng thẻ quốc tế hoặc thẻ ATM nội địa ngay trên cổng thanh toán VNPAY.',
      accent: 'border-sky-400/40 bg-sky-500/10 text-sky-300',
      icon: <CreditCard size={22} />,
      steps: [
        'Hệ thống tạo giao dịch và chuyển sang cổng VNPAY.',
        'Bạn chọn ngân hàng hoặc loại thẻ phù hợp trên trang VNPAY.',
        'Sau khi giao dịch được xác thực, hệ thống mới cấp quyền học.',
      ],
    };
  }, [paymentMethod]);

>>>>>>> Stashed changes
  const validatePaymentForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!course) nextErrors.course = 'Đã xảy ra lỗi, vui lòng thử lại.';
    if (!user) nextErrors.user = 'Đã xảy ra lỗi, vui lòng thử lại.';
<<<<<<< Updated upstream

    if (paymentMethod === 'card') {
      const normalizedCardNumber = cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(normalizedCardNumber)) nextErrors.cardNumber = 'Đã xảy ra lỗi, vui lòng thử lại.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.trim())) nextErrors.expiry = 'Đã xảy ra lỗi, vui lòng thử lại.';
      if (!/^\d{3,4}$/.test(cvc.trim())) nextErrors.cvc = 'Đã xảy ra lỗi, vui lòng thử lại.';
    }

=======
>>>>>>> Stashed changes
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCheckout = async () => {
<<<<<<< Updated upstream
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
=======
    if (!validatePaymentForm() || !course || isPaymentSuccessful) return;
    setLoading(true);
    setError('');

    try {
      const method = paymentMethod === 'card' ? 'CARD' : 'QR';
      const session = await checkout(course.id, method);
      if (!session.paymentUrl) {
        throw new Error('Không lấy được đường dẫn thanh toán.');
      }
      window.location.href = session.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi, vui lòng thử lại.');
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="student" activePage="courses" onNavigate={onNavigate} />

<<<<<<< Updated upstream
      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/90 md:px-10">
          <button onClick={() => onNavigate('courses')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border text-slate-500">
=======
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/90 md:px-10">
          <button onClick={() => onNavigate('courses')} className="-ml-2 rounded-full p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-dark-border">
>>>>>>> Stashed changes
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Thanh toán khóa học</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
<<<<<<< Updated upstream
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
=======
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.3fr,0.7fr]">
            <div className="space-y-8">
              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <UserRound size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Thông tin người học</h2>
                    <p className="mt-1 text-sm text-slate-500">Thông tin này sẽ được dùng cho giao dịch và khóa học sau khi thanh toán hoàn tất.</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Họ và tên</label>
                    <input type="text" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-border dark:bg-dark-bg" value={user?.fullName || ''} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                    <input type="email" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-border dark:bg-dark-bg" value={user?.email || ''} readOnly />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Số điện thoại</label>
                    <input type="tel" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-border dark:bg-dark-bg" value={user?.phone || ''} readOnly />
                  </div>
                </div>
                {formErrors.user && <p className="mt-3 text-sm text-red-500">{formErrors.user}</p>}
              </section>

              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                    <Receipt size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Phương thức thanh toán</h2>
                    <p className="mt-1 text-sm text-slate-500">Chọn kênh thanh toán trên VNPAY. App không xử lý thông tin thẻ trực tiếp.</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    disabled={isPaymentSuccessful}
                    className={`rounded-2xl border p-4 text-left transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/8 shadow-[0_0_0_1px_rgba(37,99,235,0.15)]' : 'border-gray-200 hover:border-gray-300 dark:border-dark-border'} ${isPaymentSuccessful ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <CreditCard size={26} className={paymentMethod === 'card' ? 'text-primary' : 'text-slate-500'} />
                    <p className="mt-3 text-sm font-bold">Thẻ và ATM</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Visa, MasterCard, JCB, ATM nội địa qua VNPAY</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    disabled={isPaymentSuccessful}
                    className={`rounded-2xl border p-4 text-left transition-all ${paymentMethod === 'qr' ? 'border-emerald-400 bg-emerald-500/8 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]' : 'border-gray-200 hover:border-gray-300 dark:border-dark-border'} ${isPaymentSuccessful ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <QrCode size={26} className={paymentMethod === 'qr' ? 'text-emerald-500' : 'text-slate-500'} />
                    <p className="mt-3 text-sm font-bold">VNPAY QR</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Quét mã bằng ứng dụng ngân hàng hoặc ví điện tử hỗ trợ</p>
                  </button>

                  <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-slate-400 dark:border-dark-border">
                    <CircleOff size={26} />
                    <p className="mt-3 text-sm font-bold">MoMo</p>
                    <p className="mt-1 text-xs">Chưa kết nối cổng MoMo riêng nên chưa mở cho thanh toán.</p>
                  </div>
                </div>

                <div className={`mt-6 rounded-3xl border p-5 ${methodContent.accent}`}>
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      {methodContent.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{methodContent.title}</h3>
                      <p className="mt-1 text-sm text-slate-200/80 dark:text-slate-200/80">{methodContent.summary}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {methodContent.steps.map((step, index) => (
                      <div key={step} className="rounded-2xl border border-white/10 bg-slate-950/10 px-4 py-4 dark:bg-white/5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/70">Bước {index + 1}</p>
                        <p className="mt-2 text-sm leading-6 text-white">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-start gap-4">
                  <div className="size-20 rounded-2xl bg-cover bg-center bg-gray-100" style={{ backgroundImage: `url(${course?.thumbnail || 'https://picsum.photos/seed/course/800/450'})` }} />
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-lg font-bold">{course?.title || 'Khóa học'}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course?.instructor || 'Giảng viên'}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-gray-50 p-4 dark:bg-dark-bg">
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <BadgePercent size={16} /> Ưu đãi hiện tại
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Bạn đang được giảm {discountPercent}% cho khóa học này.</p>
                </div>

                <div className="mt-6 space-y-3 border-y border-gray-100 py-4 dark:border-dark-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Giá gốc</span>
                    <span className="text-slate-400 line-through">{formatCurrency(course?.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Giá ưu đãi</span>
                    <span className="font-medium">{formatCurrency(course?.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Tiết kiệm</span>
                    <span>{formatCurrency(savings)}</span>
                  </div>
                </div>

                <div className="mb-5 flex items-center justify-between py-4">
                  <span className="text-lg font-bold">Tổng cộng</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(course?.price)}</span>
                </div>

                {paymentResult.status && (
                  <div className={`mb-5 rounded-3xl border px-4 py-4 ${isPaymentSuccessful ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200'}`}>
                    <div className="flex items-start gap-3">
                      {isPaymentSuccessful ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertTriangle size={20} className="mt-0.5 shrink-0" />}
                      <div className="text-sm">
                        <p className="font-semibold">{isPaymentSuccessful ? 'Thanh toán thành công' : 'Thanh toán chưa thành công'}</p>
                        <p className="mt-1">
                          {paymentResult.transaction ? `Mã giao dịch: ${paymentResult.transaction.externalRef || paymentResult.transaction.id}` : 'Không tải được chi tiết giao dịch.'}
                        </p>
                        {paymentResult.transaction?.status && <p className="mt-1">Trạng thái trên hệ thống: {paymentResult.transaction.status}</p>}
                        {isPaymentFailed && <p className="mt-1">Bạn có thể thử lại bằng cùng phương thức hoặc đổi sang kênh thanh toán khác.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {formErrors.course && <p className="mb-3 text-sm text-red-500">{formErrors.course}</p>}
                {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

                <div className="space-y-3">
                  {isPaymentSuccessful ? (
                    <>
                      <button onClick={() => onNavigate('student-courses')} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600">
                        Vào khóa học của tôi
                        <ChevronRight size={16} />
                      </button>
                      <button onClick={() => onNavigate('courses')} className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-50 dark:border-dark-border dark:bg-dark-card dark:text-slate-200 dark:hover:bg-dark-border">
                        Khám phá thêm khóa học
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleCheckout} disabled={loading || !course} className="w-full rounded-2xl bg-primary py-3.5 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover disabled:opacity-60">
                        {loading ? 'Đang chuyển sang VNPAY...' : isPaymentFailed ? 'Thanh toán lại' : 'Thanh toán ngay'}
                      </button>
                      <button onClick={() => onNavigate('student-courses')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-50 dark:border-dark-border dark:bg-dark-card dark:text-slate-200 dark:hover:bg-dark-border">
                        {isPaymentFailed ? 'Quay lại khóa học của tôi' : 'Xem khóa học của tôi'}
                        {isPaymentFailed && <RotateCcw size={16} />}
                      </button>
                    </>
                  )}

                  <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                    <ShieldCheck size={14} /> Thanh toán được xử lý trên cổng VNPAY
                  </p>
                </div>
              </div>
            </aside>
>>>>>>> Stashed changes
          </div>
        </main>
      </div>
    </div>
  );
};

export default Checkout;

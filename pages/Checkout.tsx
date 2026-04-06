import React, { useEffect, useMemo, useState } from 'react';
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

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

const formatCurrency = (value?: number | null) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>('card');
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'failed' | null;
    transaction: TransactionDto | null;
  }>({
    status: null,
    transaction: null,
  });

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
        const selected = list.find((item) => item.id === selectedId) || list[0] || null;
        setCourse(selected);
      } catch {
        setCourse(null);
      }
    };

    load();
  }, []);

  useEffect(() => {
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

  const discountPercent = useMemo(() => {
    if (!course?.originalPrice || !course?.price || Number(course.originalPrice) <= 0) return 0;
    const discount = 100 - Math.round((Number(course.price) / Number(course.originalPrice)) * 100);
    return Math.max(discount, 0);
  }, [course]);

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

  const validatePaymentForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!course) nextErrors.course = 'Đã xảy ra lỗi, vui lòng thử lại.';
    if (!user) nextErrors.user = 'Đã xảy ra lỗi, vui lòng thử lại.';
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCheckout = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="student" activePage="courses" onNavigate={onNavigate} />

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/90 md:px-10">
          <button onClick={() => onNavigate('courses')} className="-ml-2 rounded-full p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-dark-border">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Thanh toán khóa học</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Checkout;

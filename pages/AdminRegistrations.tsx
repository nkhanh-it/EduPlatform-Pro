import React, { useEffect, useMemo, useState } from 'react';
import { Search, Bell, Filter, CheckCircle, XCircle, Download } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ControlSelect from '../components/filters/ControlSelect';
import { adminApproveRegistration, adminGetRegistrations, adminRejectRegistration } from '../api';
import { showConfirm } from '../components/dialogs/DialogProvider';
import { showErrorToast, showInfoToast, showSuccessToast } from '../components/feedback/ToastProvider';

interface AdminRegistrationsProps {
  onNavigate: (page: string) => void;
}

const AdminRegistrations: React.FC<AdminRegistrationsProps> = ({ onNavigate }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [sortMode, setSortMode] = useState<'LATEST' | 'OLDEST' | 'STUDENT_ASC' | 'STUDENT_DESC'>('LATEST');
  const [error, setError] = useState('');

  const load = async (status?: string) => {
    try {
      const data = await adminGetRegistrations(status);
      setRegistrations(data as any[]);
      setStatusFilter(status);
      setError('');
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return registrations.filter(
      (item) =>
        !keyword ||
        [item.id, item.user?.fullName, item.user?.email, item.course?.title].some((value) =>
          String(value || '').toLowerCase().includes(keyword),
        ),
    );
  }, [registrations, search]);

  const sortedRegistrations = useMemo(() => {
    const list = [...filtered];
    switch (sortMode) {
      case 'OLDEST':
        list.sort((a, b) => new Date(a.enrolledAt || 0).getTime() - new Date(b.enrolledAt || 0).getTime());
        break;
      case 'STUDENT_ASC':
        list.sort((a, b) => String(a.user?.fullName || a.user?.name || '').localeCompare(String(b.user?.fullName || b.user?.name || ''), 'vi'));
        break;
      case 'STUDENT_DESC':
        list.sort((a, b) => String(b.user?.fullName || b.user?.name || '').localeCompare(String(a.user?.fullName || a.user?.name || ''), 'vi'));
        break;
      default:
        list.sort((a, b) => new Date(b.enrolledAt || 0).getTime() - new Date(a.enrolledAt || 0).getTime());
        break;
    }
    return list;
  }, [filtered, sortMode]);

  const approve = async (id: string) => {
    if (!(await showConfirm({ title: 'Duyệt đăng ký', message: 'Bạn có chắc chắn muốn duyệt đăng ký này?', confirmText: 'Duyệt', cancelText: 'Hủy' }))) return;
    try {
      await adminApproveRegistration(id);
      await load(statusFilter);
      setSelectedRegistration((current: any) => (current?.id === id ? { ...current, status: 'APPROVED' } : current));
      showSuccessToast('Cập nhật thành công');
    } catch {
      showErrorToast();
    }
  };

  const reject = async (id: string) => {
    if (!(await showConfirm({ title: 'Từ chối đăng ký', message: 'Bạn có chắc chắn muốn từ chối đăng ký này?', confirmText: 'Từ chối', cancelText: 'Hủy', tone: 'danger' }))) return;
    try {
      await adminRejectRegistration(id);
      await load(statusFilter);
      setSelectedRegistration((current: any) => (current?.id === id ? { ...current, status: 'REJECTED' } : current));
      showSuccessToast('Cập nhật thành công');
    } catch {
      showErrorToast();
    }
  };

  const exportCsv = () => {
    const rows = [['id', 'student', 'email', 'course', 'status'], ...filtered.map((r) => [r.id, r.user?.fullName || r.user?.name, r.user?.email, r.course?.title, r.status])];
    const csv = rows.map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPaidRegistration = (registration: any) => Number(registration?.course?.price || 0) > 0;

  const getStatusLabel = (registration: any) => {
    if (registration.status === 'REJECTED') return 'Đã từ chối';
    if (registration.status === 'APPROVED') {
      return isPaidRegistration(registration) ? 'Tự động sau thanh toán' : 'Đã duyệt';
    }
    return isPaidRegistration(registration) ? 'Dữ liệu chờ cũ' : 'Chờ duyệt';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="admin" activePage="admin-registrations" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/90 px-6 py-3 backdrop-blur-md dark:border-dark-border dark:bg-dark-card/90">
          <h2 className="text-lg font-bold">Quản lý đăng ký</h2>
          <button onClick={() => showInfoToast(`Hiện có ${registrations.filter((item) => item.status === 'PENDING').length} đơn chờ duyệt.`)} className="text-slate-500 hover:text-primary">
            <Bell size={20} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Đăng ký khóa học</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">Khóa học có phí sẽ tự ghi danh sau khi thanh toán thành công. Duyệt tay chỉ áp dụng cho khóa miễn phí.</p>
              </div>
              <button onClick={exportCsv} className="flex h-12 items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-bold hover:bg-gray-50 dark:border-dark-border dark:bg-dark-card dark:hover:bg-dark-border">
                <Download size={18} />
                Xuất dữ liệu
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-dark-border dark:bg-dark-bg" placeholder="Tìm kiếm mã đơn, học viên..." />
                </div>
                <div className="flex gap-2">
                  <ControlSelect
                    value={sortMode}
                    onChange={(value) => setSortMode(value as typeof sortMode)}
                    options={[
                      { value: 'LATEST', label: 'Mới nhất' },
                      { value: 'OLDEST', label: 'Cũ nhất' },
                      { value: 'STUDENT_ASC', label: 'Học viên A-Z' },
                      { value: 'STUDENT_DESC', label: 'Học viên Z-A' },
                    ]}
                  />
                  <button onClick={() => load()} className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium hover:border-primary dark:border-dark-border dark:bg-dark-bg"><Filter size={18} />Tất cả</button>
                  <button onClick={() => load('PENDING')} className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium hover:border-primary dark:border-dark-border dark:bg-dark-bg"><Filter size={18} />Chờ duyệt tay</button>
                  <button onClick={() => load('APPROVED')} className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium hover:border-primary dark:border-dark-border dark:bg-dark-bg"><Filter size={18} />Đã duyệt</button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-card dark:ring-dark-border">
                Trạng thái: {statusFilter || 'Tất cả'}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-card dark:ring-dark-border">
                Sắp xếp: {{
                  LATEST: 'Mới nhất',
                  OLDEST: 'Cũ nhất',
                  STUDENT_ASC: 'Học viên A-Z',
                  STUDENT_DESC: 'Học viên Z-A',
                }[sortMode]}
              </span>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-dark-bg">
                    <tr>
                      <th className="p-4">Mã đơn</th>
                      <th className="p-4">Học viên</th>
                      <th className="p-4">Khóa học</th>
                      <th className="p-4">Ngày tạo</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {sortedRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/30">
                        <td className="p-4 font-mono text-xs text-slate-500">{reg.id}</td>
                        <td className="p-4">
                          <p className="font-bold">{reg.user?.fullName || reg.user?.name}</p>
                          <p className="text-xs text-slate-500">{reg.user?.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{reg.course?.title}</p>
                          <p className="text-xs font-bold text-primary">{Number(reg.course?.price || 0).toLocaleString('vi-VN')}đ</p>
                        </td>
                        <td className="p-4 text-slate-500">{new Date(reg.enrolledAt).toLocaleDateString()}</td>
                        <td className="p-4">{getStatusLabel(reg)}</td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            {reg.status === 'PENDING' && !isPaidRegistration(reg) && (
                              <>
                                <button onClick={() => approve(reg.id)} className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"><CheckCircle size={18} /></button>
                                <button onClick={() => reject(reg.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><XCircle size={18} /></button>
                              </>
                            )}
                            <button onClick={() => setSelectedRegistration(reg)} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-white">
                              Chi tiết
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedRegistration && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 py-6">
          <button className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedRegistration(null)} aria-label="Đóng chi tiết đăng ký" />
          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-dark-border">
              <h3 className="text-2xl font-bold">Chi tiết đăng ký</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kiểm tra thông tin học viên, khóa học và trạng thái xử lý.</p>
            </div>
            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mã đơn</p>
                  <p className="mt-2 font-mono text-sm">{selectedRegistration.id}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Học viên</p>
                      <p className="mt-2 font-semibold">{selectedRegistration.user?.fullName || selectedRegistration.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                      <p className="mt-2 font-medium">{selectedRegistration.user?.email || 'Chưa có thông tin'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Khóa học</p>
                      <p className="mt-2 font-semibold">{selectedRegistration.course?.title}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Giá</p>
                      <p className="mt-2 font-semibold text-primary">{Number(selectedRegistration.course?.price || 0).toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
                  <h4 className="text-lg font-bold">Thông tin xử lý</h4>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ngày tạo</p>
                      <p className="mt-2 font-medium">{new Date(selectedRegistration.enrolledAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái</p>
                      <p className="mt-2 font-medium">
                        {getStatusLabel(selectedRegistration)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hành động nhanh</p>
                {selectedRegistration.status === 'PENDING' && !isPaidRegistration(selectedRegistration) ? (
                  <>
                    <button onClick={() => approve(selectedRegistration.id)} className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
                      Duyệt đăng ký
                    </button>
                    <button onClick={() => reject(selectedRegistration.id)} className="flex w-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
                      Từ chối đăng ký
                    </button>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-sm text-slate-500 dark:border-dark-border dark:bg-dark-card dark:text-slate-400">
                    {isPaidRegistration(selectedRegistration)
                      ? 'Khóa học có phí được mở tự động theo trạng thái thanh toán, không duyệt tay ở màn hình này.'
                      : 'Đơn đăng ký này đã được xử lý.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrations;

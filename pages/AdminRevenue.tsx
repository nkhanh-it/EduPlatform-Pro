import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Calendar, Download, TrendingUp, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import Sidebar from '../components/Sidebar';
import ControlSelect from '../components/filters/ControlSelect';
import { adminGetRevenuePoints, adminGetRevenueSummary, adminGetTransactions } from '../api';
import { showInfoToast, showSuccessToast } from '../components/feedback/ToastProvider';

interface AdminRevenueProps {
  onNavigate: (page: string) => void;
}

const getShortId = (value?: string) => (value ? value.replace(/-/g, '').slice(0, 8).toUpperCase() : 'N/A');

const AdminRevenue: React.FC<AdminRevenueProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<any | null>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [periodDays, setPeriodDays] = useState<30 | 90 | 365>(30);
  const [sortMode, setSortMode] = useState<'LATEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('LATEST');

  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    return transactions.filter((tx) => {
      const createdAt = new Date(tx.createdAt).getTime();
      return Number.isFinite(createdAt) && now - createdAt <= periodDays * 24 * 60 * 60 * 1000;
    });
  }, [transactions, periodDays]);

  const sortedTransactions = useMemo(() => {
    const list = [...filteredTransactions];
    switch (sortMode) {
      case 'OLDEST':
        list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case 'AMOUNT_DESC':
        list.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
        break;
      case 'AMOUNT_ASC':
        list.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0));
        break;
      default:
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }
    return list;
  }, [filteredTransactions, sortMode]);

  const filteredPoints = useMemo(() => (periodDays === 365 ? points : points.slice(-(periodDays === 30 ? 6 : 12))), [periodDays, points]);

  const handleExport = () => {
    const headers = ['id', 'customerName', 'courseTitle', 'amount', 'status', 'method', 'createdAt'];
    const rows = sortedTransactions.map((t) => [t.id, t.userFullName || t.userId, t.courseTitle, t.amount, t.status, t.method, t.createdAt]);
    const csv = [headers, ...rows].map((row) => row.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    showSuccessToast('Cập nhật thành công');
  };

  useEffect(() => {
    (async () => {
      const [summaryResult, pointsResult, transactionsResult] = await Promise.allSettled([
        adminGetRevenueSummary(),
        adminGetRevenuePoints(),
        adminGetTransactions(),
      ]);

      setSummary(summaryResult.status === 'fulfilled' ? summaryResult.value : null);
      setPoints(pointsResult.status === 'fulfilled' ? pointsResult.value : []);
      setTransactions(transactionsResult.status === 'fulfilled' ? transactionsResult.value : []);
    })();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="admin" activePage="admin-revenue" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/90 px-6 py-3 backdrop-blur-md dark:border-dark-border dark:bg-dark-card/90">
          <h2 className="text-lg font-bold">Tài chính và doanh thu</h2>
          <button onClick={() => showInfoToast(`Trong ${periodDays} ngày qua có ${filteredTransactions.length} giao dịch.`)} className="text-slate-500 hover:text-primary">
            <Bell size={20} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Báo cáo doanh thu</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">Tổng quan tình hình tài chính và dòng tiền.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPeriodDays((current) => (current === 30 ? 90 : current === 90 ? 365 : 30))} className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium hover:border-primary dark:border-dark-border dark:bg-dark-card">
                  <Calendar size={18} />
                  {periodDays === 30 ? '30 ngày' : periodDays === 90 ? '90 ngày' : '12 tháng'}
                </button>
                <ControlSelect
                  value={sortMode}
                  onChange={(value) => setSortMode(value as typeof sortMode)}
                  options={[
                    { value: 'LATEST', label: 'Mới nhất' },
                    { value: 'OLDEST', label: 'Cũ nhất' },
                    { value: 'AMOUNT_DESC', label: 'Tiền cao đến thấp' },
                    { value: 'AMOUNT_ASC', label: 'Tiền thấp đến cao' },
                  ]}
                  className="min-w-[190px]"
                />
                <button onClick={handleExport} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover">
                  <Download size={18} />
                  Xuất báo cáo
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-card dark:ring-dark-border">
                Khoảng thời gian: {periodDays === 30 ? '30 ngày' : periodDays === 90 ? '90 ngày' : '12 tháng'}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 dark:bg-dark-card dark:ring-dark-border">
                Sắp xếp: {{
                  LATEST: 'Mới nhất',
                  OLDEST: 'Cũ nhất',
                  AMOUNT_DESC: 'Tiền cao đến thấp',
                  AMOUNT_ASC: 'Tiền thấp đến cao',
                }[sortMode]}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-500/20">
                <p className="mb-1 font-medium text-blue-100">Tổng doanh thu</p>
                <h3 className="mb-4 text-3xl font-bold">{summary?.totalRevenue ? Number(summary.totalRevenue).toLocaleString('vi-VN') : 0} đ</h3>
                <div className="flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                  <TrendingUp size={16} />
                  <span>+15% so với tháng trước</span>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-xl bg-green-100 p-3 text-green-600 dark:bg-green-900/30">
                    <Wallet size={24} />
                  </div>
                  <span className="flex items-center rounded bg-green-50 px-2 py-0.5 text-sm font-bold text-green-500 dark:bg-green-900/10">
                    <ArrowUpRight size={16} /> +5.2%
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Giao dịch thành công</p>
                <h3 className="text-2xl font-bold">{summary?.successfulTransactions ?? 0}</h3>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-900/30">
                    <CreditCard size={24} />
                  </div>
                  <span className="flex items-center rounded bg-red-50 px-2 py-0.5 text-sm font-bold text-red-500 dark:bg-red-900/10">
                    <ArrowDownRight size={16} /> -1.2%
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Hoàn tiền / Hủy</p>
                <h3 className="text-2xl font-bold">{summary?.failedTransactions ?? 0}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <h3 className="mb-6 text-lg font-bold">Biểu đồ tăng trưởng</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredPoints}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d7ff2" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0d7ff2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#0d7ff2" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <h3 className="mb-6 text-lg font-bold">Nguồn doanh thu</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredPoints}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="revenue" fill="#0d7ff2" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-card">
              <div className="border-b border-gray-200 p-6 dark:border-dark-border">
                <h3 className="text-lg font-bold">Giao dịch gần đây</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-dark-bg">
                    <tr>
                      <th className="p-4">Mã GD</th>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Dịch vụ</th>
                      <th className="p-4">Ngày GD</th>
                      <th className="p-4">Số tiền</th>
                      <th className="p-4">Phương thức</th>
                      <th className="p-4 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {sortedTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/30">
                        <td className="p-4 font-mono text-xs text-slate-500">{getShortId(tx.id)}</td>
                        <td className="p-4 font-medium">{tx.userFullName || 'Đang cập nhật'}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{tx.courseTitle}</td>
                        <td className="p-4 text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td>
                        <td className="p-4 font-bold">{Number(tx.amount).toLocaleString('vi-VN')}đ</td>
                        <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">{tx.method}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => setSelectedTransaction(tx)} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-white">
                            Xem
                          </button>
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

      {selectedTransaction && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 py-6">
          <button className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedTransaction(null)} aria-label="Đóng chi tiết giao dịch" />
          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-dark-border">
              <h3 className="text-2xl font-bold">Chi tiết giao dịch</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kiểm tra thông tin thanh toán và trạng thái giao dịch.</p>
            </div>
            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mã giao dịch</p>
                  <p className="mt-2 font-mono text-sm">{getShortId(selectedTransaction.id)}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Khách hàng</p>
                      <p className="mt-2 font-semibold">{selectedTransaction.userFullName || 'Đang cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Khóa học</p>
                      <p className="mt-2 font-semibold">{selectedTransaction.courseTitle || 'Đang cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Số tiền</p>
                      <p className="mt-2 font-semibold text-primary">{Number(selectedTransaction.amount || 0).toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phương thức</p>
                      <p className="mt-2 font-semibold">{selectedTransaction.method || 'Đang cập nhật'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
                  <h4 className="text-lg font-bold">Trạng thái xử lý</h4>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ngày tạo</p>
                      <p className="mt-2 font-medium">{new Date(selectedTransaction.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái</p>
                      <p className="mt-2 font-medium">{selectedTransaction.status || 'Đang cập nhật'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-dark-border dark:bg-dark-bg">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ghi chú</p>
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-sm text-slate-500 dark:border-dark-border dark:bg-dark-card dark:text-slate-400">
                  Nếu phát sinh chênh lệch, hãy kiểm tra lại trạng thái giao dịch trước khi hỗ trợ người dùng.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRevenue;

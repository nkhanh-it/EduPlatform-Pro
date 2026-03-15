import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  Download,
  Plus,
  DollarSign,
  TrendingUp,
  Users,
  Award,
  PlayCircle,
  MoreVertical,
  Filter,
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import { adminGetRevenuePoints, adminGetRevenueSummary, adminGetTransactions } from '../api';
import { showAlert } from '../components/dialogs/DialogProvider';
import { showSuccessToast } from '../components/feedback/ToastProvider';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [revenuePoints, setRevenuePoints] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');

  const filteredTransactions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
      const matchesKeyword =
        !keyword ||
        String(tx.id || '').toLowerCase().includes(keyword) ||
        String(tx.userId || '').toLowerCase().includes(keyword) ||
        String(tx.courseTitle || '').toLowerCase().includes(keyword);
      return matchesStatus && matchesKeyword;
    });
  }, [transactions, search, statusFilter]);

  const handleExport = () => {
    const headers = ['id', 'userId', 'courseTitle', 'amount', 'status', 'method', 'createdAt'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.userId,
      t.courseTitle,
      t.amount,
      t.status,
      t.method,
      t.createdAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    showSuccessToast('Cập nhật thành công');
  };

  useEffect(() => {
    const load = async () => {
      try {
        const points = await adminGetRevenuePoints();
        setRevenuePoints(points as any[]);
      } catch {
        setRevenuePoints([]);
      }

      try {
        const sum = await adminGetRevenueSummary();
        setSummary(sum);
      } catch {
        setSummary(null);
      }

      try {
        const txs = await adminGetTransactions();
        setTransactions(txs as any[]);
      } catch {
        setTransactions([]);
      }
    };

    load();
  }, []);

  const statCards = [
    {
      label: 'Tổng doanh thu',
      value: summary?.totalRevenue ? `${Number(summary.totalRevenue).toLocaleString('vi-VN')}đ` : '0đ',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Học viên mới',
      value: '150',
      change: '+5.0%',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Tỷ lệ hoàn thành',
      value: '85%',
      change: '+2.1%',
      icon: Award,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Khóa học hoạt động',
      value: '12',
      change: '1 khóa',
      icon: PlayCircle,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f8] text-slate-900 dark:bg-[#101922] dark:text-white">
      <Sidebar role="admin" activePage="admin-dashboard" onNavigate={onNavigate} />

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-dark-border dark:bg-dark-card">
          <div className="max-w-md flex-1">
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                className="block w-full rounded-xl border-none bg-gray-100 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-border dark:text-white"
                placeholder="Tìm kiếm học viên, khóa học..."
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                showAlert({
                  title: 'Thông báo',
                  message: `Có ${transactions.filter((tx) => tx.status === 'FAILED').length} giao dịch thất bại cần xem lại.`,
                })
              }
              className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-gray-100 dark:hover:bg-dark-border"
            >
              <Bell size={20} />
              <span className="absolute right-2.5 top-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-card" />
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-gray-100 dark:hover:bg-dark-border"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-black tracking-tight">Tổng quan hệ thống</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">Xin chào Admin, đây là báo cáo hoạt động hôm nay.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-card dark:hover:bg-dark-border"
                >
                  <Download size={18} /> Xuất báo cáo
                </button>
                <button
                  onClick={() => onNavigate('admin-courses')}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-colors hover:bg-blue-600"
                >
                  <Plus size={18} /> Thêm mới
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((stat, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <h3 className="mt-1 text-2xl font-bold">{stat.value}</h3>
                    </div>
                    <div className={`rounded-lg p-2 ${stat.bg} ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-sm font-medium text-green-500">
                      <TrendingUp size={14} />
                      <span>{stat.change}</span>
                    </div>
                    <span className="text-xs text-slate-500">so với tháng trước</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Biểu đồ doanh thu</h3>
                    <p className="text-sm text-slate-500">Thống kê theo tháng</p>
                  </div>
                  <select className="cursor-pointer rounded-lg border-none bg-gray-100 px-3 py-1.5 text-sm focus:ring-0 dark:bg-dark-border">
                    <option>6 tháng qua</option>
                    <option>Năm nay</option>
                  </select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenuePoints}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d7ff2" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0d7ff2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1b2531', borderColor: '#283039', color: '#fff' }} itemStyle={{ color: '#0d7ff2' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#0d7ff2" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <h3 className="text-lg font-bold">Hoạt động</h3>
                {filteredTransactions.slice(0, 2).map((tx, idx) => (
                  <div key={tx.id || idx} className="flex items-start gap-4 border-b border-gray-100 pb-4 dark:border-dark-border">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900/30">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Thanh toán thành công</p>
                      <p className="text-xs text-slate-500">Giao dịch {tx.id} hoàn tất</p>
                      <p className="mt-1 text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-auto">
                  <button
                    onClick={() => onNavigate('admin-registrations')}
                    className="w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:border-primary hover:text-primary dark:border-gray-600"
                  >
                    Xem tất cả hoạt động
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card">
              <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-dark-border">
                <h3 className="text-lg font-bold">Giao dịch gần đây</h3>
                <button
                  onClick={() => setStatusFilter((current) => (current === 'ALL' ? 'SUCCESS' : current === 'SUCCESS' ? 'FAILED' : 'ALL'))}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-gray-700"
                >
                  <Filter size={16} />
                  {statusFilter === 'ALL' ? 'Tất cả' : statusFilter === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 dark:border-dark-border dark:bg-dark-border/30">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Mã GD</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Học viên</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Khóa học</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Số tiền</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {filteredTransactions.map((tx: any) => (
                      <tr key={tx.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-dark-border/30">
                        <td className="px-6 py-4 text-sm font-medium text-primary">{tx.id}</td>
                        <td className="px-6 py-4 text-sm">{tx.userId?.slice(0, 6)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{tx.courseTitle}</td>
                        <td className="px-6 py-4 text-sm font-bold">{Number(tx.amount).toLocaleString('vi-VN')}đ</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              tx.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {tx.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              showAlert({
                                title: 'Chi tiết giao dịch',
                                message:
                                  `Mã GD: ${tx.id}\n` +
                                  `User: ${tx.userId}\n` +
                                  `Khóa học: ${tx.courseTitle}\n` +
                                  `Số tiền: ${Number(tx.amount).toLocaleString('vi-VN')}đ\n` +
                                  `Phương thức: ${tx.method}\n` +
                                  `Trạng thái: ${tx.status}\n` +
                                  `Thời gian: ${new Date(tx.createdAt).toLocaleString()}`,
                              })
                            }
                            className="text-slate-400 hover:text-primary"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

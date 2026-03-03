import React from 'react';
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
  Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import { REVENUE_DATA } from '../constants';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
      <Sidebar role="admin" activePage="admin-dashboard" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border z-10">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                className="block w-full pl-10 pr-3 py-2 border-none rounded-xl bg-gray-100 dark:bg-dark-border text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all" 
                placeholder="Tìm kiếm học viên, khóa học..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-card"></span>
            </button>
            <button className="p-2 rounded-xl text-slate-500 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight">Tổng quan hệ thống</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Xin chào Admin, đây là báo cáo hoạt động hôm nay.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                  <Download size={18} /> Xuất báo cáo
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-lg shadow-primary/25 hover:bg-blue-600 transition-colors">
                  <Plus size={18} /> Thêm mới
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { label: 'Tổng doanh thu', value: '2.5 tỷ VNĐ', change: '+12.5%', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Học viên mới', value: '150', change: '+5.0%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Tỷ lệ hoàn thành', value: '85%', change: '+2.1%', icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { label: 'Khóa học hoạt động', value: '12', change: '1 khóa', icon: PlayCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border relative overflow-hidden group">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                         <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                      </div>
                      <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                         <stat.icon size={24} />
                      </div>
                   </div>
                   <div className="flex items-end justify-between">
                      <div className="flex items-center gap-1 text-sm font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                         <TrendingUp size={14} />
                         <span>{stat.change}</span>
                      </div>
                      <span className="text-xs text-slate-500">so với tháng trước</span>
                   </div>
                </div>
              ))}
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Revenue Chart */}
               <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                  <div className="flex justify-between items-center mb-6">
                     <div>
                        <h3 className="text-lg font-bold">Biểu đồ doanh thu</h3>
                        <p className="text-sm text-slate-500">Thống kê theo tháng (2023)</p>
                     </div>
                     <select className="bg-gray-100 dark:bg-dark-border border-none text-sm rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer">
                        <option>6 tháng qua</option>
                        <option>Năm nay</option>
                     </select>
                  </div>
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={REVENUE_DATA}>
                           <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#0d7ff2" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#0d7ff2" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#1b2531', borderColor: '#283039', color: '#fff' }}
                              itemStyle={{ color: '#0d7ff2' }}
                           />
                           <Area type="monotone" dataKey="revenue" stroke="#0d7ff2" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Recent Activity */}
               <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex flex-col gap-6">
                  <h3 className="text-lg font-bold">Hoạt động</h3>
                  <div className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-dark-border">
                     <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary flex-shrink-0">
                        <Users size={20} />
                     </div>
                     <div>
                        <p className="text-sm font-semibold">Nguyễn Văn A</p>
                        <p className="text-xs text-slate-500">Đăng ký khóa học <span className="text-primary">ReactJS Pro</span></p>
                        <p className="text-[10px] text-slate-400 mt-1">2 phút trước</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-dark-border">
                     <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 flex-shrink-0">
                        <DollarSign size={20} />
                     </div>
                     <div>
                        <p className="text-sm font-semibold">Thanh toán thành công</p>
                        <p className="text-xs text-slate-500">Giao dịch #ORD-8821 hoàn tất</p>
                        <p className="text-[10px] text-slate-400 mt-1">15 phút trước</p>
                     </div>
                  </div>
                  <div className="mt-auto">
                     <button 
                       onClick={() => onNavigate('admin-registrations')}
                       className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-gray-600 text-slate-500 hover:text-primary hover:border-primary transition-colors text-sm font-medium"
                     >
                        Xem tất cả hoạt động
                     </button>
                  </div>
               </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
               <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
                  <h3 className="text-lg font-bold">Giao dịch gần đây</h3>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-border rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                     <Filter size={16} /> Lọc
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50 dark:bg-dark-border/30 border-b border-gray-100 dark:border-dark-border">
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã GD</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Học viên</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Khóa học</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Số tiền</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                           <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                        {[1, 2, 3, 4].map((item) => (
                           <tr key={item} className="hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-primary">#TRX-992{item}</td>
                              <td className="px-6 py-4 text-sm">Nguyễn Văn A</td>
                              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">UX/UI Design</td>
                              <td className="px-6 py-4 text-sm font-bold">2.500.000 đ</td>
                              <td className="px-6 py-4 text-center">
                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Thành công
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="text-slate-400 hover:text-primary"><MoreVertical size={18} /></button>
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

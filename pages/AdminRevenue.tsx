import React from 'react';
import { 
  Bell, 
  Calendar, 
  Download,
  TrendingUp,
  DollarSign,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import Sidebar from '../components/Sidebar';
import { REVENUE_DATA } from '../constants';

interface AdminRevenueProps {
  onNavigate: (page: string) => void;
}

const AdminRevenue: React.FC<AdminRevenueProps> = ({ onNavigate }) => {
  return (
    <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
      <Sidebar role="admin" activePage="admin-revenue" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-dark-border bg-white/90 dark:bg-dark-card/90 backdrop-blur-md px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold leading-tight">Tài chính & Doanh thu</h2>
          </div>
          <div className="flex flex-1 justify-end gap-6 items-center">
            <button className="relative text-slate-500 hover:text-primary transition-colors">
               <Bell size={20} />
            </button>
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">Admin User</p>
                  <p className="text-xs text-slate-500 mt-1">Quản trị viên</p>
               </div>
               <div className="size-10 rounded-full bg-cover bg-center border-2 border-gray-200 dark:border-dark-border" style={{ backgroundImage: 'url(https://picsum.photos/seed/admin/100/100)' }}></div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
           <div className="w-full max-w-[1200px] flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Báo Cáo Doanh Thu</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Tổng quan tình hình tài chính và dòng tiền.</p>
                 </div>
                 <div className="flex gap-2">
                    <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border font-medium text-sm hover:border-primary transition-colors">
                       <Calendar size={18} />
                       <span>Tháng này</span>
                    </button>
                    <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-white font-medium text-sm shadow hover:bg-primary-hover transition-colors">
                       <Download size={18} />
                       <span>Xuất báo cáo</span>
                    </button>
                 </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                     <p className="text-blue-100 font-medium mb-1">Tổng doanh thu</p>
                     <h3 className="text-3xl font-bold mb-4">125.500.000 đ</h3>
                     <div className="flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                        <TrendingUp size={16} />
                        <span>+15% so với tháng trước</span>
                     </div>
                  </div>
                  <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                           <Wallet size={24} />
                        </div>
                        <span className="flex items-center text-green-500 text-sm font-bold bg-green-50 dark:bg-green-900/10 px-2 py-0.5 rounded"><ArrowUpRight size={16} /> +5.2%</span>
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm">Giao dịch thành công</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white">1,240</h3>
                  </div>
                  <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl">
                           <CreditCard size={24} />
                        </div>
                        <span className="flex items-center text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/10 px-2 py-0.5 rounded"><ArrowDownRight size={16} /> -1.2%</span>
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm">Hoàn tiền / Hủy</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white">12</h3>
                  </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Area Chart */}
                 <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Biểu đồ tăng trưởng</h3>
                    <div className="h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={REVENUE_DATA}>
                             <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#0d7ff2" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#0d7ff2" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                             <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                             <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                             <Area type="monotone" dataKey="revenue" stroke="#0d7ff2" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 {/* Bar Chart */}
                 <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Nguồn doanh thu</h3>
                    <div className="h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                             { name: 'Khóa lẻ', val: 65 },
                             { name: 'Combo', val: 40 },
                             { name: 'Pro', val: 85 },
                             { name: 'Ent', val: 20 },
                          ]}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                             <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                             <Bar dataKey="val" fill="#0d7ff2" radius={[6, 6, 0, 0]} barSize={40} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                 <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                    <h3 className="font-bold text-lg">Giao dịch gần đây</h3>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                          <tr>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Mã GD</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Khách hàng</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Dịch vụ</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày GD</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Số tiền</th>
                             <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Phương thức</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-sm">
                          {[1, 2, 3, 4, 5].map((i) => (
                             <tr key={i} className="hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                                <td className="p-4 font-mono text-xs text-slate-500">#TRX-882{i}</td>
                                <td className="p-4 font-medium">Nguyễn Văn {String.fromCharCode(65+i)}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">Khóa học ReactJS Pro</td>
                                <td className="p-4 text-slate-500">24/10/2023, 10:30</td>
                                <td className="p-4 font-bold text-slate-900 dark:text-white">{(500000 * i).toLocaleString('vi-VN')}đ</td>
                                <td className="p-4 text-right">
                                   <div className="flex items-center justify-end gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                      <CreditCard size={14} /> Visa **** 4242
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
    </div>
  );
};

export default AdminRevenue;

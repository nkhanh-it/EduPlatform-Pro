import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Save,
    X,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    Shield,
    User as UserIcon,
    Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface StudentProfileProps {
    studentId: string;
    mode: 'view' | 'edit';
    onNavigate: (page: string) => void;
}

interface StudentData {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: string;
    status: string;
    joinDate: string;
    coursesEnrolled: number;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, mode, onNavigate }) => {
    const { user: adminUser } = useAuth();
    const [student, setStudent] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, 'users', studentId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const createdAt = data.createdAt?.toDate?.() || (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null);
                    const studentData: StudentData = {
                        id: docSnap.id,
                        name: data.name || 'Unknown',
                        email: data.email || '',
                        phone: data.phone || '',
                        avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'U')}&background=6366f1&color=fff`,
                        role: data.role || 'student',
                        status: data.status || 'active',
                        joinDate: createdAt ? createdAt.toLocaleDateString('vi-VN') : 'Mới đây',
                        coursesEnrolled: data.coursesEnrolled || 0,
                    };
                    setStudent(studentData);
                    setFormData({ name: studentData.name, email: studentData.email, phone: studentData.phone });
                }
            } catch (error) {
                console.error('Error fetching student:', error);
                showToast('Không thể tải thông tin học viên', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [studentId]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        if (!student) return;
        try {
            setSaving(true);
            await updateDoc(doc(db, 'users', student.id), {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            });
            showToast('Cập nhật thông tin học viên thành công!', 'success');
            setTimeout(() => onNavigate('admin-students'), 1200);
        } catch (error: any) {
            console.error('Error updating student:', error);
            showToast('Cập nhật thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const statusBadge = (status: string) => {
        const styles = status === 'active'
            ? 'bg-green-500/10 text-green-600 border-green-500/20'
            : status === 'locked'
                ? 'bg-red-500/10 text-red-600 border-red-500/20'
                : 'bg-slate-500/10 text-slate-600 border-slate-500/20';
        const label = status === 'active' ? 'Hoạt động' : status === 'locked' ? 'Đã khóa' : 'Chưa xác thực';
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles}`}>
                <div className="size-1.5 rounded-full bg-current"></div>
                {label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
                <Sidebar role="admin" activePage="admin-students" onNavigate={onNavigate} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="size-8 animate-spin text-primary" />
                        <p className="text-slate-500">Đang tải thông tin...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
                <Sidebar role="admin" activePage="admin-students" onNavigate={onNavigate} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl font-bold mb-2">Không tìm thấy học viên</p>
                        <button onClick={() => onNavigate('admin-students')} className="text-primary hover:underline">← Quay lại danh sách</button>
                    </div>
                </div>
            </div>
        );
    }

    const avatarUrl = student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6366f1&color=fff`;

    return (
        <div className="flex h-screen bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-white overflow-hidden">
            <Sidebar role="admin" activePage="admin-students" onNavigate={onNavigate} />

            <div className="flex-1 h-screen overflow-y-auto">
                {/* Header */}
                <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-dark-border bg-white/90 dark:bg-dark-card/90 backdrop-blur-md px-6 py-3">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold leading-tight">Admin Portal</h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-6 items-center">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-none">{adminUser?.name || 'Admin'}</p>
                                <p className="text-xs text-slate-500 mt-1">Quản trị viên</p>
                            </div>
                            <div className="size-10 rounded-full bg-cover bg-center border-2 border-gray-200 dark:border-dark-border" style={{ backgroundImage: 'url(https://picsum.photos/seed/admin/100/100)' }}></div>
                        </div>
                    </div>
                </header>

                <div className="flex justify-center py-8 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-[900px] flex flex-col gap-6">
                        {/* Back button */}
                        <button onClick={() => onNavigate('admin-students')} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium w-fit">
                            <ArrowLeft size={18} />
                            <span>Quay lại danh sách</span>
                        </button>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {mode === 'view' ? 'Thông Tin Học Viên' : 'Chỉnh Sửa Học Viên'}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    {mode === 'view' ? 'Xem chi tiết thông tin học viên.' : 'Cập nhật thông tin học viên.'}
                                </p>
                            </div>
                            {mode === 'view' && statusBadge(student.status)}
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden">
                            {/* Banner */}
                            <div className="h-32 bg-gradient-to-r from-primary via-blue-500 to-indigo-600 relative">
                                <div className="absolute -bottom-12 left-8">
                                    <div className="size-24 rounded-2xl bg-cover bg-center border-4 border-white dark:border-dark-card shadow-lg" style={{ backgroundImage: `url(${avatarUrl})` }}></div>
                                </div>
                            </div>

                            <div className="pt-16 pb-8 px-8">
                                {mode === 'view' ? (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold">{student.name}</h2>
                                            <p className="text-slate-500 text-sm mt-0.5">ID: {student.id}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                                                <div className="flex items-center justify-center size-10 rounded-lg bg-blue-500/10 text-blue-500"><Mail size={20} /></div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Email</p>
                                                    <p className="text-sm font-semibold">{student.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                                                <div className="flex items-center justify-center size-10 rounded-lg bg-green-500/10 text-green-500"><Phone size={20} /></div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Số điện thoại</p>
                                                    <p className="text-sm font-semibold">{student.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                                                <div className="flex items-center justify-center size-10 rounded-lg bg-amber-500/10 text-amber-500"><Calendar size={20} /></div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Ngày đăng ký</p>
                                                    <p className="text-sm font-semibold">{student.joinDate || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                                                <div className="flex items-center justify-center size-10 rounded-lg bg-purple-500/10 text-purple-500"><BookOpen size={20} /></div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Khóa học đã đăng ký</p>
                                                    <p className="text-sm font-semibold">{student.coursesEnrolled} khóa học</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                                                <div className="flex items-center justify-center size-10 rounded-lg bg-indigo-500/10 text-indigo-500"><UserIcon size={20} /></div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Vai trò</p>
                                                    <p className="text-sm font-semibold capitalize">{student.role === 'student' ? 'Học viên' : student.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                                                <div className="flex items-center justify-center size-10 rounded-lg bg-cyan-500/10 text-cyan-500"><Shield size={20} /></div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Trạng thái</p>
                                                    <div className="mt-1">{statusBadge(student.status)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold">{student.name}</h2>
                                            <p className="text-slate-500 text-sm mt-0.5">ID: {student.id}</p>
                                        </div>

                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <UserIcon size={14} className="inline mr-1.5 -mt-0.5" /> Họ và tên
                                                </label>
                                                <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl h-12 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Nhập họ và tên" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Mail size={14} className="inline mr-1.5 -mt-0.5" /> Email
                                                </label>
                                                <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl h-12 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Nhập email" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Phone size={14} className="inline mr-1.5 -mt-0.5" /> Số điện thoại
                                                </label>
                                                <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl h-12 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Nhập số điện thoại" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
                                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-11 px-6 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all">
                                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                                            </button>
                                            <button onClick={() => onNavigate('admin-students')} className="flex items-center gap-2 h-11 px-6 bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all">
                                                <X size={18} /><span>Hủy</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.message}
                </div>
            )}
        </div>
    );
};

export default StudentProfile;

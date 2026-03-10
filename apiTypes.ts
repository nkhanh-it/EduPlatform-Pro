import { Course } from "./types";

// ===== Auth / User (match backend DTOs) =====

export interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    id: number;
    name: string;
    email: string;
    avatar: string;
    role: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
    provider?: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    provider?: string;
}

// ===== Course DTOs & mappers =====

// Mirrors Java CourseResponse
export interface CourseResponse {
    id: number;
    title: string;
    instructor: string;
    thumbnail: string;
    category: string;
    rating: number | null;
    reviews: number | null;
    price: number;
    originalPrice: number;
    totalLessons?: number | null;
    completedLessons?: number | null;
    progress?: number | null;
    status?: string | null;
}

export const mapCourseResponseToCourse = (c: CourseResponse): Course => ({
    id: String(c.id),
    title: c.title,
    instructor: c.instructor,
    thumbnail: c.thumbnail,
    category: c.category,
    rating: c.rating ?? 0,
    reviews: c.reviews ?? 0,
    price: c.price,
    originalPrice: c.originalPrice,
    totalLessons: c.totalLessons ?? undefined,
    completedLessons: c.completedLessons ?? undefined,
    progress: c.progress ?? undefined,
});

// ===== Admin DTOs (light typing) =====

export interface AdminDashboardStats {
    totalRevenue: number;
    totalStudents: number;
    totalCourses: number;
    totalEnrollments: number;
    successTransactions: number;
    pendingTransactions: number;
    revenueChange: string;
    studentChange: string;
    revenueChart: { name: string; revenue: number }[];
    recentTransactions: {
        id: number;
        user: { name: string; email: string; avatar: string };
        courseTitle: string;
        amount: number;
        status: string;
        date: string;
        paymentMethod: string;
    }[];
}

export interface AdminStudent {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: string;
    status: string;
    joinDate: string;
    coursesEnrolled: number;
}

export interface AdminEnrollment {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
        avatar: string;
    };
    course: {
        id: number;
        title: string;
        price: number;
    };
    date: string;
    status: string;
    amount: number;
}


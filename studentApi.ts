import apiClient from './apiClient';

export interface StudentData {
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

export interface StudentPageData {
    content: StudentData[];
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

export interface StudentFilters {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
}

export interface CreateStudentData {
    name: string;
    email: string;
    phone?: string;
    password?: string;
}

const BASE = '/admin/students';

export const studentApi = {
    getStudents: async (filters: StudentFilters = {}): Promise<StudentPageData> => {
        const params: Record<string, string | number> = {};
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        params.page = filters.page ?? 0;
        params.size = filters.size ?? 10;
        const res = await apiClient.get<StudentPageData>(BASE, { params });
        return res.data;
    },

    getStudentById: async (id: number): Promise<StudentData> => {
        const res = await apiClient.get<StudentData>(`${BASE}/${id}`);
        return res.data;
    },

    createStudent: async (data: CreateStudentData): Promise<StudentData> => {
        const res = await apiClient.post<StudentData>(BASE, data);
        return res.data;
    },

    updateStudent: async (id: number, data: Partial<StudentData>): Promise<StudentData> => {
        const res = await apiClient.put<StudentData>(`${BASE}/${id}`, data);
        return res.data;
    },

    deleteStudent: async (id: number): Promise<void> => {
        await apiClient.delete(`${BASE}/${id}`);
    },

    toggleLock: async (id: number): Promise<{ message: string; status: string }> => {
        const res = await apiClient.patch<{ message: string; status: string }>(`${BASE}/${id}/lock`);
        return res.data;
    },

    bulkDelete: async (ids: number[]): Promise<{ message: string }> => {
        const res = await apiClient.post<{ message: string }>(`${BASE}/bulk-delete`, { ids });
        return res.data;
    },

    bulkLock: async (ids: number[]): Promise<{ message: string }> => {
        const res = await apiClient.post<{ message: string }>(`${BASE}/bulk-lock`, { ids });
        return res.data;
    },
};

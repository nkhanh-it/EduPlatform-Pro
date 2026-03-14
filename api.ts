export const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';
const TOKEN_KEY = 'token';
const USER_KEY = 'authUser';
const CURRENT_PAGE_KEY = 'currentPage';
const SELECTED_COURSE_KEY = 'selectedCourseId';
const SELECTED_LESSON_KEY = 'selectedLessonId';
let activeRequests = 0;
const requestListeners = new Set<(count: number) => void>();

function emitRequestActivity() {
  requestListeners.forEach((listener) => listener(activeRequests));
}

function beginRequest() {
  activeRequests += 1;
  emitRequestActivity();
}

function endRequest() {
  activeRequests = Math.max(0, activeRequests - 1);
  emitRequestActivity();
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  beginRequest();
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthSession();
      }

      let message = 'Đã xảy ra lỗi, vui lòng thử lại.';
      try {
        const errorBody = await response.json();
        if (errorBody?.message) {
          message = errorBody.message;
        }
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  } finally {
    endRequest();
  }
}

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: any;
};

export type StoredUser = {
  id: string;
  fullName?: string;
  displayName?: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  role: 'ADMIN' | 'STUDENT';
  status?: string;
  bio?: string;
};

export type EnrollmentDto = {
  id: string;
  course: any;
  status: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
};

export type LessonDto = {
  id: string;
  title: string;
  orderIndex: number;
  durationSeconds: number;
  preview: boolean;
};

export type TransactionDto = {
  id: string;
  userId: string;
  courseTitle: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
};

export type RevenueSummary = {
  totalRevenue: number;
  successfulTransactions: number;
  failedTransactions: number;
};

export type RevenuePoint = {
  name: string;
  revenue: number;
};

export async function register(payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCourses(category?: string, search?: string) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  const query = params.toString();
  return request<any[]>(`/api/courses${query ? `?${query}` : ''}`);
}

export async function adminGetCourses(category?: string, search?: string, published?: boolean) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  if (published !== undefined) params.append('published', String(published));
  const query = params.toString();
  return request<any[]>(`/api/courses/admin/all${query ? `?${query}` : ''}`);
}

export async function getCourse(id: string) {
  return request<any>(`/api/courses/${id}`);
}

export async function getCourseLessons(courseId: string) {
  return request<LessonDto[]>(`/api/courses/${courseId}/lessons`);
}

export async function getCategories() {
  return request<any[]>('/api/categories');
}

export async function getMe() {
  return request<any>('/api/me');
}

export async function updateMe(payload: {
  fullName: string;
  displayName?: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
}) {
  return request<any>('/api/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function changeMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return request<void>('/api/me/password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMyEnrollments(): Promise<EnrollmentDto[]> {
  return request<EnrollmentDto[]>('/api/enrollments/my');
}

export async function enroll(courseId: string) {
  return request<EnrollmentDto>('/api/enrollments', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
}

export async function updateEnrollmentProgress(
  enrollmentId: string,
  payload: {
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
  },
) {
  return request<EnrollmentDto>(`/api/enrollments/${enrollmentId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function checkout(courseId: string, method: 'CARD' | 'MOMO' | 'QR') {
  return request<TransactionDto>('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ courseId, method }),
  });
}

export async function adminGetStudents(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request<any[]>(`/api/admin/students${query}`);
}

export async function adminGetRegistrations(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request<any[]>(`/api/admin/registrations${query}`);
}

export async function adminApproveRegistration(id: string) {
  return request<any>(`/api/admin/registrations/${id}/approve`, { method: 'PATCH' });
}

export async function adminRejectRegistration(id: string) {
  return request<any>(`/api/admin/registrations/${id}/reject`, { method: 'PATCH' });
}

export async function adminUpdateStudentStatus(id: string, status: 'ACTIVE' | 'LOCKED' | 'PENDING' | 'INACTIVE') {
  return request<any>(`/api/admin/students/${id}/status?status=${status}`, { method: 'PATCH' });
}

export async function adminCreateStudent(payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return request<any>('/api/admin/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateStudent(payload: {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
}) {
  const { id, ...rest } = payload;
  return request<any>(`/api/admin/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(rest),
  });
}

export async function adminCreateCourse(payload: {
  title: string;
  instructorName: string;
  price: number;
  originalPrice?: number;
  thumbnailUrl?: string;
  category?: string;
  description?: string;
  totalLessons?: number;
}) {
  return request<any>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateCourse(id: string, payload: {
  title?: string;
  instructorName?: string;
  price?: number;
  originalPrice?: number;
  thumbnailUrl?: string;
  category?: string;
  description?: string;
  totalLessons?: number;
  published?: boolean;
}) {
  return request<any>(`/api/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteCourse(id: string) {
  return request<void>(`/api/courses/${id}`, { method: 'DELETE' });
}

export async function adminGetTransactions() {
  return request<TransactionDto[]>('/api/admin/transactions');
}

export async function adminGetRevenueSummary() {
  return request<RevenueSummary>('/api/admin/revenue/summary');
}

export async function adminGetRevenuePoints() {
  return request<RevenuePoint[]>('/api/admin/revenue/points');
}

export function subscribeRequestActivity(listener: (count: number) => void) {
  requestListeners.add(listener);
  listener(activeRequests);
  return () => {
    requestListeners.delete(listener);
  };
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setStoredUser(user: StoredUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setAuthSession(response: AuthResponse) {
  setToken(response.accessToken);
  if (response.user) {
    setStoredUser(response.user as StoredUser);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CURRENT_PAGE_KEY);
}

export function hasAuthSession() {
  return Boolean(getToken());
}

export function setCurrentPage(page: string) {
  localStorage.setItem(CURRENT_PAGE_KEY, page);
}

export function getCurrentPage(): string | null {
  return localStorage.getItem(CURRENT_PAGE_KEY);
}

export function setSelectedCourseId(id: string) {
  localStorage.setItem(SELECTED_COURSE_KEY, id);
}

export function getSelectedCourseId(): string | null {
  return localStorage.getItem(SELECTED_COURSE_KEY);
}

export function setSelectedLessonId(id: string) {
  localStorage.setItem(SELECTED_LESSON_KEY, id);
}

export function getSelectedLessonId(): string | null {
  return localStorage.getItem(SELECTED_LESSON_KEY);
}

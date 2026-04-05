export interface Course {
  id: string;
  courseCode?: string;
  title: string;
  instructor: string;
  thumbnail: string;
  category: string;
  description?: string | null;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number | null;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  published?: boolean;
}

export interface User {
  id: string;
  userCode?: string;
  name?: string;
  fullName?: string;
  displayName?: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  role: 'student' | 'admin' | 'instructor' | 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
  joinDate: string;
  status: 'active' | 'inactive' | 'pending' | 'locked' | 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'LOCKED';
  coursesEnrolled?: number;
  phone?: string;
}

export interface Transaction {
  id: string;
  user: User;
  courseTitle: string;
  date: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
}

export interface Enrollment {
  id: string;
  course: Course;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  orderIndex: number;
  durationSeconds: number;
  preview: boolean;
  gumletPlaybackUrl?: string | null;
}

export interface Stat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: any;
  color: string;
}

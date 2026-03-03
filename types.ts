export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'admin';
  joinDate: string;
  status: 'active' | 'inactive' | 'pending' | 'locked';
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

export interface Stat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: any;
  color: string;
}

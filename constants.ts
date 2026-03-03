import { Course, User, Transaction } from './types';

export const COURSES: Course[] = [
  {
    id: '1',
    title: 'ReactJS Toàn tập: Từ cơ bản đến nâng cao',
    instructor: 'Nguyễn Văn A',
    thumbnail: 'https://picsum.photos/seed/react/800/450',
    category: 'Web Dev',
    rating: 4.8,
    reviews: 1234,
    price: 500000,
    originalPrice: 1000000,
    progress: 45,
    totalLessons: 34,
    completedLessons: 12
  },
  {
    id: '2',
    title: 'Python cho Data Science & Machine Learning',
    instructor: 'Lê Thị B',
    thumbnail: 'https://picsum.photos/seed/python/800/450',
    category: 'Data Science',
    rating: 4.9,
    reviews: 850,
    price: 600000,
    originalPrice: 1200000,
    progress: 10,
    totalLessons: 50,
    completedLessons: 5
  },
  {
    id: '3',
    title: 'Digital Marketing 101: Chiến lược toàn diện',
    instructor: 'Trần Văn C',
    thumbnail: 'https://picsum.photos/seed/marketing/800/450',
    category: 'Business',
    rating: 4.5,
    reviews: 2100,
    price: 300000,
    originalPrice: 800000,
  },
  {
    id: '4',
    title: 'Thiết kế UX/UI cơ bản cho người mới bắt đầu',
    instructor: 'Phạm Thị D',
    thumbnail: 'https://picsum.photos/seed/design/800/450',
    category: 'Design',
    rating: 4.7,
    reviews: 560,
    price: 450000,
    originalPrice: 900000,
    progress: 0,
    totalLessons: 25,
    completedLessons: 0
  }
];

export const STUDENTS: User[] = [
  {
    id: '#STU-001',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0912 345 678',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    role: 'student',
    joinDate: '12/05/2023',
    status: 'active',
    coursesEnrolled: 4
  },
  {
    id: '#STU-002',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0987 654 321',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    role: 'student',
    joinDate: '15/06/2023',
    status: 'active',
    coursesEnrolled: 2
  },
  {
    id: '#STU-003',
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    phone: '0911 222 333',
    avatar: 'https://picsum.photos/seed/user3/100/100',
    role: 'student',
    joinDate: '20/08/2023',
    status: 'locked',
    coursesEnrolled: 1
  },
  {
    id: '#STU-004',
    name: 'Phạm Thị D',
    email: 'phamthid@email.com',
    phone: '0999 888 777',
    avatar: 'https://picsum.photos/seed/user4/100/100',
    role: 'student',
    joinDate: '01/09/2023',
    status: 'active',
    coursesEnrolled: 5
  },
  {
    id: '#STU-005',
    name: 'Hoàng Văn E',
    email: 'hoangvane@email.com',
    phone: '0944 555 666',
    avatar: 'https://picsum.photos/seed/user5/100/100',
    role: 'student',
    joinDate: '10/10/2023',
    status: 'pending',
    coursesEnrolled: 0
  }
];

export const REVENUE_DATA = [
  { name: 'T1', revenue: 4000 },
  { name: 'T2', revenue: 3000 },
  { name: 'T3', revenue: 2000 },
  { name: 'T4', revenue: 2780 },
  { name: 'T5', revenue: 1890 },
  { name: 'T6', revenue: 2390 },
  { name: 'T7', revenue: 3490 },
  { name: 'T8', revenue: 4200 },
];

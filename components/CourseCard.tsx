import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-dark-border dark:bg-dark-card dark:hover:shadow-primary/5">
      <div className="relative aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${course.thumbnail})` }}
        />
        <div className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {course.category}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 text-yellow-500">
            <Star size={14} fill="currentColor" />
            {course.rating}
          </span>
          <span>&bull;</span>
          <span>({course.reviews} đánh giá)</span>
        </div>

        <h3 className="mb-1 line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-white">
          {course.title}
        </h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{course.instructor}</p>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 dark:border-dark-border">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 line-through">
              {course.originalPrice ? Number(course.originalPrice).toLocaleString('vi-VN') : ''}đ
            </span>
            <span className="text-base font-bold text-primary">
              {Number(course.price).toLocaleString('vi-VN')}đ
            </span>
          </div>
          <button className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary hover:text-white">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

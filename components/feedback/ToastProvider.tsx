import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react';

type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export type ToastOptions = {
  title?: string;
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastItem = Required<ToastOptions> & {
  id: number;
};

type ToastController = {
  show: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastController | null>(null);

let toastController: ToastController | null = null;
let toastSeed = 1;

const toneMap: Record<
  ToastTone,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    card: string;
    badge: string;
    bar: string;
  }
> = {
  info: {
    icon: Info,
    card: 'border-sky-200/80 bg-white/95 dark:border-sky-900/40 dark:bg-slate-900/95',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    bar: 'bg-sky-500',
  },
  success: {
    icon: CheckCircle2,
    card: 'border-emerald-200/80 bg-white/95 dark:border-emerald-900/40 dark:bg-slate-900/95',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    bar: 'bg-emerald-500',
  },
  warning: {
    icon: TriangleAlert,
    card: 'border-amber-200/80 bg-white/95 dark:border-amber-900/40 dark:bg-slate-900/95',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    bar: 'bg-amber-500',
  },
  danger: {
    icon: CircleAlert,
    card: 'border-rose-200/80 bg-white/95 dark:border-rose-900/40 dark:bg-slate-900/95',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    bar: 'bg-rose-500',
  },
};

const getToastController = () => {
  if (!toastController) {
    throw new Error('ToastProvider is not mounted');
  }
  return toastController;
};

export const showToast = (options: ToastOptions) => getToastController().show(options);
export const dismissToast = (id: number) => getToastController().dismiss(id);
export const showSuccessToast = (message = 'Cập nhật thành công', title = 'Thành công') =>
  showToast({ title, message, tone: 'success' });
export const showErrorToast = (message = 'Đã xảy ra lỗi, vui lòng thử lại', title = 'Có lỗi xảy ra') =>
  showToast({ title, message, tone: 'danger' });
export const showInfoToast = (message = 'Đang xử lý...', title = 'Thông báo') =>
  showToast({ title, message, tone: 'info' });
export const showWarningToast = (message = 'Đã xảy ra lỗi, vui lòng thử lại', title = 'Lưu ý') =>
  showToast({ title, message, tone: 'warning' });

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<number, ReturnType<typeof window.setTimeout>>>({});

  const dismiss = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete timersRef.current[id];
    }
  };

  const show = (options: ToastOptions) => {
    const id = toastSeed++;
    const nextToast: ToastItem = {
      id,
      title: options.title || 'Thông báo',
      message: options.message,
      tone: options.tone || 'info',
      durationMs: options.durationMs ?? 3600,
    };

    setToasts((current) => [...current.slice(-3), nextToast]);
    timersRef.current[id] = window.setTimeout(() => {
      dismiss(id);
    }, nextToast.durationMs);

    return id;
  };

  const controller = useMemo<ToastController>(() => ({ show, dismiss }), []);

  useEffect(() => {
    toastController = controller;
    return () => {
      if (toastController === controller) {
        toastController = null;
      }
      Object.values(timersRef.current).forEach((timer: ReturnType<typeof window.setTimeout>) => window.clearTimeout(timer));
      timersRef.current = {};
    };
  }, [controller]);

  return (
    <ToastContext.Provider value={controller}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[180] flex w-[min(92vw,420px)] flex-col gap-3">
        {toasts.map((toast) => {
          const tone = toneMap[toast.tone];
          const Icon = tone.icon;

          return (
            <div key={toast.id} className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur ${tone.card}`}>
              <div className={`absolute inset-x-0 top-0 h-1 ${tone.bar}`} />
              <div className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.badge}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{toast.title}</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-5 text-slate-600 dark:text-slate-300">{toast.message}</p>
                </div>
                <button onClick={() => dismiss(toast.id)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white">
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

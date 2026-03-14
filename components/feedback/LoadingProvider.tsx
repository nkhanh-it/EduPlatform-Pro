import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { subscribeRequestActivity } from '../../api';

type LoadingContextValue = {
  isLoading: boolean;
};

const LoadingContext = createContext<LoadingContextValue>({ isLoading: false });

export const useGlobalLoading = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeRequestActivity(setPendingCount), []);

  useEffect(() => {
    if (pendingCount > 0) {
      const timer = window.setTimeout(() => setVisible(true), 120);
      return () => window.clearTimeout(timer);
    }
    setVisible(false);
  }, [pendingCount]);

  const value = useMemo(() => ({ isLoading: pendingCount > 0 }), [pendingCount]);

  return (
    <LoadingContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-0 z-[170] h-1 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-sky-400 via-primary to-cyan-300 transition-all duration-300 ${
            pendingCount > 0 ? 'w-full opacity-100 animate-pulse' : 'w-0 opacity-0'
          }`}
        />
      </div>

      {visible && (
        <div className="pointer-events-none fixed inset-0 z-[165] flex items-center justify-center bg-slate-950/18 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/92 px-5 py-4 shadow-2xl dark:border-dark-border dark:bg-slate-900/92">
            <LoaderCircle size={20} className="animate-spin text-primary" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Đang xử lý...</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Vui lòng chờ trong giây lát.</p>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

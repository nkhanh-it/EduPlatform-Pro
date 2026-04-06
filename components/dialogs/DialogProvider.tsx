import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CircleAlert, CircleHelp, X } from 'lucide-react';

type BaseDialogOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  closeOnEsc?: boolean;
  closeOnOutside?: boolean;
};

export type AlertDialogOptions = BaseDialogOptions & {
  tone?: 'info' | 'success' | 'warning' | 'danger';
};

export type ConfirmDialogOptions = BaseDialogOptions & {
  tone?: 'info' | 'warning' | 'danger';
};

export type PromptDialogOptions = BaseDialogOptions & {
  defaultValue?: string;
  placeholder?: string;
  inputLabel?: string;
  inputType?: 'text' | 'email' | 'number' | 'password' | 'url';
  validate?: (value: string) => string | null;
};

type DialogRequest =
  | { type: 'alert'; options: AlertDialogOptions; resolve: () => void }
  | { type: 'confirm'; options: ConfirmDialogOptions; resolve: (value: boolean) => void }
  | { type: 'prompt'; options: PromptDialogOptions; resolve: (value: string | null) => void };

type DialogController = {
  alert: (options: AlertDialogOptions) => Promise<void>;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  prompt: (options: PromptDialogOptions) => Promise<string | null>;
};

const DialogContext = createContext<DialogController | null>(null);

let dialogController: DialogController | null = null;

const getDialogController = () => {
  if (!dialogController) {
    throw new Error('DialogProvider is not mounted');
  }
  return dialogController;
};

export const showAlert = (options: AlertDialogOptions) => getDialogController().alert(options);
export const showConfirm = (options: ConfirmDialogOptions) => getDialogController().confirm(options);
export const showPrompt = (options: PromptDialogOptions) => getDialogController().prompt(options);

export const useDialogs = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialogs must be used within DialogProvider');
  }
  return context;
};

const toneClasses = {
  info: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    button: 'bg-primary hover:bg-primary-hover text-white',
  },
  success: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    button: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
  },
  danger: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    button: 'bg-red-600 hover:bg-red-500 text-white',
  },
};

const getDialogTone = (request: DialogRequest | null) => {
  if (!request) return toneClasses.info;
  if (request.type === 'alert') return toneClasses[request.options.tone || 'info'];
  if (request.type === 'confirm') return toneClasses[request.options.tone || 'info'];
  return toneClasses.info;
};

const getDialogIcon = (request: DialogRequest | null) => {
  if (!request) return CircleHelp;
  if (request.type === 'alert') {
    if (request.options.tone === 'danger') return CircleAlert;
    if (request.options.tone === 'warning') return AlertCircle;
    return CircleHelp;
  }
  if (request.type === 'confirm') {
    if (request.options.tone === 'danger') return CircleAlert;
    return CircleHelp;
  }
  return CircleHelp;
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queueRef = useRef<DialogRequest[]>([]);
  const [activeDialog, setActiveDialog] = useState<DialogRequest | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [promptError, setPromptError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openNextDialog = () => {
    const nextDialog = queueRef.current.shift() || null;
    setActiveDialog(nextDialog);
    setPromptError('');
    setPromptValue(nextDialog?.type === 'prompt' ? nextDialog.options.defaultValue || '' : '');
  };

  const enqueueDialog = (request: DialogRequest) => {
    queueRef.current.push(request);
    setActiveDialog((current) => {
      if (current) return current;
      const nextDialog = queueRef.current.shift() || null;
      setPromptError('');
      setPromptValue(nextDialog?.type === 'prompt' ? nextDialog.options.defaultValue || '' : '');
      return nextDialog;
    });
  };

  const controller = useMemo<DialogController>(
    () => ({
      alert: (options) => new Promise<void>((resolve) => enqueueDialog({ type: 'alert', options, resolve })),
      confirm: (options) => new Promise<boolean>((resolve) => enqueueDialog({ type: 'confirm', options, resolve })),
      prompt: (options) => new Promise<string | null>((resolve) => enqueueDialog({ type: 'prompt', options, resolve })),
    }),
    [],
  );

  useEffect(() => {
    dialogController = controller;
    return () => {
      if (dialogController === controller) dialogController = null;
    };
  }, [controller]);

  useEffect(() => {
    if (!activeDialog?.options.closeOnEsc && activeDialog?.options.closeOnEsc !== undefined) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
      }
      if (event.key === 'Enter' && activeDialog?.type === 'prompt' && document.activeElement === inputRef.current) {
        event.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDialog, promptValue]);

  useEffect(() => {
    if (activeDialog?.type === 'prompt' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [activeDialog]);

  const closeDialog = () => openNextDialog();

  const handleCancel = () => {
    if (!activeDialog) return;
    if (activeDialog.type === 'alert') activeDialog.resolve();
    else if (activeDialog.type === 'confirm') activeDialog.resolve(false);
    else activeDialog.resolve(null);
    closeDialog();
  };

  const handleConfirm = () => {
    if (!activeDialog) return;
    if (activeDialog.type === 'prompt') {
      const validationError = activeDialog.options.validate?.(promptValue) || null;
      if (validationError) {
        setPromptError(validationError);
        return;
      }
      activeDialog.resolve(promptValue);
      closeDialog();
      return;
    }
    if (activeDialog.type === 'confirm') {
      activeDialog.resolve(true);
      closeDialog();
      return;
    }
    activeDialog.resolve();
    closeDialog();
  };

  const handleOverlayClick = () => {
    if (!activeDialog) return;
    if (activeDialog.options.closeOnOutside === false) return;
    handleCancel();
  };

  const dialogTone = getDialogTone(activeDialog);
  const Icon = getDialogIcon(activeDialog);

  return (
    <DialogContext.Provider value={controller}>
      {children}

      {activeDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6">
          <button aria-label="Close dialog overlay" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={handleOverlayClick} />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-400 to-cyan-300" />

            <div className="flex items-start justify-between gap-4 p-6 pb-0">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dialogTone.badge}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeDialog.options.title ||
                      (activeDialog.type === 'confirm'
                        ? 'Xác nhận'
                        : activeDialog.type === 'prompt'
                        ? 'Nhập thông tin'
                        : 'Thông báo')}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500 dark:text-slate-400">{activeDialog.options.message}</p>
                </div>
              </div>

              <button onClick={handleCancel} className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-dark-bg dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            {activeDialog.type === 'prompt' && (
              <div className="px-6 pt-5">
                {activeDialog.options.inputLabel && <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{activeDialog.options.inputLabel}</label>}
                <input
                  ref={inputRef}
                  type={activeDialog.options.inputType || 'text'}
                  value={promptValue}
                  onChange={(event) => {
                    setPromptValue(event.target.value);
                    if (promptError) setPromptError('');
                  }}
                  placeholder={activeDialog.options.placeholder}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-white"
                />
                {promptError && <p className="mt-2 text-sm text-red-500">{promptError}</p>}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 bg-slate-50/80 px-6 py-4 dark:border-dark-border dark:bg-dark-bg/40">
              {activeDialog.type !== 'alert' && (
                <button onClick={handleCancel} className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-gray-50 dark:border-dark-border dark:bg-dark-card dark:text-slate-300 dark:hover:bg-dark-border">
                  {activeDialog.options.cancelText || 'Hủy'}
                </button>
              )}
              <button onClick={handleConfirm} className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${dialogTone.button}`}>
                {activeDialog.options.confirmText || (activeDialog.type === 'alert' ? 'Đóng' : 'Xác nhận')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

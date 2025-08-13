import { useCallback, useState } from 'react';

type ToastState = {
  id: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastState, 'id'>) => {
      const IdSubstringStart = 2;
      const IdSubstringEnd = 9;
      const DefaultToastDuration = 5000;
      const RadixBase = 36;

      const id = Math.random()
        .toString(RadixBase)
        .substring(IdSubstringStart, IdSubstringEnd);

      setToasts((prev) => [...prev, { ...toast, id }]);

      // Auto remove after duration
      const duration = toast.duration || DefaultToastDuration;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => {
      addToast({ variant: 'success', message, title });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      addToast({ variant: 'error', message, title });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      addToast({ variant: 'warning', message, title });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      addToast({ variant: 'info', message, title });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

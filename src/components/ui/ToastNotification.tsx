'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borderMap = {
    success: 'border-emerald-500/20 bg-emerald-950/90 text-white',
    error: 'border-rose-500/20 bg-rose-950/90 text-white',
    warning: 'border-amber-500/20 bg-amber-950/90 text-white',
    info: 'border-blue-500/20 bg-slate-900/90 text-white',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom-5 fade-in duration-200 ${borderMap[toast.type]}`}
        >
          {iconMap[toast.type]}

          <div className="flex-1 min-w-0 pr-1">
            {toast.title && (
              <h4 className="text-xs font-black tracking-tight text-white mb-0.5">
                {toast.title}
              </h4>
            )}
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

'use client';

import React from 'react';
import { AlertTriangle, Trash2, CheckCircle2, X } from 'lucide-react';

interface ModalConfirmacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'primary';
  isLoading?: boolean;
}

export const ModalConfirmacao: React.FC<ModalConfirmacaoProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-100 text-rose-600',
      icon: Trash2,
      buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
      border: 'border-rose-100',
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-600',
      icon: AlertTriangle,
      buttonBg: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
      border: 'border-amber-100',
    },
    success: {
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: CheckCircle2,
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
      border: 'border-emerald-100',
    },
    primary: {
      iconBg: 'bg-orange-100 text-orange-600',
      icon: CheckCircle2,
      buttonBg: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20',
      border: 'border-orange-100',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;
  const Icon = currentVariant.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 transform transition-all animate-in zoom-in-95 duration-150">
        {/* Cabeçalho do Modal */}
        <div className="p-5 sm:p-6 pb-0 flex items-start justify-between gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${currentVariant.iconBg}`}>
            <Icon className="w-6 h-6 stroke-[2.2]" />
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 sm:p-6 space-y-2">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {title}
          </h3>
          <div className="text-xs text-slate-600 leading-relaxed">
            {description}
          </div>
        </div>

        {/* Ações */}
        <div className="p-4 sm:p-6 pt-0 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition active:scale-95"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition transform active:scale-95 flex items-center gap-1.5 ${currentVariant.buttonBg} ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

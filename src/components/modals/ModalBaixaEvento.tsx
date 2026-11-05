'use client';

import React, { useState, useEffect } from 'react';
import { EventoEscolar, ParticipanteEvento, FormaPagamento } from '@/types';
import { formatarMoeda } from '@/utils/helpers';
import { X, DollarSign, Check, CreditCard, Calendar, FileText } from 'lucide-react';

interface ModalBaixaEventoProps {
  isOpen: boolean;
  onClose: () => void;
  evento: EventoEscolar | null;
  participante: ParticipanteEvento | null;
  onConfirm: (data: {
    formaPagamento: FormaPagamento;
    dataPagamento: string;
    observacoes?: string;
  }) => void;
}

export const ModalBaixaEvento: React.FC<ModalBaixaEventoProps> = ({
  isOpen,
  onClose,
  evento,
  participante,
  onConfirm,
}) => {
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (participante?.formaPagamento) {
      setFormaPagamento(participante.formaPagamento);
    } else {
      setFormaPagamento('PIX');
    }
    setDataPagamento(new Date().toISOString().slice(0, 10));
    setObservacoes(participante?.observacoesPagamento || '');
  }, [participante, isOpen]);

  if (!isOpen || !evento || !participante) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      formaPagamento,
      dataPagamento,
      observacoes: observacoes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Baixa de Pagamento</h3>
              <p className="text-emerald-100 text-xs">Evento escolar com recibo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Evento e Aluno */}
        <div className="bg-emerald-50/70 border-b border-emerald-100/80 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">Evento:</span>
            <span className="text-slate-900 font-black text-right truncate max-w-[240px]">
              {evento.titulo}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">Aluno(a):</span>
            <strong className="text-slate-900 uppercase font-black">{participante.alunoNome}</strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">Turma:</span>
            <span className="text-slate-700 font-bold">{participante.turmaNome}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-emerald-200/50">
            <span className="text-emerald-900 font-black">Valor a Pagar:</span>
            <span className="text-base font-black text-emerald-700">
              {formatarMoeda(participante.valor || evento.valorPorAluno)}
            </span>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          
          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Forma de Pagamento *
            </label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Transferência">Transferência Bancária</option>
            </select>
          </div>

          {/* Data do Pagamento */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Data do Pagamento *
            </label>
            <input
              type="date"
              required
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Observações (opcional)
            </label>
            <input
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Comprovante enviado pela mãe no WhatsApp"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botões */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md transition transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Confirmar Pagamento</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};


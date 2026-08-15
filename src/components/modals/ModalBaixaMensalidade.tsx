'use client';

import React, { useState } from 'react';
import { Mensalidade, Student, FormaPagamento } from '@/types';
import { formatarMoeda, formatarDataBR } from '@/utils/helpers';
import { X, CheckCircle, CreditCard, DollarSign } from 'lucide-react';

interface ModalBaixaMensalidadeProps {
  isOpen: boolean;
  onClose: () => void;
  mensalidade: Mensalidade | null;
  student: Student | null;
  onConfirm: (data: {
    formaPagamento: FormaPagamento;
    dataPagamento: string;
    desconto: number;
    acrescimo: number;
    pagoPor: string;
    observacoes: string;
    abrirRecibo: boolean;
  }) => void;
}

export const ModalBaixaMensalidade: React.FC<ModalBaixaMensalidadeProps> = ({
  isOpen,
  onClose,
  mensalidade,
  student,
  onConfirm,
}) => {
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));
  const [desconto, setDesconto] = useState<string | number>(mensalidade?.desconto ? String(mensalidade.desconto) : '');
  const [acrescimo, setAcrescimo] = useState<string | number>(mensalidade?.acrescimo ? String(mensalidade.acrescimo) : '');
  const [pagoPor, setPagoPor] = useState(student?.responsaveis?.mae?.nome || student?.responsaveis?.pai?.nome || '');
  const [observacoes, setObservacoes] = useState('');
  const [abrirRecibo, setAbrirRecibo] = useState(true);

  if (!isOpen || !mensalidade || !student) return null;

  const numDesconto = typeof desconto === 'number' ? desconto : parseFloat(String(desconto)) || 0;
  const numAcrescimo = typeof acrescimo === 'number' ? acrescimo : parseFloat(String(acrescimo)) || 0;
  const valorFinal = Math.max(0, mensalidade.valorOriginal - numDesconto + numAcrescimo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      formaPagamento,
      dataPagamento,
      desconto: numDesconto,
      acrescimo: numAcrescimo,
      pagoPor,
      observacoes,
      abrirRecibo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Registrar Pagamento</h3>
              <p className="text-emerald-100 text-xs mt-0.5">
                Dar baixa na mensalidade e emitir recibo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo da Parcela */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Aluno(a):</span>
            <strong className="text-slate-900 uppercase">{student.nome}</strong>
          </div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Referência:</span>
            <strong className="text-emerald-800">{mensalidade.mesReferencia}</strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Vencimento:</span>
            <span className="font-semibold text-slate-700">{formatarDataBR(mensalidade.dataVencimento)}</span>
          </div>
        </div>

        {/* Formulário de Baixa */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['PIX', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito', 'Transferência'] as FormaPagamento[]).map(
                (forma) => (
                  <button
                    key={forma}
                    type="button"
                    onClick={() => setFormaPagamento(forma)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      formaPagamento === forma
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {forma}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Data do Pagamento *
              </label>
              <input
                type="date"
                required
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Pago por (Nome)
              </label>
              <input
                type="text"
                value={pagoPor}
                onChange={(e) => setPagoPor(e.target.value)}
                placeholder="Ex: Tamires (Mãe)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-1">Valor Original</label>
              <span className="text-xs font-bold text-slate-700 block">{formatarMoeda(mensalidade.valorOriginal)}</span>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-1">Desconto (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-1">Acréscimo (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={acrescimo}
                onChange={(e) => setAcrescimo(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Valor Final em Destaque */}
          <div className="bg-emerald-500 text-white p-3 rounded-2xl flex items-center justify-between shadow-md">
            <span className="text-xs font-bold uppercase tracking-wider">Total a Baixar:</span>
            <span className="text-xl font-black font-mono">{formatarMoeda(valorFinal)}</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Observações do Pagamento (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Comprovante enviado via WhatsApp"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={abrirRecibo}
              onChange={(e) => setAbrirRecibo(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            Abrir Recibo Oficial para Impressão / WhatsApp após salvar
          </label>

          {/* Ações */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition transform active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmar Recebimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

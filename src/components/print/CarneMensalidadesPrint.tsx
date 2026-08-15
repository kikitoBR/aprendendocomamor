'use client';

import React from 'react';
import { Student, Mensalidade, EscolaConfig } from '@/types';
import { formatarMoeda, formatarDataBR } from '@/utils/helpers';
import { Logo } from '@/components/Logo';
import { Printer, X } from 'lucide-react';

interface CarneMensalidadesPrintProps {
  student: Student;
  mensalidades: Mensalidade[];
  config: EscolaConfig;
  onClose?: () => void;
}

export const CarneMensalidadesPrint: React.FC<CarneMensalidadesPrintProps> = ({
  student,
  mensalidades,
  config,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const mensalidadesAluno = mensalidades
    .filter((m) => m.alunoId === student.id)
    .sort((a, b) => a.mesIndex - b.mesIndex);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex justify-center p-4 print-only-modal print:p-0 print:m-0 print:bg-white print:static print:inset-auto">
      {/* Barra de Ações */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-white/90 p-2 rounded-xl shadow-xl border border-slate-200 backdrop-blur">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition text-sm"
        >
          <Printer className="w-4 h-4" />
          Imprimir Carnê Anual Completo
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Folhas do Carnê */}
      <div className="w-full max-w-[210mm] bg-white text-black p-8 shadow-2xl print:shadow-none print:p-4 font-sans space-y-6">
        {/* Capa do Carnê */}
        <div className="border-4 border-amber-500 rounded-2xl p-6 text-center bg-amber-50/50 mb-8 print:mb-4">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide">
            Carnê de Mensalidades Escolares - {student.anoLetivo}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {config.endereco}, {config.bairro} – {config.cidade}/{config.uf} • Contato: {config.telefonePrincipal}
          </p>

          <div className="mt-4 pt-4 border-t border-amber-200 grid grid-cols-2 text-left text-xs gap-3 bg-white p-4 rounded-xl border">
            <div>
              <p className="text-slate-500">Aluno(a):</p>
              <p className="font-bold text-sm uppercase text-slate-900">{student.nome}</p>
              <p className="text-[11px] text-slate-600">Matrícula: <strong>{student.matricula}</strong> | Turma: <strong>{student.turmaNome}</strong></p>
            </div>
            <div>
              <p className="text-slate-500">Responsável Financeiro:</p>
              <p className="font-bold text-slate-900">{student.responsaveis.mae.nome || student.responsaveis.pai.nome || 'Responsável'}</p>
              <p className="text-[11px] text-slate-600">Telefone: {student.responsaveis.mae.telefone || student.responsaveis.pai.telefone}</p>
            </div>
          </div>

          <div className="mt-3 bg-emerald-50 border border-emerald-300 p-2 rounded-lg text-emerald-900 text-xs">
            <strong>Chave PIX da Escola:</strong> {config.chavePix} ({config.titularPix} - {config.bancoPix})
          </div>
        </div>

        {/* Grade de Canhotos (3 por página A4) */}
        <div className="space-y-4">
          {mensalidadesAluno.map((m, idx) => (
            <div
              key={m.id}
              className="border-2 border-slate-700 rounded-xl p-4 bg-white break-inside-avoid shadow-sm"
            >
              {/* Cabeçalho do canhoto */}
              <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <Logo size="sm" showSubtitle={false} />
                  <div>
                    <h4 className="font-bold text-xs uppercase">{config.nome}</h4>
                    <span className="text-[10px] text-slate-500">CNPJ: {config.cnpj}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
                    Parcela {String(idx + 1).padStart(2, '0')} / 12
                  </span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{m.mesReferencia}</span>
                </div>
              </div>

              {/* Informações da Parcela */}
              <div className="grid grid-cols-12 gap-3 text-xs">
                <div className="col-span-8 space-y-1">
                  <p>
                    <span className="text-slate-500">Aluno(a): </span>
                    <strong className="uppercase">{student.nome}</strong> (Mat: {student.matricula})
                  </p>
                  <p>
                    <span className="text-slate-500">Turma: </span>
                    <strong>{student.turmaNome}</strong> - Turno: <strong>{student.turno}</strong>
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Instruções: Pagamentos via PIX enviar comprovante no WhatsApp: {config.telefonePrincipal}
                  </p>
                </div>

                <div className="col-span-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-right">
                  <span className="text-[10px] text-slate-500 block">Vencimento</span>
                  <span className="font-bold text-xs text-rose-600 block mb-1">
                    {formatarDataBR(m.dataVencimento)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Valor da Mensalidade</span>
                  <span className="font-black text-sm text-emerald-700 font-mono block">
                    {formatarMoeda(m.valorFinal)}
                  </span>
                </div>
              </div>

              {/* Linha de Autenticação / Recibo do Canhoto */}
              <div className="mt-3 pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
                <span>Chave PIX: {config.chavePix}</span>
                <span className="font-mono">Autenticação Mecânica / Visto da Tesouraria: _______________________</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Mensalidade, Student, EscolaConfig } from '@/types';
import { formatarMoeda, formatarDataBR, valorPorExtenso, linkWhatsApp, gerarMensagemRecibo } from '@/utils/helpers';
import { Logo } from '@/components/Logo';
import { Printer, MessageCircle, X } from 'lucide-react';

interface ReciboOficialPrintProps {
  mensalidade: Mensalidade;
  student: Student;
  config: EscolaConfig;
  onClose?: () => void;
}

export const ReciboOficialPrint: React.FC<ReciboOficialPrintProps> = ({
  mensalidade,
  student,
  config,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const telefoneParaZap = student.responsaveis.mae.telefone || student.responsaveis.pai.telefone || '';
  const zapLink = linkWhatsApp(telefoneParaZap, gerarMensagemRecibo(mensalidade, student, config));

  const renderViaRecibo = (tituloVia: string) => (
    <div className="border-2 border-slate-800 p-4 sm:p-5 rounded-2xl bg-white text-slate-900 shadow-xs relative">
      {/* Tarja da via */}
      <div className="absolute top-0 right-0 bg-slate-800 text-white text-[9.5px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-widest">
        {tituloVia}
      </div>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <Logo size="sm" showSubtitle={false} />
          <div>
            <h3 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide">{config.nome}</h3>
            <p className="text-[9.5px] text-slate-600">CNPJ: {config.cnpj} • {config.resolucao}</p>
            <p className="text-[8.5px] text-slate-500">{config.endereco}, {config.bairro} – {config.cidade}/{config.uf}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-bold uppercase text-slate-400 block">Recibo de Pagamento</span>
          <span className="font-mono font-black text-xs sm:text-sm text-emerald-600 block">{mensalidade.numeroRecibo || 'REC-2026-OFICIAL'}</span>
          <span className="text-[9.5px] text-slate-500">Data: {formatarDataBR(mensalidade.dataPagamento || new Date().toISOString().slice(0, 10))}</span>
        </div>
      </div>

      {/* Caixa do Valor */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 sm:p-3 flex items-center justify-between mb-3">
        <div>
          <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wider block">Valor Recebido</span>
          <span className="text-[11px] italic text-emerald-900">({valorPorExtenso(mensalidade.valorFinal)})</span>
        </div>
        <span className="font-black text-lg sm:text-xl text-emerald-700 font-mono">
          {formatarMoeda(mensalidade.valorFinal)}
        </span>
      </div>

      {/* Corpo do Recibo */}
      <div className="space-y-1.5 text-xs leading-relaxed mb-3">
        <p>
          Recebemos de <strong className="uppercase">{mensalidade.pagoPor || student.responsaveis.mae.nome || student.responsaveis.pai.nome || 'Responsável Financeiro'}</strong>, 
          referente à mensalidade escolar de <strong className="text-slate-900 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 font-bold">{mensalidade.mesReferencia}</strong>, 
          do(a) aluno(a) <strong className="uppercase text-slate-900">{student.nome}</strong> (Matrícula: <span className="font-mono font-bold">{student.matricula}</span> - Turma: <strong>{student.turmaNome}</strong>).
        </p>

        <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500">Forma de Pagamento: </span>
            <strong className="text-slate-800">{mensalidade.formaPagamento || 'PIX'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Vencimento Original: </span>
            <strong className="text-slate-800">{formatarDataBR(mensalidade.dataVencimento)}</strong>
          </div>
        </div>
      </div>

      {/* Linha de Assinatura */}
      <div className="flex items-end justify-between pt-2 border-t border-dashed border-slate-300 text-xs">
        <div className="text-[9.5px] text-slate-500">
          <p>Campos dos Goytacazes/RJ, {formatarDataBR(mensalidade.dataPagamento || new Date().toISOString().slice(0, 10))}</p>
          <p>Contato: {config.telefonePrincipal}</p>
        </div>

        <div className="text-center w-52 sm:w-56">
          <div className="border-b border-slate-700 h-7 sm:h-8"></div>
          <span className="text-[8.5px] text-slate-500 uppercase tracking-wider block mt-0.5 font-semibold">Tesouraria / Secretaria</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex justify-center items-start p-4 sm:p-6 print-only-modal print:p-0 print:m-0 print:bg-white print:static print:inset-auto">
      {/* Barra de Ações */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-white/95 p-2 rounded-2xl shadow-2xl border border-slate-200 backdrop-blur">
        {telefoneParaZap && (
          <a
            href={zapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-bold shadow-sm transition text-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        )}

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm transition text-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Recibo (2 Vias)</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            title="Fechar Visualização"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Documento A4 com as 2 Vias Encaixadas com Perfeição */}
      <div className="w-full max-w-[210mm] bg-white text-black p-5 sm:p-7 rounded-3xl shadow-2xl print:shadow-none print:p-0 print:rounded-none font-sans my-4 sm:my-8 border border-slate-100">
        {renderViaRecibo('1ª Via - Responsável')}
        <div className="border-b-2 border-dashed border-slate-300 my-3 sm:my-4 text-center text-[9px] text-slate-400 font-mono select-none">
          ✂ - - - - - - - - - - - - - - - - - - - CORTE AQUI - - - - - - - - - - - - - - - - - - - ✂
        </div>
        {renderViaRecibo('2ª Via - Escola / Arquivo')}
      </div>
    </div>
  );
};

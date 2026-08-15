'use client';

import React from 'react';
import { Student, Turma, EscolaConfig, ChamadaFrequencia } from '@/types';
import { Logo } from '@/components/Logo';
import { Printer, X } from 'lucide-react';

interface ListaPresencaPrintProps {
  turma: Turma;
  students: Student[];
  config: EscolaConfig;
  dataChamada?: string; // Formato YYYY-MM-DD
  frequencias?: ChamadaFrequencia[];
  mes?: string;
  ano?: string;
  onClose?: () => void;
}

const MESES_NOMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const ListaPresencaPrint: React.FC<ListaPresencaPrintProps> = ({
  turma,
  students,
  config,
  dataChamada,
  frequencias = [],
  mes,
  ano,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Determinar ano, mês e dias com base na dataChamada selecionada
  let anoNum = 2026;
  let mesNum = 2; // Padrão Fevereiro
  let mesNome = mes || 'Fevereiro';
  let anoStr = ano || '2026';
  let diaSelecionado = 0;

  if (dataChamada && dataChamada.includes('-')) {
    const parts = dataChamada.split('-');
    if (parts.length === 3) {
      anoNum = parseInt(parts[0], 10) || 2026;
      mesNum = parseInt(parts[1], 10) || 2;
      diaSelecionado = parseInt(parts[2], 10) || 1;
      mesNome = MESES_NOMES[mesNum - 1] || 'Fevereiro';
      anoStr = String(anoNum);
    }
  }

  // Quantidade real de dias no mês selecionado (ex: 28 em Fev, 31 em Março/Agosto)
  const totalDiasNoMes = new Date(anoNum, mesNum, 0).getDate();
  const dias = Array.from({ length: totalDiasNoMes }, (_, i) => i + 1);

  const alunosTurma = students
    .filter((s) => s.turmaId === turma.id && s.status === 'Ativo')
    .sort((a, b) => a.nome.localeCompare(b.nome));

  // Mapa de chamadas do mês para preencher histórico se existir
  const obterStatusDia = (alunoId: string, dia: number) => {
    const dataIso = `${anoNum}-${String(mesNum).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const chamada = frequencias.find((f) => f.turmaId === turma.id && f.data === dataIso);
    if (!chamada) return '';

    const reg = chamada.registros.find((r) => r.alunoId === alunoId);
    if (!reg) return '';
    if (reg.status === 'Presente') return '•';
    if (reg.status === 'Falta') return 'F';
    if (reg.status === 'Justificada') return 'FJ';
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 print-only-modal print:p-0 print:m-0 print:bg-white print:static print:inset-auto">
      {/* Estilos Globais para Forçar Impressão em Modo Paisagem (Deitada) em 1 Página */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm 6mm;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-only-modal {
            display: block !important;
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .diario-a4-landscape {
            height: 195mm !important;
            max-height: 195mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Botões Flutuantes */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-white/95 p-2 rounded-2xl shadow-2xl border border-slate-200 backdrop-blur">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md transition text-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Diário de Presença (Paisagem / 1 Página)</span>
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

      {/* Folha A4 Paisagem (Landscape: 297mm x 210mm - 1 Página Fixa) */}
      <div className="diario-a4-landscape w-full max-w-[297mm] min-h-[195mm] bg-white text-black p-3 sm:p-5 shadow-2xl print:shadow-none print:p-0 print:m-0 border border-slate-200 print:border-none font-sans text-[10.5px] leading-tight flex flex-col justify-between my-2">
        <div>
          {/* Cabeçalho */}
          <div className="border-2 border-black p-2.5 mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" showSubtitle={false} />
              <div>
                <h2 className="font-black text-xs sm:text-sm uppercase tracking-wide">{config.nome}</h2>
                <p className="text-[9.5px] text-slate-700">Diário Oficial de Frequência Escolar • Educação Infantil e Fundamental</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div className="text-[10.5px]">
                <p><strong>Turma:</strong> {turma.nome} ({turma.turno})</p>
                <p><strong>Professor(a):</strong> {turma.professorResponsavel || 'Equipe Pedagógica'}</p>
              </div>
              <div className="bg-slate-100 border-2 border-black px-3.5 py-1 text-center font-black rounded-lg shadow-2xs">
                <span className="text-xs uppercase tracking-wider">{mesNome} / {anoStr}</span>
                {diaSelecionado > 0 && (
                  <span className="block text-[8.5px] text-slate-600 font-medium">Ref. Dia {String(diaSelecionado).padStart(2, '0')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Tabela de Presença Mensal */}
          <div className="border-2 border-black overflow-x-auto">
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-black font-black">
                  <th className="border-r border-black p-0.5 w-7 text-[9px]">Nº</th>
                  <th className="border-r border-black p-0.5 text-left min-w-[190px] text-[9px]">Nome do Aluno</th>
                  {dias.map((d) => (
                    <th
                      key={d}
                      className={`border-r border-slate-400 p-0.5 w-6 text-[8.5px] ${
                        d === diaSelecionado ? 'bg-amber-100 font-black text-amber-950 border-x-2 border-amber-600' : ''
                      }`}
                    >
                      {d}
                    </th>
                  ))}
                  <th className="border-r border-black p-0.5 w-10 text-[8.5px]">Pres.</th>
                  <th className="p-0.5 w-10 text-[8.5px]">Faltas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-[9px]">
                {alunosTurma.map((aluno, index) => {
                  let countPres = 0;
                  let countFaltas = 0;

                  return (
                    <tr key={aluno.id} className="h-5 hover:bg-slate-50">
                      <td className="border-r border-black font-bold font-mono text-[8.5px]">{String(index + 1).padStart(2, '0')}</td>
                      <td className="border-r border-black text-left px-1.5 uppercase font-bold truncate text-[9px]">
                        {aluno.nome}
                      </td>
                      {dias.map((d) => {
                        const statusIcon = obterStatusDia(aluno.id, d);
                        if (statusIcon === '•') countPres++;
                        if (statusIcon === 'F' || statusIcon === 'FJ') countFaltas++;

                        return (
                          <td
                            key={d}
                            className={`border-r border-slate-300 font-black text-[11px] ${
                              d === diaSelecionado ? 'bg-amber-50/50 border-x-2 border-amber-500' : ''
                            } ${statusIcon === 'F' ? 'text-rose-600' : statusIcon === '•' ? 'text-emerald-700' : ''}`}
                          >
                            {statusIcon}
                          </td>
                        );
                      })}
                      <td className="border-r border-black font-bold bg-slate-50 text-[9px]">{countPres > 0 ? countPres : ''}</td>
                      <td className="font-bold bg-slate-50 text-rose-600 text-[9px]">{countFaltas > 0 ? countFaltas : ''}</td>
                    </tr>
                  );
                })}

                {/* Linhas vazias para anotações ou alunos adicionais */}
                {Array.from({ length: Math.max(0, 12 - alunosTurma.length) }).map((_, i) => (
                  <tr key={`extra-${i}`} className="h-5">
                    <td className="border-r border-black font-mono text-slate-400 text-[8.5px]">{String(alunosTurma.length + i + 1).padStart(2, '0')}</td>
                    <td className="border-r border-black"></td>
                    {dias.map((d) => (
                      <td
                        key={d}
                        className={`border-r border-slate-300 ${
                          d === diaSelecionado ? 'bg-amber-50/30 border-x-2 border-amber-500' : ''
                        }`}
                      ></td>
                    ))}
                    <td className="border-r border-black"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legenda e Assinaturas */}
        <div className="mt-1.5 pt-1 flex items-center justify-between text-[9.5px]">
          <div className="flex items-center gap-3">
            <span className="font-bold">Legenda:</span>
            <span><strong className="text-emerald-700 text-xs">•</strong> Presente</span>
            <span><strong className="text-rose-600">F</strong> Falta</span>
            <span><strong className="text-amber-600">FJ</strong> Falta Justificada</span>
          </div>

          <div className="flex items-center gap-8 text-center">
            <div className="w-44">
              <div className="border-b border-black h-5"></div>
              <span className="text-[8px] uppercase tracking-wider font-semibold block mt-0.5">Assinatura do(a) Professor(a)</span>
            </div>
            <div className="w-44">
              <div className="border-b border-black h-5"></div>
              <span className="text-[8px] uppercase tracking-wider font-semibold block mt-0.5">Coordenação Pedagógica</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

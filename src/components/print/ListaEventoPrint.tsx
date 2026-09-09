'use client';

import React from 'react';
import { EventoEscolar, EscolaConfig, Student } from '@/types';
import { Logo } from '@/components/Logo';
import { formatarDataBR, formatarMoeda } from '@/utils/helpers';
import { Printer, X, CheckCircle2, ShieldCheck, MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

interface ListaEventoPrintProps {
  evento: EventoEscolar;
  students: Student[];
  config: EscolaConfig;
  onClose: () => void;
}

export const ListaEventoPrint: React.FC<ListaEventoPrintProps> = ({
  evento,
  students,
  config,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Filtrar apenas participantes confirmados (resposta === 'sim') ou todos
  const participantesConfirmados = evento.participantes
    .filter((p) => p.resposta === 'sim')
    .sort((a, b) => {
      // Ordenar por turma e depois por nome
      if (a.turmaNome !== b.turmaNome) {
        return a.turmaNome.localeCompare(b.turmaNome);
      }
      return a.alunoNome.localeCompare(b.alunoNome);
    });

  // Mapear telefones e alergias dos alunos a partir do cadastro geral
  const getAlunoDados = (alunoId: string, alunoNome: string) => {
    const st = students.find((s) => s.id === alunoId || s.nome.toLowerCase() === alunoNome.toLowerCase());
    return {
      telefone:
        st?.responsaveis?.mae?.telefone ||
        st?.responsaveis?.pai?.telefone ||
        st?.responsaveis?.numeroEmergencia ||
        '(22) 99762-7654',
      alergias: st?.saudeERotina?.alergias || st?.saudeERotina?.restricoesAlimentares || 'Sem restrições',
      matricula: st?.matricula || '-',
    };
  };

  // Agrupamento por turma para resumo
  const resumoPorTurma: { [turma: string]: number } = {};
  participantesConfirmados.forEach((p) => {
    resumoPorTurma[p.turmaNome] = (resumoPorTurma[p.turmaNome] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex justify-center items-start p-3 sm:p-5 print-only-modal print:p-0 print:m-0 print:bg-white print:static print:inset-auto">
      {/* Estilos Globais para Impressão Perfeita A4 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .print-hidden,
          header,
          nav {
            display: none !important;
          }
        }
      `}</style>

      {/* Barra de Ações Flutuante na Tela */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md transition transform active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Lista A4</span>
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Folha Timbrada Oficial A4 */}
      <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-8 rounded-2xl shadow-2xl print:shadow-none print:p-0 print:rounded-none text-slate-900 border border-slate-200 print:border-none my-6 print:my-0 flex flex-col justify-between">
        
        <div>
          {/* CABEÇALHO OFICIAL TIMBRADO */}
          <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-center justify-between gap-4">
            <div className="shrink-0">
              <Logo size="md" />
            </div>
            <div className="text-right flex-1">
              <h1 className="text-sm sm:text-base font-black uppercase text-slate-900 tracking-wide">
                {config.nome || 'Escola Aprendendo com Amor'}
              </h1>
              {config.razaoSocial && (
                <p className="text-[10px] text-slate-600 font-bold">{config.razaoSocial}</p>
              )}
              <p className="text-[10px] text-slate-600 font-semibold">
                CNPJ: {config.cnpj} • {config.resolucao}
              </p>
              <p className="text-[9px] text-slate-500">
                {config.endereco}, {config.bairro} - {config.cidade}/{config.uf} • Tel:{' '}
                {config.telefonePrincipal}
              </p>
            </div>
          </div>

          {/* TÍTULO DO DOCUMENTO */}
          <div className="text-center py-2 px-3 bg-violet-50/80 rounded-xl border border-violet-200 mb-4">
            <h2 className="text-xs sm:text-sm font-black text-violet-950 uppercase tracking-wide">
              LISTA OFICIAL DE PRESENÇA, EMBARQUE & CONFERÊNCIA DE EVENTO ESCOLAR
            </h2>
            <p className="text-[10px] font-bold text-violet-700 mt-0.5">
              Ano Letivo de {config.anoLetivoAtivo} • Documento Pedagógico de Transporte e Acompanhamento
            </p>
          </div>

          {/* FICHA TÉCNICA DO EVENTO */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs mb-4 space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-slate-500 font-bold">Evento: </span>
                <strong className="text-slate-900 text-xs sm:text-sm font-black">
                  {evento.titulo}
                </strong>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800 border border-violet-200">
                {evento.categoria}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-500 font-bold block">Data:</span>
                <strong className="text-slate-800 font-bold">
                  {formatarDataBR(evento.dataEvento)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Horário:</span>
                <strong className="text-slate-800 font-bold">{evento.horario || 'Conforme escala'}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Local:</span>
                <strong className="text-slate-800 font-bold truncate block">{evento.local || 'Escola'}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Total Confirmados:</span>
                <strong className="text-emerald-700 font-black">
                  {participantesConfirmados.length} alunos
                </strong>
              </div>
            </div>
          </div>

          {/* RESUMO POR TURMA */}
          <div className="flex flex-wrap gap-2 mb-3 items-center text-[10px] font-bold">
            <span className="text-slate-500 uppercase tracking-wider">Quórum por Turma:</span>
            {Object.entries(resumoPorTurma).map(([turma, count]) => (
              <span
                key={turma}
                className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800"
              >
                {turma}: <strong className="text-slate-900">{count}</strong>
              </span>
            ))}
          </div>

          {/* TABELA DE ALUNOS PARTICIPANTES */}
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 px-1.5 py-1 text-center w-8">Nº</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Aluno(a)</th>
                  <th className="border border-slate-300 px-2 py-1 text-center w-20">Turma</th>
                  <th className="border border-slate-300 px-2 py-1 text-center w-24">Contato Pais</th>
                  <th className="border border-slate-300 px-2 py-1 text-center w-16">
                    {evento.ePago ? 'Pagamento' : 'Status'}
                  </th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Observações / Alergias</th>
                  <th className="border border-slate-300 px-2 py-1 text-center w-28">
                    Chegada / Embarque
                  </th>
                </tr>
              </thead>
              <tbody>
                {participantesConfirmados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-slate-300 p-4 text-center text-slate-500 font-bold">
                      Nenhum aluno com presença confirmada ainda nesta enquete.
                    </td>
                  </tr>
                ) : (
                  participantesConfirmados.map((p, idx) => {
                    const dados = getAlunoDados(p.alunoId, p.alunoNome);
                    return (
                      <tr key={p.alunoId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="border border-slate-300 px-1.5 py-1 text-center font-bold text-slate-500">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 font-bold text-slate-900">
                          {p.alunoNome}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-center font-bold text-slate-700">
                          {p.turmaNome}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-center text-slate-600 font-mono text-[9px]">
                          {dados.telefone}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-center font-black">
                          {evento.ePago ? (
                            p.statusPagamento === 'pago' ? (
                              <span className="text-emerald-700">PAGO ✓</span>
                            ) : (
                              <span className="text-amber-700">PEND.</span>
                            )
                          ) : (
                            <span className="text-emerald-700">CONF. ✓</span>
                          )}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-600 text-[9px] max-w-[150px] truncate">
                          {p.observacao ? `"${p.observacao}"` : dados.alergias}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-center text-slate-400 font-mono text-[9px]">
                          [ &nbsp; ] ___:___
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RODAPÉ OFICIAL & ASSINATURAS */}
        <div className="pt-6 mt-4 border-t border-slate-300 text-[9px] text-slate-500">
          <p className="text-center italic mb-6">
            Certifico que todos os alunos listados acima contam com autorização expressa dos responsáveis
            para participação na atividade extraclasse/evento escolar, sob coordenação pedagógica da equipe.
          </p>

          <div className="grid grid-cols-3 gap-6 text-center text-slate-800">
            <div>
              <div className="border-t border-slate-700 pt-1 font-bold text-[10px]">
                Diretoria Pedagógica
              </div>
              <span className="text-[9px] text-slate-500">Escola Aprendendo com Amor</span>
            </div>

            <div>
              <div className="border-t border-slate-700 pt-1 font-bold text-[10px]">
                Secretaria Escolar
              </div>
              <span className="text-[9px] text-slate-500">Registro & Conferência</span>
            </div>

            <div>
              <div className="border-t border-slate-700 pt-1 font-bold text-[10px]">
                Professor(a) / Monitor(a)
              </div>
              <span className="text-[9px] text-slate-500">Acompanhante do Evento</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

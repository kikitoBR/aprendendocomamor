'use client';

import React from 'react';
import { Student, EscolaConfig, BoletimAluno, DISCIPLINAS_FUNDAMENTAL_PADRAO } from '@/types';
import { formatarDataBR } from '@/utils/helpers';
import { Printer, X, Award } from 'lucide-react';

interface BoletimEscolarPrintProps {
  student: Student;
  boletim?: BoletimAluno | null;
  config: EscolaConfig;
  onClose?: () => void;
}

export const BoletimEscolarPrint: React.FC<BoletimEscolarPrintProps> = ({
  student,
  boletim,
  config,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Montar lista completa de disciplinas com notas mescladas
  const disciplinas = DISCIPLINAS_FUNDAMENTAL_PADRAO.map((discNome) => {
    const notaCadastrada = boletim?.notas?.find(
      (n) => n.disciplina.toLowerCase() === discNome.toLowerCase()
    );

    const b1 = notaCadastrada?.b1 !== undefined ? notaCadastrada.b1 : null;
    const b2 = notaCadastrada?.b2 !== undefined ? notaCadastrada.b2 : null;
    const b3 = notaCadastrada?.b3 !== undefined ? notaCadastrada.b3 : null;
    const b4 = notaCadastrada?.b4 !== undefined ? notaCadastrada.b4 : null;
    const rec = notaCadastrada?.recuperacao !== undefined ? notaCadastrada.recuperacao : null;
    const faltas = notaCadastrada?.faltas || 0;

    // Calcular Média
    const notasValidas = [b1, b2, b3, b4].filter((n): n is number => n !== null && typeof n === 'number');
    let mediaFinal: number | null = null;
    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
      mediaFinal = Number((soma / notasValidas.length).toFixed(1));
    }

    if (rec !== null && mediaFinal !== null && rec > mediaFinal) {
      mediaFinal = rec;
    }

    const mediaCorte = boletim?.mediaMinimaAprovacao || 6.0;
    let situacao = 'Cursando';
    if (notasValidas.length === 4) {
      situacao = (mediaFinal !== null && mediaFinal >= mediaCorte) ? 'Aprovado' : 'Em Recuperação';
    } else if (mediaFinal !== null) {
      situacao = mediaFinal >= mediaCorte ? 'Satisfatório' : 'Atenção';
    }

    return {
      nome: discNome,
      b1,
      b2,
      b3,
      b4,
      rec,
      faltas,
      mediaFinal,
      situacao,
    };
  });

  // Média Geral da Turma / Aluno
  const mediasValidas = disciplinas
    .map((d) => d.mediaFinal)
    .filter((m): m is number => m !== null);
  const mediaGeralGeral =
    mediasValidas.length > 0
      ? (mediasValidas.reduce((a, b) => a + b, 0) / mediasValidas.length).toFixed(1)
      : '-';

  const totalFaltasAno = disciplinas.reduce((acc, d) => acc + d.faltas, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 print-only-modal print:p-0 print:m-0 print:bg-white print:static print:inset-auto">
      {/* Estilos Globais de Impressão para Garantir 1 Página A4 Rigorosa */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
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
          .boletim-a4-page {
            height: 282mm !important;
            max-height: 282mm !important;
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

      {/* Botões Flutuantes da Tela (Ocultos na impressão) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-white/95 p-2 rounded-2xl shadow-2xl border border-slate-200 backdrop-blur">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-xl font-bold shadow-md transition text-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Boletim Oficial A4</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* DOCUMENTO OFICIAL A4 TIMBRADO */}
      <div className="boletim-a4-page bg-white w-full max-w-[210mm] min-h-[280mm] p-6 sm:p-8 rounded-3xl shadow-2xl print:shadow-none print:rounded-none print:p-0 print:max-w-none text-slate-900 border border-slate-200 print:border-none flex flex-col justify-between">
        
        {/* TOPO: Cabeçalho Oficial Timbrado */}
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="Logo Aprendendo com Amor"
                className="h-16 w-auto object-contain"
              />
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 leading-none">
                  {config.razaoSocial || config.nome}
                </h1>
                <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mt-0.5">
                  Educação Infantil & Ensino Fundamental I
                </p>
                <p className="text-[9.5px] text-slate-500 mt-0.5">
                  CNPJ: {config.cnpj} • {config.resolucao}
                </p>
                <p className="text-[9px] text-slate-500">
                  {config.endereco}, {config.bairro} – {config.cidade}/{config.uf} • Tel: {config.telefonePrincipal}
                </p>
              </div>
            </div>

            <div className="text-right border-l-2 border-orange-500 pl-4 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block">
                Documento Escolar Oficial
              </span>
              <h2 className="text-base font-black text-slate-900 uppercase">
                BOLETIM ESCOLAR
              </h2>
              <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 inline-block mt-0.5">
                Ano Letivo: {config.anoLetivoAtivo || '2026'}
              </span>
            </div>
          </div>

          {/* DADOS DE IDENTIFICAÇÃO DO ALUNO */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="col-span-2">
              <span className="text-[9.5px] font-bold uppercase text-slate-500 block">Nome do Aluno(a):</span>
              <span className="font-extrabold text-slate-900 text-sm">{student.nome}</span>
            </div>

            <div>
              <span className="text-[9.5px] font-bold uppercase text-slate-500 block">Matrícula:</span>
              <span className="font-mono font-bold text-slate-800">{student.matricula}</span>
            </div>

            <div>
              <span className="text-[9.5px] font-bold uppercase text-slate-500 block">Data de Nasc.:</span>
              <span className="font-bold text-slate-800">{formatarDataBR(student.dataNascimento)}</span>
            </div>

            <div>
              <span className="text-[9.5px] font-bold uppercase text-slate-500 block">Turma:</span>
              <span className="font-bold text-slate-800">{student.turmaNome}</span>
            </div>

            <div>
              <span className="text-[9.5px] font-bold uppercase text-slate-500 block">Turno / Horário:</span>
              <span className="font-bold text-slate-800">{student.turno} ({student.horario || '07:30 às 11:45'})</span>
            </div>

            <div className="col-span-2">
              <span className="text-[9.5px] font-bold uppercase text-slate-500 block">Filiação / Responsável:</span>
              <span className="font-bold text-slate-800 truncate block">
                {student.responsaveis?.mae?.nome || student.responsaveis?.pai?.nome || 'Responsável Cadastrado'}
              </span>
            </div>
          </div>

          {/* TABELA OFICIAL DE NOTAS BIMESTRAIS */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-orange-600" />
                Rendimento Escolar e Frequência por Disciplina
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                Média Mínima para Aprovação: <strong>6,0</strong>
              </span>
            </div>

            <div className="overflow-hidden border-2 border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold text-[10.5px] uppercase text-center">
                    <th className="p-2 text-left w-5/12 pl-3">Componente Curricular</th>
                    <th className="p-2 w-1/12 border-l border-slate-700">1º Bim</th>
                    <th className="p-2 w-1/12 border-l border-slate-700">2º Bim</th>
                    <th className="p-2 w-1/12 border-l border-slate-700">3º Bim</th>
                    <th className="p-2 w-1/12 border-l border-slate-700">4º Bim</th>
                    <th className="p-2 w-1/12 border-l border-slate-700">Rec.</th>
                    <th className="p-2 w-1/12 border-l border-slate-700 bg-orange-600 text-white">Média</th>
                    <th className="p-2 w-1/12 border-l border-slate-700">Faltas</th>
                    <th className="p-2 w-2/12 border-l border-slate-700">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {disciplinas.map((disc, idx) => {
                    const isMediaBaixa = disc.mediaFinal !== null && disc.mediaFinal < 6.0;

                    return (
                      <tr
                        key={idx}
                        className={`text-center transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                        }`}
                      >
                        <td className="p-2 text-left font-bold text-slate-900 pl-3">
                          {disc.nome}
                        </td>
                        <td className="p-2 border-l border-slate-200 font-semibold">
                          {disc.b1 !== null ? (
                            <span className={disc.b1 < 6.0 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                              {disc.b1.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200 font-semibold">
                          {disc.b2 !== null ? (
                            <span className={disc.b2 < 6.0 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                              {disc.b2.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200 font-semibold">
                          {disc.b3 !== null ? (
                            <span className={disc.b3 < 6.0 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                              {disc.b3.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200 font-semibold">
                          {disc.b4 !== null ? (
                            <span className={disc.b4 < 6.0 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                              {disc.b4.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200 font-semibold text-amber-700">
                          {disc.rec !== null ? disc.rec.toFixed(1) : '-'}
                        </td>
                        <td className="p-2 border-l border-slate-200 font-black bg-orange-50/50">
                          {disc.mediaFinal !== null ? (
                            <span className={isMediaBaixa ? 'text-rose-600' : 'text-slate-900'}>
                              {disc.mediaFinal.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200 text-slate-700">
                          {disc.faltas}
                        </td>
                        <td className="p-2 border-l border-slate-200 text-[10.5px] font-bold">
                          <span
                            className={
                              disc.situacao === 'Aprovado' || disc.situacao === 'Satisfatório'
                                ? 'text-emerald-700'
                                : disc.situacao === 'Em Recuperação' || disc.situacao === 'Atenção'
                                ? 'text-amber-700'
                                : 'text-slate-500'
                            }
                          >
                            {disc.situacao}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-black text-xs text-slate-900 border-t-2 border-slate-800 text-center">
                    <td className="p-2.5 text-left pl-3 uppercase">Média Geral & Total de Faltas:</td>
                    <td colSpan={5} className="p-2 text-right text-[11px] text-slate-500 font-bold pr-3">
                      Resultado Consolidado:
                    </td>
                    <td className="p-2 bg-orange-100 text-orange-950 font-black text-sm border-l border-slate-300">
                      {mediaGeralGeral}
                    </td>
                    <td className="p-2 border-l border-slate-300 font-black text-slate-800">
                      {totalFaltasAno}
                    </td>
                    <td className="p-2 border-l border-slate-300 text-[11px] font-black text-emerald-800">
                      {Number(mediaGeralGeral) >= 6.0 ? 'EM DIA ✓' : 'EM CURSO'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* OBSERVAÇÕES PEDAGÓGICAS */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Observações & Parecer da Coordenação Pedagógica:
            </span>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              {boletim?.observacoesGerais ||
                'O aluno apresenta participação exemplar nas aulas, com ótimo desenvolvimento pedagógico, respeito às normas escolares e convivência fraterna com colegas e professores.'}
            </p>
          </div>
        </div>

        {/* RODAPÉ: Critérios de Avaliação e Assinaturas Oficiais */}
        <div className="space-y-4 pt-4 border-t border-slate-300">
          <div className="grid grid-cols-3 gap-2 text-[9.5px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <strong>Critério 1:</strong> Média mínima para aprovação semestral/final = <strong>6,0 (seis)</strong>.
            </div>
            <div>
              <strong>Critério 2:</strong> Frequência mínima obrigatória anual = <strong>75% dos dias letivos</strong>.
            </div>
            <div>
              <strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
            </div>
          </div>

          {/* CAMPOS DE ASSINATURA */}
          <div className="grid grid-cols-3 gap-6 pt-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-full border-t border-slate-900 mb-1" />
              <span className="text-xs font-black text-slate-900 uppercase">
                Diretoria Pedagógica
              </span>
              <span className="text-[9.5px] text-slate-500">Escola Aprendendo com Amor</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-slate-900 mb-1" />
              <span className="text-xs font-black text-slate-900 uppercase">
                Secretaria Escolar
              </span>
              <span className="text-[9.5px] text-slate-500">Registro & Matrículas</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-slate-900 mb-1" />
              <span className="text-xs font-black text-slate-900 uppercase">
                Responsável pelo Aluno
              </span>
              <span className="text-[9.5px] text-slate-500">Ciente do Rendimento</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

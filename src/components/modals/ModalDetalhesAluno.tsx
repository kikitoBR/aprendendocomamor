'use client';

import React, { useState } from 'react';
import { Student, Mensalidade, EscolaConfig, FormaPagamento } from '@/types';
import { formatarMoeda, formatarDataBR, linkWhatsApp, gerarMensagemCobrancaAmigavel } from '@/utils/helpers';
import { useSchool } from '@/context/SchoolContext';
import {
  X,
  Printer,
  FileText,
  Edit,
  Trash2,
  Phone,
  MessageCircle,
  MapPin,
  Heart,
  Calendar,
  CreditCard,
  DollarSign,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface ModalDetalhesAlunoProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  mensalidades: Mensalidade[];
  config: EscolaConfig;
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onPrintFicha: (student: Student) => void;
  onPrintCarne: (student: Student) => void;
  onOpenBaixa: (mensalidade: Mensalidade, student: Student) => void;
  onOpenRecibo: (mensalidade: Mensalidade, student: Student) => void;
  onEstornar: (mensalidadeId: string) => void;
}

export const ModalDetalhesAluno: React.FC<ModalDetalhesAlunoProps> = ({
  isOpen,
  onClose,
  student,
  mensalidades,
  config,
  onEdit,
  onDelete,
  onPrintFicha,
  onPrintCarne,
  onOpenBaixa,
  onOpenRecibo,
  onEstornar,
}) => {
  const { currentRole } = useSchool();
  const [activeTab, setActiveTab] = useState<'geral' | 'financeiro' | 'saude' | 'renovacoes'>('geral');

  if (!isOpen || !student) return null;

  const isProfessor = currentRole === 'professor';

  const mensalidadesAluno = mensalidades
    .filter((m) => m.alunoId === student.id)
    .sort((a, b) => a.mesIndex - b.mesIndex);

  const totalPago = mensalidadesAluno
    .filter((m) => m.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valorFinal, 0);

  const totalPendente = mensalidadesAluno
    .filter((m) => m.status !== 'Pago' && m.status !== 'Cancelado')
    .reduce((acc, curr) => acc + curr.valorFinal, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Banner do Aluno */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            {/* Foto */}
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden shrink-0 shadow-lg flex items-center justify-center">
              {student.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.fotoUrl} alt={student.nome} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-xs text-amber-300">FOTO 3x4</span>
              )}
            </div>

            {/* Info Principal */}
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Matrícula: {student.matricula}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {student.status}
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {student.turno}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
                {student.nome}
              </h2>

              <p className="text-xs text-slate-300">
                Turma: <strong className="text-white">{student.turmaNome}</strong> • Nasc:{' '}
                <strong className="text-white">{formatarDataBR(student.dataNascimento)}</strong> ({student.idadeCalculada || 'Idade'})
              </p>
            </div>

            {/* Ações de Impressão / Edição no Topo */}
            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 self-stretch sm:self-center">
              <button
                onClick={() => onPrintFicha(student)}
                className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-3 py-2 rounded-xl text-xs shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                <span>Ficha Oficial</span>
              </button>

              {!isProfessor && (
                <button
                  onClick={() => onPrintCarne(student)}
                  className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-xl text-xs border border-white/20 transition"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Carnê 2026</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resumo Financeiro no Topo (APENAS DIRETORIA E SECRETARIA) */}
        {!isProfessor && (
          <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 sm:gap-6">
              <div>
                <span className="text-slate-500 text-[11px]">Mensalidade Padrão:</span>
                <strong className="text-slate-900 ml-1.5 font-mono">{formatarMoeda(student.valorMensalidadePadrao)}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Total Quitado:</span>
                <strong className="text-emerald-700 ml-1.5 font-mono">{formatarMoeda(totalPago)}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Pendente:</span>
                <strong className="text-amber-700 ml-1.5 font-mono">{formatarMoeda(totalPendente)}</strong>
              </div>
            </div>

            {student.responsaveis.mae.telefone && (
              <a
                href={linkWhatsApp(
                  student.responsaveis.mae.telefone,
                  `Olá ${student.responsaveis.mae.nome}! Secretaria da Escola Aprendendo com Amor entrando em contato a respeito do aluno(a) ${student.nome}.`
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Família
              </a>
            )}
          </div>
        )}

        {/* Navegação por Abas */}
        <div className="border-b border-slate-200 px-4 sm:px-6 flex gap-2 sm:gap-4 overflow-x-auto bg-white shrink-0">
          <button
            onClick={() => setActiveTab('geral')}
            className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
              activeTab === 'geral'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dados & Filiação
          </button>

          <button
            onClick={() => setActiveTab('saude')}
            className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'saude'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Saúde & Autorizações
          </button>

          {!isProfessor && (
            <>
              <button
                onClick={() => setActiveTab('financeiro')}
                className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'financeiro'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Mensalidades ({mensalidadesAluno.length})
              </button>

              <button
                onClick={() => setActiveTab('renovacoes')}
                className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
                  activeTab === 'renovacoes'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Histórico de Matrícula
              </button>
            </>
          )}
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ABA GERAL: DADOS CADASTRAIS & FILIAÇÃO */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              {/* Documentos & Certidão */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Documentação Civil & Certidão
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">CPF do Aluno:</span>
                    <strong className="text-slate-800 font-mono">{student.cpf || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">RG / Identidade:</span>
                    <strong className="text-slate-800">{student.identidade || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nacionalidade / Sexo:</span>
                    <strong className="text-slate-800">{student.nacionalidade} ({student.sexo === 'M' ? 'Masculino' : 'Feminino'})</strong>
                  </div>
                </div>
              </div>

              {/* Filiação & Contatos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mãe */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider bg-pink-50 px-2 py-0.5 rounded-md">
                    Dados da Mãe
                  </span>
                  <p className="text-sm font-black text-slate-900">{student.responsaveis.mae.nome || 'Não informada'}</p>
                  <p className="text-xs text-slate-600">
                    Telefone: <strong>{student.responsaveis.mae.telefone || 'Não informado'}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Trabalho: {student.responsaveis.mae.localTrabalho || '-'}
                  </p>
                </div>

                {/* Pai */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                    Dados do Pai
                  </span>
                  <p className="text-sm font-black text-slate-900">{student.responsaveis.pai.nome || 'Não informado'}</p>
                  <p className="text-xs text-slate-600">
                    Telefone: <strong>{student.responsaveis.pai.telefone || 'Não informado'}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Trabalho: {student.responsaveis.pai.localTrabalho || '-'}
                  </p>
                </div>
              </div>

              {/* Telefones de Emergência & Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2 text-xs">
                  <h4 className="font-black text-amber-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    Contatos de Emergência
                  </h4>
                  <p className="text-slate-800 font-bold">
                    Principal: {student.responsaveis.numeroEmergencia || 'Não informado'}
                  </p>
                  <p className="text-slate-800 font-bold">
                    Reserva: {student.responsaveis.numeroReserva || 'Não informado'}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-600" />
                    Endereço Residencial
                  </h4>
                  <p className="text-slate-700">
                    {student.endereco.rua}, nº {student.endereco.numeroCasa} {student.endereco.complemento && `(${student.endereco.complemento})`}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Bairro {student.endereco.bairro} • {student.endereco.cidade}/{student.endereco.uf} - CEP {student.endereco.cep}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABA SAÚDE & ROTINA */}
          {activeTab === 'saude' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <h4 className="font-black text-xs text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-600" />
                    Alergias Conhecidas
                  </h4>
                  <p className="text-xs font-bold text-slate-800">
                    {student.saudeERotina.alergias || 'Nenhuma alergia relatada'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <h4 className="font-black text-xs text-amber-800 uppercase tracking-wider">
                    Restrições Alimentares
                  </h4>
                  <p className="text-xs font-bold text-slate-800">
                    {student.saudeERotina.restricoesAlimentares || 'Sem restrições alimentares'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                  Pessoas Autorizadas a Buscar a Criança na Escola
                </h4>
                <p className="text-xs font-bold text-slate-800">
                  {student.saudeERotina.pessoasAutorizadasBusca || 'Apenas os pais/responsáveis'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                  Medicamentos de Uso Contínuo & Cuidados Especiais
                </h4>
                <p className="text-xs text-slate-700">
                  {student.saudeERotina.medicamentosUsoContinuo || 'Nenhum medicamento contínuo'}
                </p>
              </div>
            </div>
          )}

          {/* ABA FINANCEIRO (APENAS DIRETORIA E SECRETARIA) */}
          {!isProfessor && activeTab === 'financeiro' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Parcela</th>
                      <th className="p-3">Mês de Referência</th>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mensalidadesAluno.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold">{String(m.numeroParcela).padStart(2, '0')}/12</td>
                        <td className="p-3 font-bold text-slate-800">{m.mesReferencia}</td>
                        <td className="p-3 text-slate-600">{formatarDataBR(m.dataVencimento)}</td>
                        <td className="p-3 font-black text-slate-900 font-mono">{formatarMoeda(m.valorFinal)}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              m.status === 'Pago'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'Atrasado'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {m.status !== 'Pago' ? (
                              <button
                                onClick={() => onOpenBaixa(m, student)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition shadow-xs"
                              >
                                Baixar
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpenRecibo(m, student)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                title="Imprimir Recibo"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA RENOVAÇÕES & HISTÓRICO (APENAS DIRETORIA E SECRETARIA) */}
          {!isProfessor && activeTab === 'renovacoes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                  Histórico de Matrícula Anual
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Histórico oficial de rematrículas registrado na ficha timbrada.
                </p>
                <div className="mt-3 space-y-2">
                  {student.renovacoes?.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong>Ano Letivo {r.ano}</strong> • Turma: {r.turma} ({r.idade})
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">Data: {r.dataRenovacao}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {!isProfessor ? (
            <button
              onClick={() => onDelete(student.id)}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Matrícula
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {!isProfessor && (
              <button
                onClick={() => onEdit(student)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                <Edit className="w-3.5 h-3.5" />
                Editar Dados
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

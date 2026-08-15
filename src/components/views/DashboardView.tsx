'use client';

import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { formatarMoeda, formatarDataBR, linkWhatsApp } from '@/utils/helpers';
import {
  Users,
  DollarSign,
  GraduationCap,
  Calendar,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Cake,
  Megaphone,
  Printer,
  MessageCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Receipt,
  Heart,
  BookOpen,
  ClipboardList,
} from 'lucide-react';
import { Student, Mensalidade } from '@/types';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenNovoAluno: () => void;
  onSelectStudent: (student: Student) => void;
  onOpenBaixa: (mensalidade: Mensalidade, student: Student) => void;
  onOpenRecibo: (mensalidade: Mensalidade, student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenNovoAluno,
  onSelectStudent,
  onOpenBaixa,
  onOpenRecibo,
}) => {
  const { config, students, turmas, mensalidades, despesas, avisos, addAviso, deleteAviso, currentRole } = useSchool();
  const [novoAvisoTexto, setNovoAvisoTexto] = useState('');
  const [novoAvisoTitulo, setNovoAvisoTitulo] = useState('');
  const [mostrarNovoAviso, setMostrarNovoAviso] = useState(false);

  const mesAtualIndex = new Date().getMonth() + 1; // 1 a 12 (ex: Fevereiro = 2)

  // Mensalidades deste mês (apenas para Diretoria / Secretaria)
  const mensalidadesDoMes = mensalidades.filter((m) => m.mesIndex === mesAtualIndex && m.ano === 2026);
  const totalRecebidoMes = mensalidadesDoMes
    .filter((m) => m.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valorFinal, 0);

  const totalPrevistoMes = mensalidadesDoMes.reduce((acc, curr) => acc + curr.valorFinal, 0);
  const totalPendenteMes = mensalidadesDoMes
    .filter((m) => m.status !== 'Pago' && m.status !== 'Cancelado')
    .reduce((acc, curr) => acc + curr.valorFinal, 0);

  const taxaAdimplencia = totalPrevistoMes > 0 ? Math.round((totalRecebidoMes / totalPrevistoMes) * 100) : 100;

  // Despesas deste mês
  const despesasDoMes = despesas.filter((d) => d.mesIndex === mesAtualIndex && d.ano === 2026);
  const totalDespesasPagasMes = despesasDoMes
    .filter((d) => d.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valor, 0);
  const saldoLiquidoMes = totalRecebidoMes - totalDespesasPagasMes;

  // Metas da Planilha Oficial
  const metaFaturamento = config.metaFaturamentoMensal || 24650.0;
  const pctMetaAtingida = Math.min(100, Math.round((totalRecebidoMes / metaFaturamento) * 100));
  const ticketMedioGeral = students.length > 0 ? totalPrevistoMes / students.length : 387.04;
  const totalIntegrais = students.filter((s) => s.turno === 'Integral').length;

  // Alunos Ativos
  const alunosAtivos = students.filter((s) => s.status === 'Ativo');

  // Alunos com Cuidados de Saúde / Alergias
  const alunosComAtencaoSaude = students.filter(
    (s) => s.saudeERotina && (s.saudeERotina.alergias || s.saudeERotina.restricoesAlimentares || s.saudeERotina.medicamentosUsoContinuo)
  );

  // Aniversariantes do Mês
  const aniversariantesDoMes = students.filter((s) => {
    if (!s.dataNascimento) return false;
    const mesNasc = new Date(s.dataNascimento).getMonth() + 1;
    return mesNasc === mesAtualIndex;
  });

  // Mensalidades recentes pagas
  const ultimosPagamentos = mensalidades
    .filter((m) => m.status === 'Pago')
    .slice(0, 4);

  const handleCriarAviso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAvisoTitulo.trim() || !novoAvisoTexto.trim()) return;
    addAviso({
      titulo: novoAvisoTitulo,
      mensagem: novoAvisoTexto,
      tipo: 'Geral',
      data: new Date().toLocaleDateString('pt-BR'),
      autor: currentRole === 'diretoria' ? 'Diretoria' : currentRole === 'secretaria' ? 'Secretaria' : 'Professor(a)',
      fixado: false,
    });
    setNovoAvisoTitulo('');
    setNovoAvisoTexto('');
    setMostrarNovoAviso(false);
  };

  // ==========================================
  // VISÃO EXCLUSIVA DO PROFESSOR (100% PEDAGÓGICA)
  // ==========================================
  if (currentRole === 'professor') {
    return (
      <div className="space-y-6 pb-12">
        {/* Banner do Educador */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 p-6 sm:p-8 text-white shadow-xl shadow-teal-600/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-wider text-white">
                <BookOpen className="w-3.5 h-3.5" />
                Painel Pedagógico • Ano Letivo {config.anoLetivoAtivo}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Olá, Professor(a)! 📚✨
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
                Acompanhe as presenças da sua turma, registros de atividades no diário e aniversariantes da semana.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateTab('frequencia')}
                className="flex items-center gap-2 bg-white text-teal-800 hover:bg-emerald-50 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" />
                Realizar Chamada Hoje
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Cards Pedagógicos (Foco em Chamada, Aniversariantes e Diário de Classe) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigateTab('frequencia')}
            className="cursor-pointer group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chamada da Turma</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">Frequência Diária</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
              <span>Lançar presenças e faltas</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aniversariantes do Mês</span>
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <Cake className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{aniversariantesDoMes.length}</span>
              <span className="text-xs text-slate-500 font-medium">comemorações</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Cantar parabéns na sala de aula 🎂
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('frequencia')}
            className="cursor-pointer group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diário de Classe</span>
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-700">Conteúdos</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-bold">
              <span>Registrar atividades da aula</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Grid Pedagógico: Atalhos + Aniversariantes & Mural */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {/* Ações Pedagógicas */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Rotina do Educador
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigateTab('frequencia')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 flex items-center gap-3 transition text-left group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Fazer Chamada Diária</h4>
                    <p className="text-[11px] text-slate-500">Marcar presenças e faltas da turma</p>
                  </div>
                </button>

                <button
                  onClick={() => onNavigateTab('frequencia')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 flex items-center gap-3 transition text-left group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Diário de Bordo & Aulas</h4>
                    <p className="text-[11px] text-slate-500">Anotar conteúdo ministrado no dia</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Avisos Pedagógicos */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-teal-600" />
                  Mural de Avisos da Escola
                </h3>
              </div>

              <div className="space-y-2.5">
                {avisos.map((aviso) => (
                  <div
                    key={aviso.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">{aviso.titulo}</span>
                      <span className="text-[10px] text-slate-400">{aviso.data}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{aviso.mensagem}</p>
                    <div className="pt-1 text-[10px] text-slate-400">
                      <span>Por: {aviso.autor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Aniversariantes */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center">
                  <Cake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Aniversariantes da Escola</h3>
                  <p className="text-[11px] text-slate-500">Mês vigente • {aniversariantesDoMes.length} crianças</p>
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {aniversariantesDoMes.map((aluno) => {
                  const dataNascFmt = aluno.dataNascimento
                    ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    : '--/--';
                  return (
                    <div
                      key={aluno.id}
                      className="bg-white/80 backdrop-blur rounded-2xl p-3 border border-pink-200/60 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-black text-xs">
                          🎂
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{aluno.nome}</p>
                          <p className="text-[10px] text-slate-500">
                            {aluno.turmaNome} • Dia {dataNascFmt}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md">
                        {aluno.idadeCalculada || 'Aniversariante'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISÃO DA DIRETORIA E SECRETARIA
  // ==========================================
  return (
    <div className="space-y-6 pb-12">
      {/* Banner de Boas-Vindas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 sm:p-8 text-white shadow-xl shadow-orange-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-wider text-white">
              <Sparkles className="w-3.5 h-3.5" />
              Ano Letivo {config.anoLetivoAtivo} • Campos dos Goytacazes/RJ
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              Bem-vindo(a) ao painel da {config.nome}! 🌈
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Gestão integrada de {students.length} matrículas, carnês de mensalidades, despesas operacionais e documentos oficiais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNovoAluno}
              className="flex items-center gap-2 bg-white text-orange-600 hover:bg-amber-50 font-black px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition transform active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Nova Matrícula
            </button>
            {currentRole === 'diretoria' && (
              <button
                onClick={() => onNavigateTab('despesas')}
                className="flex items-center gap-2 bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur font-bold px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm border border-white/20 transition shrink-0"
              >
                <Receipt className="w-4 h-4 text-amber-300" />
                DRE & Despesas
              </button>
            )}
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Indicadores Executivos (Índice da Escola - Apenas Diretoria) */}
      {currentRole === 'diretoria' && (
        <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-100">
                  Metas de Faturamento & Capacidade (Índice Oficial)
                </h3>
                <p className="text-[11px] text-slate-400">Indicadores gerenciais conforme a planilha de planejamento</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0">
              <span className="text-xs font-bold text-slate-400">Meta do Mês:</span>
              <span className="font-black text-amber-400 font-mono text-xs sm:text-sm">{formatarMoeda(metaFaturamento)}</span>
            </div>
          </div>

          {/* Barra de Progresso da Meta */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
              <span className="text-slate-300 font-medium">Progresso da Meta de Faturamento ({pctMetaAtingida}%)</span>
              <span className="text-orange-400 font-bold font-mono text-xs">
                {formatarMoeda(totalRecebidoMes)} / {formatarMoeda(metaFaturamento)}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${pctMetaAtingida}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="bg-slate-800/80 rounded-2xl p-3 sm:p-3.5 border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Médio Geral</span>
              <span className="text-base sm:text-lg font-black text-white font-mono">{formatarMoeda(ticketMedioGeral)}</span>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-3 sm:p-3.5 border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Alunos em Integral</span>
              <span className="text-base sm:text-lg font-black text-amber-400">{totalIntegrais} alunos</span>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-3 sm:p-3.5 border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Despesas Pagas no Mês</span>
              <span className="text-base sm:text-lg font-black text-rose-400 font-mono">{formatarMoeda(totalDespesasPagasMes)}</span>
            </div>

<div className="bg-slate-800/80 rounded-2xl p-3 sm:p-3.5 border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Operacional Líquido</span>
              <span className={`text-base sm:text-lg font-black font-mono ${saldoLiquidoMes >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatarMoeda(saldoLiquidoMes)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Alunos */}
        <div
          onClick={() => onNavigateTab('alunos')}
          className="cursor-pointer group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alunos Ativos</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{alunosAtivos.length}</span>
            <span className="text-xs text-slate-500 font-medium">matriculados</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-orange-600 font-bold">
            <span>Ver listagem completa</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Visão Diretoria (Recebido) vs Secretaria (Aniversariantes) */}
        {currentRole === 'diretoria' ? (
          <div
            onClick={() => onNavigateTab('financeiro')}
            className="cursor-pointer group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recebido no Mês</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {formatarMoeda(totalRecebidoMes)}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Previsto: {formatarMoeda(totalPrevistoMes)}</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{taxaAdimplencia}%</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aniversariantes</span>
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <Cake className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-pink-700">{aniversariantesDoMes.length}</span>
              <span className="text-xs text-slate-500 font-medium">este mês</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-pink-700 font-bold">
              <span>Comemorações 🎂</span>
            </div>
          </div>
        )}

        {/* Card 3: Visão Diretoria (Pendente) vs Secretaria (Saúde & Alergias) */}
        {currentRole === 'diretoria' ? (
          <div
            onClick={() => onNavigateTab('financeiro')}
            className="cursor-pointer group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">A Receber / Pendente</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700 font-mono">
                {formatarMoeda(totalPendenteMes)}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-bold">
              <span>Lembretes WhatsApp</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div
            onClick={() => onNavigateTab('alunos')}
            className="cursor-pointer group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Atenção Médica / Saúde</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
                <Heart className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-700">{alunosComAtencaoSaude.length}</span>
              <span className="text-xs text-slate-500 font-medium">com cuidados</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 font-bold">
              <span>Alergias & Restrições</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Card 4: Turmas Ativas */}
        <div
          onClick={() => onNavigateTab('turmas')}
          className="cursor-pointer group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turmas Escolares</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{turmas.length}</span>
            <span className="text-xs text-slate-500 font-medium">turmas ativas</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
            <span>Gerenciar salas & vagas</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Grid Central: Ações Rápidas + Aniversariantes & Mural */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Coluna Esquerda: Ações Rápidas & Pagamentos Recentes / Cuidados (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card de Ações Rápidas da Secretaria */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Ações Rápidas do Dia
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={onOpenNovoAluno}
                className="p-3 rounded-2xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 flex flex-col items-center text-center gap-2 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Nova Matrícula</span>
              </button>

              <button
                onClick={() => onNavigateTab('frequencia')}
                className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center text-center gap-2 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Fazer Chamada</span>
              </button>

              {currentRole === 'diretoria' ? (
                <button
                  onClick={() => onNavigateTab('financeiro')}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 flex flex-col items-center text-center gap-2 transition group col-span-2 sm:col-span-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Baixar Mensalidade</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab('alunos')}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-center text-center gap-2 transition group col-span-2 sm:col-span-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Fichas de Alunos</span>
                </button>
              )}
            </div>
          </div>

          {/* Diretoria: Últimos Pagamentos | Secretaria: Alunos com Cuidados de Saúde */}
          {currentRole === 'diretoria' ? (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Últimos Pagamentos Confirmados
                </h3>
                <button
                  onClick={() => onNavigateTab('financeiro')}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Ver todos
                </button>
              </div>

              {ultimosPagamentos.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Nenhum pagamento registrado ainda neste mês.</p>
              ) : (
                <div className="space-y-2">
                  {ultimosPagamentos.map((m) => {
                    const student = students.find((s) => s.id === m.alunoId);
                    return (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-extrabold text-slate-900 truncate">{m.alunoNome}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {m.turmaNome} • {m.mesReferencia}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <div className="text-right">
                            <span className="font-black text-emerald-700 font-mono block text-xs sm:text-sm">
                              {formatarMoeda(m.valorFinal)}
                            </span>
                            <span className="text-[10px] text-slate-400">{m.formaPagamento || 'PIX'}</span>
                          </div>
                          {student && (
                            <button
                              onClick={() => onOpenRecibo(m, student)}
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-500 transition"
                              title="Imprimir Recibo"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-current" />
                  Alunos com Cuidados Especiais de Saúde & Alergias
                </h3>
                <button
                  onClick={() => onNavigateTab('alunos')}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Ver Fichas
                </button>
              </div>

              {alunosComAtencaoSaude.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Nenhum aluno com restrições ou alergias cadastradas.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {alunosComAtencaoSaude.map((aluno) => (
                    <div
                      key={aluno.id}
                      onClick={() => onSelectStudent(aluno)}
                      className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100/80 flex items-start justify-between gap-3 text-xs cursor-pointer hover:bg-rose-50 transition"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 truncate">{aluno.nome}</span>
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {aluno.turmaNome}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          <strong>Alergia/Alimentação:</strong> {aluno.saudeERotina.alergias || aluno.saudeERotina.restricoesAlimentares || aluno.saudeERotina.medicamentosUsoContinuo}
                        </p>
                      </div>
                      <span className="text-[10px] text-rose-700 font-bold bg-white px-2 py-1 rounded-lg border border-rose-200 shrink-0">
                        Ver Ficha
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coluna Direita: Aniversariantes & Mural de Avisos (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Aniversariantes do Mês */}
          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center">
                  <Cake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Aniversariantes do Mês</h3>
                  <p className="text-[11px] text-slate-500">Mês vigente • {aniversariantesDoMes.length} crianças</p>
                </div>
              </div>
            </div>

            {aniversariantesDoMes.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">Nenhum aniversariante neste mês.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {aniversariantesDoMes.map((aluno) => {
                  const dataNascFmt = aluno.dataNascimento
                    ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    : '--/--';
                  const telMae = aluno.responsaveis?.mae?.telefone || aluno.responsaveis?.numeroEmergencia;
                  const linkZap = telMae
                    ? linkWhatsApp(
                        telMae,
                        `Olá querida família! A equipe da Escola Aprendendo com Amor deseja um feliz aniversário para o(a) ${aluno.nome}! 🎉🎂 Que seja um ano repleto de amor, brincadeiras e muito aprendizado! 🌈❤️`
                      )
                    : null;

                  return (
                    <div
                      key={aluno.id}
                      className="bg-white/80 backdrop-blur rounded-2xl p-3 border border-pink-200/60 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-black text-xs shrink-0">
                          🎂
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-900 truncate">{aluno.nome}</p>
                          <p className="text-[10px] text-slate-500">
                            {aluno.turmaNome} • Dia {dataNascFmt}
                          </p>
                        </div>
                      </div>

                      {linkZap && (
                        <a
                          href={linkZap}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px] transition shadow-xs shrink-0"
                          title="Enviar Parabéns no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Parabenizar</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mural de Comunicados da Escola */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500" />
                Mural de Avisos
              </h3>
              <button
                onClick={() => setMostrarNovoAviso(!mostrarNovoAviso)}
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                {mostrarNovoAviso ? 'Fechar' : '+ Novo Aviso'}
              </button>
            </div>

            {mostrarNovoAviso && (
              <form onSubmit={handleCriarAviso} className="p-3 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-2">
                <input
                  type="text"
                  placeholder="Título do aviso..."
                  value={novoAvisoTitulo}
                  onChange={(e) => setNovoAvisoTitulo(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-orange-200 bg-white"
                  required
                />
                <textarea
                  placeholder="Escreva a mensagem para o mural..."
                  value={novoAvisoTexto}
                  onChange={(e) => setNovoAvisoTexto(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-orange-200 bg-white"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarNovoAviso(false)}
                    className="px-3 py-1 text-xs text-slate-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
                  >
                    Publicar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {avisos.map((aviso) => (
                <div
                  key={aviso.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{aviso.titulo}</span>
                    <span className="text-[10px] text-slate-400">{aviso.data}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{aviso.mensagem}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Por: {aviso.autor}</span>
                    {['diretoria', 'secretaria'].includes(currentRole) && (
                      <button
                        onClick={() => deleteAviso(aviso.id)}
                        className="text-rose-500 hover:underline opacity-0 group-hover:opacity-100 transition"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

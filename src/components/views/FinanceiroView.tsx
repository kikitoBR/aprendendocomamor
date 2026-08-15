'use client';

import React, { useState, useMemo } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Mensalidade, Student, FormaPagamento } from '@/types';
import { formatarMoeda, formatarDataBR, linkWhatsApp, gerarMensagemCobrancaAmigavel, mesesAno } from '@/utils/helpers';
import * as XLSX from 'xlsx';
import {
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Download,
  Printer,
  MessageCircle,
  FileText,
  RotateCcw,
  Plus,
  Filter,
  ArrowUpDown,
  X,
  CreditCard,
  Building2,
  Users,
} from 'lucide-react';

import { ModalConfirmacao } from '@/components/modals/ModalConfirmacao';

interface FinanceiroViewProps {
  onOpenBaixa: (mensalidade: Mensalidade, student: Student) => void;
  onOpenRecibo: (mensalidade: Mensalidade, student: Student) => void;
}

type StatusFiltro = 'todos' | 'Pago' | 'Pendente' | 'Atrasado';
type OrdenacaoTipo = 'nome-asc' | 'nome-desc' | 'vencimento-asc' | 'vencimento-desc' | 'valor-desc' | 'valor-asc';

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({
  onOpenBaixa,
  onOpenRecibo,
}) => {
  const { mensalidades, students, turmas, config, estornarMensalidade, currentRole } = useSchool();

  // Estados dos Filtros
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1); // 1 a 12 (0 = Ano Todo)
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todos');
  const [turmaFiltro, setTurmaFiltro] = useState<string>('todas');
  const [turnoFiltro, setTurnoFiltro] = useState<'todos' | 'Manhã' | 'Tarde' | 'Integral'>('todos');
  const [formaPgtoFiltro, setFormaPgtoFiltro] = useState<string>('todas');
  const [buscaGeral, setBuscaGeral] = useState('');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoTipo>('nome-asc');
  const [mensalidadeToEstorno, setMensalidadeToEstorno] = useState<Mensalidade | null>(null);

  const listaMeses = mesesAno();
  const hojeStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Helper para verificar atraso
  const isAtrasada = (m: Mensalidade) => {
    if (m.status === 'Pago' || m.status === 'Cancelado') return false;
    return m.dataVencimento < hojeStr;
  };

  // Base do mês selecionado
  const mensalidadesDoMes = useMemo(() => {
    return mesSelecionado === 0 ? mensalidades : mensalidades.filter((m) => m.mesIndex === mesSelecionado);
  }, [mensalidades, mesSelecionado]);

  // Contadores para os botões de status do período
  const contadoresStatus = useMemo(() => {
    const total = mensalidadesDoMes.length;
    const pagas = mensalidadesDoMes.filter((m) => m.status === 'Pago').length;
    const atrasadas = mensalidadesDoMes.filter(isAtrasada).length;
    const aVencer = mensalidadesDoMes.filter((m) => m.status !== 'Pago' && !isAtrasada(m)).length;

    return { total, pagas, atrasadas, aVencer };
  }, [mensalidadesDoMes, hojeStr]);

  // Mapa de alunos para busca rápida multicampo
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  // Filtragem e Ordenação Principal
  const mensalidadesFiltradas = useMemo(() => {
    return mensalidades.filter((m) => {
      // 1. Filtro de Mês
      if (mesSelecionado !== 0 && m.mesIndex !== mesSelecionado) return false;

      // 2. Filtro de Status
      if (statusFiltro === 'Pago' && m.status !== 'Pago') return false;
      if (statusFiltro === 'Atrasado' && !isAtrasada(m)) return false;
      if (statusFiltro === 'Pendente' && (m.status === 'Pago' || isAtrasada(m))) return false;

      // 3. Filtro de Turma
      const aluno = studentMap.get(m.alunoId);
      if (turmaFiltro !== 'todas') {
        if (aluno) {
          if (aluno.turmaId !== turmaFiltro) return false;
        } else {
          // Fallback caso o aluno não esteja no mapa, comparar por nome da turma
          const turmaObj = turmas.find((t) => t.id === turmaFiltro);
          if (turmaObj && m.turmaNome !== turmaObj.nome) return false;
        }
      }

      // 4. Filtro de Turno (via aluno)
      if (turnoFiltro !== 'todos' && aluno && aluno.turno !== turnoFiltro) return false;

      // 5. Filtro de Forma de Pagamento
      if (formaPgtoFiltro !== 'todas') {
        if (formaPgtoFiltro === 'Pendente' && m.status === 'Pago') return false;
        if (formaPgtoFiltro !== 'Pendente' && m.formaPagamento !== formaPgtoFiltro) return false;
      }

      // 6. Busca Multicampo Inteligente (Aluno, Mãe, Pai, CPF, Recibo)
      if (buscaGeral.trim() !== '') {
        const termo = buscaGeral.toLowerCase().trim();
        const nomeAlunoMatch = m.alunoNome.toLowerCase().includes(termo);
        const reciboMatch = m.numeroRecibo?.toLowerCase().includes(termo);
        const maeMatch = aluno?.responsaveis?.mae?.nome?.toLowerCase().includes(termo);
        const paiMatch = aluno?.responsaveis?.pai?.nome?.toLowerCase().includes(termo);
        const cpfMaeMatch = aluno?.responsaveis?.mae?.cpf?.replace(/\D/g, '').includes(termo.replace(/\D/g, ''));
        const cpfPaiMatch = aluno?.responsaveis?.pai?.cpf?.replace(/\D/g, '').includes(termo.replace(/\D/g, ''));
        const cpfAlunoMatch = aluno?.cpf?.replace(/\D/g, '').includes(termo.replace(/\D/g, ''));

        if (!nomeAlunoMatch && !reciboMatch && !maeMatch && !paiMatch && !cpfMaeMatch && !cpfPaiMatch && !cpfAlunoMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (ordenacao === 'nome-asc') return a.alunoNome.localeCompare(b.alunoNome);
      if (ordenacao === 'nome-desc') return b.alunoNome.localeCompare(a.alunoNome);
      if (ordenacao === 'vencimento-asc') return a.dataVencimento.localeCompare(b.dataVencimento);
      if (ordenacao === 'vencimento-desc') return b.dataVencimento.localeCompare(a.dataVencimento);
      if (ordenacao === 'valor-desc') return b.valorFinal - a.valorFinal;
      if (ordenacao === 'valor-asc') return a.valorFinal - b.valorFinal;
      return 0;
    });
  }, [mensalidades, mesSelecionado, statusFiltro, turmaFiltro, turnoFiltro, formaPgtoFiltro, buscaGeral, ordenacao, studentMap, hojeStr]);

  // Verificar se há algum filtro não padrão ativo
  const temFiltroAtivo = statusFiltro !== 'todos' || turmaFiltro !== 'todas' || turnoFiltro !== 'todos' || formaPgtoFiltro !== 'todas' || buscaGeral.trim() !== '';

  const limparFiltros = () => {
    setStatusFiltro('todos');
    setTurmaFiltro('todas');
    setTurnoFiltro('todos');
    setFormaPgtoFiltro('todas');
    setBuscaGeral('');
    setOrdenacao('nome-asc');
  };

  // Métricas do Mês Selecionado (Exclusivo Diretoria)
  const totalPrevisto = mensalidadesDoMes.reduce((acc, curr) => acc + curr.valorFinal, 0);
  const totalRecebido = mensalidadesDoMes
    .filter((m) => m.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valorFinal, 0);
  const totalPendente = mensalidadesDoMes
    .filter((m) => m.status !== 'Pago' && m.status !== 'Cancelado')
    .reduce((acc, curr) => acc + curr.valorFinal, 0);

  const taxaAdimplencia = totalPrevisto > 0 ? Math.round((totalRecebido / totalPrevisto) * 100) : 100;

  // Total do recorte filtrado atual
  const somaValorFiltrado = mensalidadesFiltradas.reduce((acc, curr) => acc + curr.valorFinal, 0);

  const exportarRelatorioFinanceiro = () => {
    const dados = mensalidadesFiltradas.map((m) => ({
      Mês: m.mesReferencia,
      Parcela: m.numeroParcela,
      Aluno: m.alunoNome,
      Turma: m.turmaNome,
      'Valor Original': m.valorOriginal,
      Desconto: m.desconto,
      'Valor Final': m.valorFinal,
      Vencimento: formatarDataBR(m.dataVencimento),
      'Data Pagamento': formatarDataBR(m.dataPagamento),
      Status: m.status,
      'Forma Pagamento': m.formaPagamento || '-',
      'Nº Recibo': m.numeroRecibo || '-',
      'Pago Por': m.pagoPor || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mensalidades');
    XLSX.writeFile(workbook, `financeiro_filtrado_aprendendo_com_amor_${mesSelecionado === 0 ? 'ano_2026' : `mes_${mesSelecionado}`}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {currentRole === 'diretoria' ? 'Gestão Financeira & Mensalidades' : 'Baixa de Mensalidades & Recibos'}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {currentRole === 'diretoria'
              ? 'Controle de vencimentos, fechamento de caixa por PIX/Dinheiro e relatórios de adimplência.'
              : 'Localize a parcela do aluno para registrar o pagamento e imprimir o recibo oficial em 2 vias.'}
          </p>
        </div>

        {currentRole === 'diretoria' && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportarRelatorioFinanceiro}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-sm"
              title="Exportar dados filtrados para o Excel"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Excel ({mensalidadesFiltradas.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Seletor de Meses em Abas Roláveis */}
      <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setMesSelecionado(0)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
            mesSelecionado === 0
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Ano Todo (2026)
        </button>

        {listaMeses.map((m) => (
          <button
            key={m.index}
            onClick={() => setMesSelecionado(m.index)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
              mesSelecionado === m.index
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {m.nome}
          </button>
        ))}
      </div>

      {/* Cards de Métricas Financeiras (Exclusivo Diretoria) */}
      {currentRole === 'diretoria' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Previsto no Período</span>
            <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
              {formatarMoeda(totalPrevisto)}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">{mensalidadesDoMes.length} parcelas</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Recebido</span>
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700 font-mono">
              {formatarMoeda(totalRecebido)}
            </div>
            <span className="text-xs text-emerald-800 font-semibold mt-1 block">
              {mensalidadesDoMes.filter((m) => m.status === 'Pago').length} pagas com sucesso
            </span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">A Receber / Pendente</span>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-700 font-mono">
              {formatarMoeda(totalPendente)}
            </div>
            <span className="text-xs text-amber-800 font-semibold mt-1 block">
              {mensalidadesDoMes.filter((m) => m.status !== 'Pago').length} pendentes
            </span>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-3xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">Taxa de Adimplência</span>
            <div className="mt-2 text-2xl font-black text-indigo-900">
              {taxaAdimplencia}%
            </div>
            <div className="w-full bg-indigo-200 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${taxaAdimplencia}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
              💳
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-amber-950">Atendimento da Secretaria • Baixa de Mensalidades</h3>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Utilize os filtros abaixo para localizar parcelas por aluno, responsável, turma ou forma de pagamento.
              </p>
            </div>
          </div>
          <div className="bg-white/80 border border-amber-200 px-3.5 py-1.5 rounded-xl text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Parcelas Listadas</span>
            <span className="text-xs font-black text-amber-950 font-mono">{mensalidadesFiltradas.length} itens</span>
          </div>
        </div>
      )}

      {/* Painel de Filtros Avançados */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-4">
        {/* Linha 1: Busca Geral + Botões de Status Rápido */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Campo de Busca Multicampo */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por aluno, responsável (mãe/pai), CPF ou nº do recibo..."
              value={buscaGeral}
              onChange={(e) => setBuscaGeral(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
            {buscaGeral && (
              <button
                onClick={() => setBuscaGeral('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Abas de Status com Contadores Reativos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setStatusFiltro('todos')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                statusFiltro === 'todos'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Todas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFiltro === 'todos' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                {contadoresStatus.total}
              </span>
            </button>

            <button
              onClick={() => setStatusFiltro('Pago')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                statusFiltro === 'Pago'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span>Pagas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFiltro === 'Pago' ? 'bg-white/20' : 'bg-emerald-200 text-emerald-900'}`}>
                {contadoresStatus.pagas}
              </span>
            </button>

            <button
              onClick={() => setStatusFiltro('Pendente')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                statusFiltro === 'Pendente'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span>A Vencer</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFiltro === 'Pendente' ? 'bg-white/20' : 'bg-amber-200 text-amber-900'}`}>
                {contadoresStatus.aVencer}
              </span>
            </button>

            <button
              onClick={() => setStatusFiltro('Atrasado')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                statusFiltro === 'Atrasado'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <span>Atrasadas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFiltro === 'Atrasado' ? 'bg-white/20' : 'bg-rose-200 text-rose-900'}`}>
                {contadoresStatus.atrasadas}
              </span>
            </button>
          </div>
        </div>

        {/* Linha 2: Dropdowns de Turma, Turno, Forma de Pgto e Ordenação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Dropdown: Turma */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Turma
            </label>
            <select
              value={turmaFiltro}
              onChange={(e) => setTurmaFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              <option value="todas">Todas as Turmas</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.turno})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown: Turno */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Turno
            </label>
            <select
              value={turnoFiltro}
              onChange={(e) => setTurnoFiltro(e.target.value as any)}
              className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              <option value="todos">Todos os Turnos</option>
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Integral">Integral</option>
            </select>
          </div>

          {/* Dropdown: Forma de Pagamento */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Forma de Pgto
            </label>
            <select
              value={formaPgtoFiltro}
              onChange={(e) => setFormaPgtoFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              <option value="todas">Todas as Formas</option>
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Boleto">Boleto</option>
              <option value="Transferência">Transferência</option>
              <option value="Pendente">Apenas Pendentes (Sem Pgto)</option>
            </select>
          </div>

          {/* Dropdown: Ordenação */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              Ordenar Por
            </label>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as OrdenacaoTipo)}
              className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              <option value="nome-asc">Aluno (A → Z)</option>
              <option value="nome-desc">Aluno (Z → A)</option>
              <option value="vencimento-asc">Vencimento (Mais próximas)</option>
              <option value="vencimento-desc">Vencimento (Mais distantes)</option>
              <option value="valor-desc">Valor (Maior → Menor)</option>
              <option value="valor-asc">Valor (Menor → Maior)</option>
            </select>
          </div>

          {/* Botão de Limpar Filtros ou Resumo */}
          <div className="flex flex-col justify-end">
            {temFiltroAtivo ? (
              <button
                onClick={limparFiltros}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200"
                title="Resetar todos os filtros"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar Filtros</span>
              </button>
            ) : (
              <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-center text-[11px] font-medium text-slate-400">
                Filtros padrão
              </div>
            )}
          </div>
        </div>

        {/* Barra de Status dos Filtros Ativos */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Exibindo:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
              {mensalidadesFiltradas.length} parcelas
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">Total do filtro:</span>
            <span className="font-black text-slate-900 font-mono bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 rounded-lg">
              {formatarMoeda(somaValorFiltrado)}
            </span>
          </div>

          {temFiltroAtivo && (
            <span className="text-[11px] text-amber-700 font-semibold bg-amber-50/80 px-2.5 py-0.5 rounded-lg">
              ⚡ Filtros personalizados aplicados
            </span>
          )}
        </div>
      </div>

      {/* Tabela de Mensalidades */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Referência</th>
                <th className="p-3.5">Aluno(a)</th>
                <th className="p-3.5">Turma</th>
                <th className="p-3.5">Vencimento</th>
                <th className="p-3.5">Valor Final</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Pagamento</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mensalidadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-xl text-slate-400">
                        🔍
                      </div>
                      <p className="font-bold text-slate-700 text-sm">Nenhuma mensalidade encontrada</p>
                      <p className="text-xs text-slate-400">
                        Tente ajustar os filtros de busca, turma ou status para encontrar o que procura.
                      </p>
                      {temFiltroAtivo && (
                        <button
                          onClick={limparFiltros}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          Limpar todos os filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                mensalidadesFiltradas.map((m) => {
                  const aluno = students.find((s) => s.id === m.alunoId);
                  const telResp = aluno?.responsaveis?.mae?.telefone || aluno?.responsaveis?.pai?.telefone || '';
                  const zapMsg = aluno ? gerarMensagemCobrancaAmigavel(m, aluno, config) : '';
                  const zapLink = linkWhatsApp(telResp, zapMsg);
                  const atrasada = isAtrasada(m);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-semibold text-slate-800">
                        {m.mesReferencia}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 uppercase block">{m.alunoNome}</span>
                        {aluno?.responsaveis?.mae?.nome && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                            Resp: {aluno.responsaveis.mae.nome}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="text-slate-700 font-medium block">{m.turmaNome}</span>
                        {aluno?.turno && (
                          <span className="text-[10px] text-slate-400 block">{aluno.turno}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`font-medium block ${atrasada ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {formatarDataBR(m.dataVencimento)}
                        </span>
                        {atrasada && (
                          <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">
                            Vencida
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold font-mono text-slate-900 text-sm">
                        {formatarMoeda(m.valorFinal)}
                      </td>
                      <td className="p-3.5">
                        {m.status === 'Pago' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Pago
                          </span>
                        ) : atrasada ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                            Atrasada
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                            A Vencer
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {m.status === 'Pago' ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-emerald-700 text-[11px] block">{m.formaPagamento || 'PIX'}</span>
                            <span className="text-[10px] text-slate-400 block">{formatarDataBR(m.dataPagamento)}</span>
                            {m.numeroRecibo && (
                              <span className="text-[9.5px] font-mono text-indigo-600 block">Rec: {m.numeroRecibo}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Aguardando</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {m.status === 'Pago' ? (
                            <>
                              {aluno && (
                                <button
                                  onClick={() => onOpenRecibo(m, aluno)}
                                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded-xl text-xs transition"
                                  title="Ver e Imprimir Recibo Oficial"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  Recibo
                                </button>
                              )}
                              <button
                                onClick={() => setMensalidadeToEstorno(m)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                title="Estornar Pagamento"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {aluno && (
                                <button
                                  onClick={() => onOpenBaixa(m, aluno)}
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  Baixar
                                </button>
                              )}
                              {telResp && (
                                <a
                                  href={zapLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition"
                                  title="Lembrete / Cobrança no WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação: Estorno de Mensalidade */}
      <ModalConfirmacao
        isOpen={!!mensalidadeToEstorno}
        onClose={() => setMensalidadeToEstorno(null)}
        onConfirm={() => {
          if (mensalidadeToEstorno) {
            estornarMensalidade(mensalidadeToEstorno.id);
            setMensalidadeToEstorno(null);
          }
        }}
        title="Estornar Baixa de Mensalidade?"
        description={
          <div>
            Tem certeza que deseja estornar o pagamento da mensalidade de{' '}
            <strong className="text-slate-900 font-bold">{mensalidadeToEstorno?.mesReferencia}</strong> do aluno(a){' '}
            <strong className="text-slate-900 font-bold">{mensalidadeToEstorno?.alunoNome}</strong>?
            <p className="mt-2 text-slate-500 text-xs">
              A parcela retornará ao status <strong>Pendente</strong> e o número de recibo anterior será cancelado.
            </p>
          </div>
        }
        confirmText="Sim, Estornar Pagamento"
        cancelText="Voltar"
        variant="warning"
      />
    </div>
  );
};

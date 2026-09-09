'use client';

import React, { useState, useMemo } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { EventoEscolar, ParticipanteEvento, RespostaEnquete, FormaPagamento } from '@/types';
import { formatarMoeda, formatarDataBR, linkWhatsApp } from '@/utils/helpers';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Printer,
  Edit2,
  Trash2,
  Check,
  Search,
  Filter,
  CreditCard,
  MessageCircle,
  TrendingUp,
  Award,
  ChevronRight,
  HelpCircle,
  PartyPopper,
} from 'lucide-react';
import { ModalNovoEvento } from '@/components/modals/ModalNovoEvento';
import { ModalBaixaEvento } from '@/components/modals/ModalBaixaEvento';
import { ModalConfirmacao } from '@/components/modals/ModalConfirmacao';

interface EventosViewProps {
  onPrintEvento?: (evento: EventoEscolar) => void;
}

export const EventosView: React.FC<EventosViewProps> = ({ onPrintEvento }) => {
  const {
    eventos,
    turmas,
    students,
    config,
    currentRole,
    addEvento,
    updateEvento,
    deleteEvento,
    responderEnquete,
    confirmarEvento,
    registrarPagamentoEvento,
    estornarPagamentoEvento,
    notify,
  } = useSchool();

  // Evento Selecionado
  const [selectedEventoId, setSelectedEventoId] = useState<string>(
    eventos[0]?.id || ''
  );

  // Filtros da Tabela
  const [filtroTurma, setFiltroTurma] = useState<string>('todas');
  const [filtroResposta, setFiltroResposta] = useState<string>('todos');
  const [filtroPagamento, setFiltroPagamento] = useState<string>('todos');
  const [buscaAluno, setBuscaAluno] = useState<string>('');

  // Modais
  const [isNovoEventoOpen, setIsNovoEventoOpen] = useState(false);
  const [eventoToEdit, setEventoToEdit] = useState<EventoEscolar | null>(null);
  const [eventoToDelete, setEventoToDelete] = useState<EventoEscolar | null>(null);

  // Modal de Baixa de Pagamento
  const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
  const [participanteForBaixa, setParticipanteForBaixa] = useState<ParticipanteEvento | null>(null);

  // Modal de Confirmação de Estorno
  const [participanteForEstorno, setParticipanteForEstorno] = useState<ParticipanteEvento | null>(null);

  // Encontrar o evento ativo
  const currentEvento = useMemo(() => {
    return eventos.find((ev) => ev.id === selectedEventoId) || eventos[0];
  }, [eventos, selectedEventoId]);

  // Participantes filtrados
  const participantesFiltrados = useMemo(() => {
    if (!currentEvento) return [];

    return currentEvento.participantes.filter((p) => {
      // Filtro Turma
      if (filtroTurma !== 'todas' && p.turmaId !== filtroTurma && p.turmaNome !== filtroTurma) {
        return false;
      }
      // Filtro Resposta
      if (filtroResposta !== 'todos' && p.resposta !== filtroResposta) {
        return false;
      }
      // Filtro Pagamento
      if (filtroPagamento !== 'todos' && p.statusPagamento !== filtroPagamento) {
        return false;
      }
      // Busca
      if (buscaAluno.trim()) {
        const query = buscaAluno.toLowerCase();
        const nomeMatch = p.alunoNome.toLowerCase().includes(query);
        const turmaMatch = p.turmaNome.toLowerCase().includes(query);
        return nomeMatch || turmaMatch;
      }
      return true;
    });
  }, [currentEvento, filtroTurma, filtroResposta, filtroPagamento, buscaAluno]);

  // Estatísticas do Evento Selecionado
  const stats = useMemo(() => {
    if (!currentEvento) {
      return { total: 0, sim: 0, nao: 0, pendente: 0, pagos: 0, arrecadado: 0, previsto: 0, pendenteValor: 0 };
    }

    const total = currentEvento.participantes.length;
    const sim = currentEvento.participantes.filter((p) => p.resposta === 'sim').length;
    const nao = currentEvento.participantes.filter((p) => p.resposta === 'nao').length;
    const pendente = currentEvento.participantes.filter((p) => p.resposta === 'pendente').length;

    const participantesSim = currentEvento.participantes.filter((p) => p.resposta === 'sim');
    const pagos = participantesSim.filter((p) => p.statusPagamento === 'pago').length;
    const arrecadado = participantesSim
      .filter((p) => p.statusPagamento === 'pago')
      .reduce((acc, p) => acc + (p.valor || currentEvento.valorPorAluno), 0);
    const previsto = participantesSim.reduce((acc, p) => acc + (p.valor || currentEvento.valorPorAluno), 0);
    const pendenteValor = Math.max(0, previsto - arrecadado);

    return { total, sim, nao, pendente, pagos, arrecadado, previsto, pendenteValor };
  }, [currentEvento]);

  // Percentual de Quórum
  const pctQuorum = currentEvento && currentEvento.quorumMinimo
    ? Math.min(100, Math.round((stats.sim / currentEvento.quorumMinimo) * 100))
    : 100;

  // Handlers
  const handleOpenNovoEvento = () => {
    setEventoToEdit(null);
    setIsNovoEventoOpen(true);
  };

  const handleOpenEditEvento = (evento: EventoEscolar) => {
    setEventoToEdit(evento);
    setIsNovoEventoOpen(true);
  };

  const handleSaveEvento = (
    data: Omit<EventoEscolar, 'id' | 'createdAt' | 'updatedAt' | 'participantes'>,
    turmasIds?: string[]
  ) => {
    if (eventoToEdit) {
      updateEvento(eventoToEdit.id, data);
    } else {
      const novo = addEvento(data, turmasIds);
      setSelectedEventoId(novo.id);
    }
  };

  const handleConfirmarExclusaoEvento = () => {
    if (eventoToDelete) {
      deleteEvento(eventoToDelete.id);
      setEventoToDelete(null);
      const remaining = eventos.filter((e) => e.id !== eventoToDelete.id);
      if (remaining.length > 0) {
        setSelectedEventoId(remaining[0].id);
      }
    }
  };

  const handleOpenBaixa = (participante: ParticipanteEvento) => {
    setParticipanteForBaixa(participante);
    setIsBaixaModalOpen(true);
  };

  const handleConfirmBaixa = (data: {
    formaPagamento: FormaPagamento;
    dataPagamento: string;
    observacoes?: string;
  }) => {
    if (currentEvento && participanteForBaixa) {
      registrarPagamentoEvento(currentEvento.id, participanteForBaixa.alunoId, data);
    }
  };

  const handleConfirmEstorno = () => {
    if (currentEvento && participanteForEstorno) {
      estornarPagamentoEvento(currentEvento.id, participanteForEstorno.alunoId);
      setParticipanteForEstorno(null);
    }
  };

  // Helper para obter telefone do responsável do aluno para WhatsApp
  const getTelefoneAluno = (alunoId: string, alunoNome: string) => {
    const st = students.find((s) => s.id === alunoId || s.nome.toLowerCase() === alunoNome.toLowerCase());
    return (
      st?.responsaveis?.mae?.telefone ||
      st?.responsaveis?.pai?.telefone ||
      st?.responsaveis?.numeroEmergencia ||
      ''
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* CABEÇALHO DA VIEW */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Eventos & Enquetes Escolares
                <span className="text-xs bg-violet-100 text-violet-800 font-bold px-2.5 py-0.5 rounded-full border border-violet-200">
                  {eventos.length} no total
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Gestão de eventos, enquetes de adesão dos pais, controle de pagamentos e emissão de listas de embarque
              </p>
            </div>
          </div>
        </div>

        {/* Ações Globais */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {currentEvento && onPrintEvento && (
            <button
              onClick={() => onPrintEvento(currentEvento)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer border border-slate-200"
              title="Imprimir Lista de Embarque e Presença A4"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Lista de Embarque A4</span>
            </button>
          )}

          {['diretoria', 'secretaria'].includes(currentRole) && (
            <button
              onClick={handleOpenNovoEvento}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Evento / Enquete</span>
            </button>
          )}
        </div>
      </div>

      {/* SELETOR DE EVENTOS EM CARROSSEL / CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventos.map((ev) => {
          const isSelected = ev.id === currentEvento?.id;
          const totalSim = ev.participantes.filter((p) => p.resposta === 'sim').length;
          const totalAlunos = ev.participantes.length;

          return (
            <div
              key={ev.id}
              onClick={() => setSelectedEventoId(ev.id)}
              className={`p-5 rounded-3xl border transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-white to-violet-50/50 border-violet-500 shadow-md ring-2 ring-violet-500/20'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Linha Superior: Status & Categoria */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      ev.status === 'confirmado'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : ev.status === 'enquete_aberta'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                        : ev.status === 'realizado'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {ev.status === 'confirmado'
                      ? '✓ Confirmado'
                      : ev.status === 'enquete_aberta'
                      ? '🗳️ Enquete Aberta'
                      : ev.status === 'realizado'
                      ? '🏆 Realizado'
                      : '❌ Cancelado'}
                  </span>

                  <span className="text-[11px] font-bold text-slate-500">
                    {ev.categoria}
                  </span>
                </div>

                {/* Título do Evento */}
                <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5 line-clamp-1">
                  {ev.titulo}
                </h3>

                {/* Descrição */}
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {ev.descricao}
                </p>

                {/* Dados Rápidos */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-2xl">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-violet-600" />
                    <span>{formatarDataBR(ev.dataEvento)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{ev.ePago ? formatarMoeda(ev.valorPorAluno) : 'Gratuito'}</span>
                  </div>
                </div>
              </div>

              {/* Barra de Adesão / Votação */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Adesão dos Pais:</span>
                  <strong className="text-slate-900 font-extrabold">
                    {totalSim} confirmados <span className="text-slate-400 font-normal">de {totalAlunos}</span>
                  </strong>
                </div>

                {ev.quorumMinimo && (
                  <div className="text-right">
                    <span className="text-slate-500 text-[11px] block">Meta Quórum:</span>
                    <span className={`font-black ${totalSim >= ev.quorumMinimo ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {totalSim >= ev.quorumMinimo ? '✓ Atingido' : `${ev.quorumMinimo - totalSim} restantes`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETALHES DO EVENTO SELECIONADO & PLANILHA DE GESTÃO */}
      {currentEvento && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          
          {/* HEADER DO EVENTO SELECIONADO */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-violet-950 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500 text-white">
                  {currentEvento.categoria}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    currentEvento.status === 'confirmado'
                      ? 'bg-emerald-500 text-white'
                      : currentEvento.status === 'enquete_aberta'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {currentEvento.status === 'confirmado'
                    ? 'Confirmado Oficialmente'
                    : currentEvento.status === 'enquete_aberta'
                    ? 'Enquete Aberta para Votação'
                    : currentEvento.status}
                </span>
                <span className="text-xs text-slate-300">
                  Prazo da Enquete: <strong className="text-white">{formatarDataBR(currentEvento.prazoEnquete)}</strong>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {currentEvento.titulo}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {currentEvento.descricao}
              </p>

              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-violet-400" />
                  {formatarDataBR(currentEvento.dataEvento)}
                </span>
                {currentEvento.horario && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    {currentEvento.horario}
                  </span>
                )}
                {currentEvento.local && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-violet-400" />
                    {currentEvento.local}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  {currentEvento.ePago ? `${formatarMoeda(currentEvento.valorPorAluno)} por aluno` : 'Gratuito'}
                </span>
              </div>
            </div>

            {/* Ações do Evento Selecionado */}
            {['diretoria', 'secretaria'].includes(currentRole) && (
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {currentEvento.status === 'enquete_aberta' && (
                  <button
                    onClick={() => confirmarEvento(currentEvento.id)}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-black text-xs shadow-md transition transform active:scale-95 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Confirmar Evento</span>
                  </button>
                )}

                <button
                  onClick={() => handleOpenEditEvento(currentEvento)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Editar dados do evento"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setEventoToDelete(currentEvento)}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition cursor-pointer"
                  title="Excluir evento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* PAINEL DE KPIS & PROGRESSO DO EVENTO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-slate-50/80 border-b border-slate-200">
            {/* Total Votaram Sim */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                <span>Confirmados (Sim)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700">
                {stats.sim}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {stats.total > 0 ? Math.round((stats.sim / stats.total) * 100) : 0}% dos alunos elegíveis
              </span>
            </div>

            {/* Recusaram (Não) */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                <span>Não Irão Participar</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-700">
                {stats.nao}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {stats.total > 0 ? Math.round((stats.nao / stats.total) * 100) : 0}% recusaram
              </span>
            </div>

            {/* Pendentes de Resposta */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                <span>Aguardando Voto</span>
                <HelpCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-700">
                {stats.pendente}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Pendentes de retorno
              </span>
            </div>

            {/* Financeiro Arrecadado */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                <span>{currentEvento.ePago ? 'Total Arrecadado' : 'Quórum Mínimo'}</span>
                <TrendingUp className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-violet-700">
                {currentEvento.ePago ? formatarMoeda(stats.arrecadado) : `${stats.sim}/${currentEvento.quorumMinimo || 20}`}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {currentEvento.ePago
                  ? `Previsto: ${formatarMoeda(stats.previsto)}`
                  : `${pctQuorum}% da meta de alunos`}
              </span>
            </div>
          </div>

          {/* BARRA DE PROGRESSO DE QUÓRUM SE HOUVER META */}
          {currentEvento.quorumMinimo && (
            <div className="px-5 sm:px-6 py-3 bg-violet-50/60 border-b border-violet-100 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-violet-600 shrink-0" />
                <span className="text-xs font-bold text-violet-900">
                  Meta de Quórum do Evento: <strong>{currentEvento.quorumMinimo} alunos</strong> (Confirmados:{' '}
                  <strong className="text-emerald-700">{stats.sim}</strong>)
                </span>
              </div>
              <div className="flex items-center gap-3 flex-1 max-w-xs">
                <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pctQuorum >= 100 ? 'bg-emerald-500' : 'bg-violet-600'
                    }`}
                    style={{ width: `${pctQuorum}%` }}
                  />
                </div>
                <span className="text-xs font-black text-violet-950 shrink-0">
                  {pctQuorum}%
                </span>
              </div>
            </div>
          )}

          {/* BARRA DE FILTROS & BUSCA (ESTILO PLANILHA) */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3 flex-wrap">
            
            {/* Campo de Busca */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={buscaAluno}
                onChange={(e) => setBuscaAluno(e.target.value)}
                placeholder="Buscar por nome do aluno ou turma..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Filtros em Select */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filtro Turma */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filtroTurma}
                  onChange={(e) => setFiltroTurma(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                >
                  <option value="todas">Todas as Turmas</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Resposta */}
              <select
                value={filtroResposta}
                onChange={(e) => setFiltroResposta(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              >
                <option value="todos">Todos os Votos</option>
                <option value="sim">🟢 Irá Participar (Sim)</option>
                <option value="nao">🔴 Não Participará</option>
                <option value="pendente">⚪ Voto Pendente</option>
              </select>

              {/* Filtro Pagamento */}
              {currentEvento.ePago && (
                <select
                  value={filtroPagamento}
                  onChange={(e) => setFiltroPagamento(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                >
                  <option value="todos">Todos os Pagamentos</option>
                  <option value="pago">✓ Pagamento Quitado</option>
                  <option value="pendente">⏳ Pagamento Pendente</option>
                  <option value="isento">Isento / Não vai</option>
                </select>
              )}
            </div>
          </div>

          {/* PLANILHA INTERATIVA DE PARTICIPAÇÃO (ESPELHO DE CIRCO + PASCOA.html) */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 text-[11px] uppercase tracking-wider font-black">
                  <th className="py-3 px-4 w-12 text-center">Nº</th>
                  <th className="py-3 px-4">Aluno(a)</th>
                  <th className="py-3 px-4">Turma</th>
                  <th className="py-3 px-4 text-center">Irá Participar? (Voto)</th>
                  <th className="py-3 px-4">Observações / Recado</th>
                  {currentEvento.ePago && (
                    <>
                      <th className="py-3 px-4 text-center">Valor</th>
                      <th className="py-3 px-4 text-center">Forma Pagto</th>
                      <th className="py-3 px-4 text-center">Status Pagto</th>
                    </>
                  )}
                  <th className="py-3 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participantesFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={currentEvento.ePago ? 9 : 6}
                      className="py-12 text-center text-slate-500 font-bold"
                    >
                      Nenhum aluno encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  participantesFiltrados.map((p, idx) => {
                    const tel = getTelefoneAluno(p.alunoId, p.alunoNome);

                    return (
                      <tr
                        key={p.alunoId}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          p.resposta === 'sim' ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        {/* Índice */}
                        <td className="py-3 px-4 text-center font-bold text-slate-400 text-xs">
                          {idx + 1}
                        </td>

                        {/* Nome do Aluno */}
                        <td className="py-3 px-4 font-black text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-black text-xs shrink-0">
                              {p.alunoNome.charAt(0)}
                            </div>
                            <span className="truncate max-w-[200px]">{p.alunoNome}</span>
                          </div>
                        </td>

                        {/* Turma */}
                        <td className="py-3 px-4 font-bold text-slate-700 whitespace-nowrap">
                          {p.turmaNome}
                        </td>

                        {/* Voto / Irá participar? com Alternância Rápida */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {['diretoria', 'secretaria', 'professor'].includes(currentRole) ? (
                            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                              <button
                                type="button"
                                onClick={() => responderEnquete(currentEvento.id, p.alunoId, 'sim')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                                  p.resposta === 'sim'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-emerald-700'
                                }`}
                                title="Marcar como Sim"
                              >
                                Sim
                              </button>
                              <button
                                type="button"
                                onClick={() => responderEnquete(currentEvento.id, p.alunoId, 'nao')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                                  p.resposta === 'nao'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-rose-700'
                                }`}
                                title="Marcar como Não"
                              >
                                Não
                              </button>
                              <button
                                type="button"
                                onClick={() => responderEnquete(currentEvento.id, p.alunoId, 'pendente')}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                  p.resposta === 'pendente'
                                    ? 'bg-slate-700 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                                title="Deixar Pendente"
                              >
                                ?
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black ${
                                p.resposta === 'sim'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.resposta === 'nao'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {p.resposta === 'sim' ? 'Sim ✓' : p.resposta === 'nao' ? 'Não ✗' : 'Pendente'}
                            </span>
                          )}
                        </td>

                        {/* Observação */}
                        <td className="py-3 px-4 text-slate-600 text-xs max-w-[200px]">
                          {p.observacao ? (
                            <span className="italic text-slate-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 block truncate" title={p.observacao}>
                              "{p.observacao}"
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Colunas Financeiras se o Evento for Pago */}
                        {currentEvento.ePago && (
                          <>
                            <td className="py-3 px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                              {formatarMoeda(p.valor || currentEvento.valorPorAluno)}
                            </td>

                            <td className="py-3 px-4 text-center font-semibold text-slate-600 whitespace-nowrap">
                              {p.formaPagamento || '-'}
                            </td>

                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              {p.statusPagamento === 'pago' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  Pago
                                </span>
                              ) : p.statusPagamento === 'isento' ? (
                                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">
                                  Isento
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  Pendente
                                </span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Ações */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botão WhatsApp para lembrar responsável */}
                            {tel && (
                              <a
                                href={linkWhatsApp(
                                  tel,
                                  `Olá! Estamos confirmando a participação do(a) ${p.alunoNome} no evento escolar "${currentEvento.titulo}". Aguardamos o seu retorno na enquete!`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                                title="Enviar mensagem via WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}

                            {/* Botão Baixa Pagamento */}
                            {currentEvento.ePago && p.resposta === 'sim' && p.statusPagamento !== 'pago' && ['diretoria', 'secretaria'].includes(currentRole) && (
                              <button
                                type="button"
                                onClick={() => handleOpenBaixa(p)}
                                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="Dar baixa no pagamento do evento"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Baixa</span>
                              </button>
                            )}

                            {/* Botão Estorno Pagamento */}
                            {currentEvento.ePago && p.statusPagamento === 'pago' && ['diretoria'].includes(currentRole) && (
                              <button
                                type="button"
                                onClick={() => setParticipanteForEstorno(p)}
                                className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-[11px] font-bold transition cursor-pointer"
                                title="Estornar pagamento"
                              >
                                Estornar
                              </button>
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
      )}

      {/* MODAL NOVO / EDITAR EVENTO */}
      <ModalNovoEvento
        isOpen={isNovoEventoOpen}
        onClose={() => setIsNovoEventoOpen(false)}
        onSave={handleSaveEvento}
        turmas={turmas}
        eventoToEdit={eventoToEdit}
      />

      {/* MODAL BAIXA DE PAGAMENTO DE EVENTO */}
      <ModalBaixaEvento
        isOpen={isBaixaModalOpen}
        onClose={() => {
          setIsBaixaModalOpen(false);
          setParticipanteForBaixa(null);
        }}
        evento={currentEvento}
        participante={participanteForBaixa}
        onConfirm={handleConfirmBaixa}
      />

      {/* MODAL CONFIRMAÇÃO EXCLUSÃO DE EVENTO */}
      <ModalConfirmacao
        isOpen={!!eventoToDelete}
        onClose={() => setEventoToDelete(null)}
        onConfirm={handleConfirmarExclusaoEvento}
        title="Excluir Evento Escolar?"
        description={
          <div>
            Tem certeza que deseja excluir o evento{' '}
            <strong className="text-slate-900 font-bold">{eventoToDelete?.titulo}</strong>?
            <p className="mt-2 text-slate-500 text-xs">
              Todas as respostas de enquete e registros de pagamento deste evento serão removidos.
            </p>
          </div>
        }
        confirmText="Sim, Excluir Evento"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* MODAL CONFIRMAÇÃO ESTORNO DE PAGAMENTO */}
      <ModalConfirmacao
        isOpen={!!participanteForEstorno}
        onClose={() => setParticipanteForEstorno(null)}
        onConfirm={handleConfirmEstorno}
        title="Estornar Pagamento do Evento?"
        description={
          <div>
            Deseja estornar o pagamento do aluno(a){' '}
            <strong className="text-slate-900 font-bold">{participanteForEstorno?.alunoNome}</strong>{' '}
            no valor de{' '}
            <strong>{formatarMoeda(participanteForEstorno?.valor || currentEvento?.valorPorAluno || 0)}</strong>?
            <p className="mt-2 text-slate-500 text-xs">
              O status do pagamento voltará para <strong>Pendente</strong>.
            </p>
          </div>
        }
        confirmText="Sim, Confirmar Estorno"
        cancelText="Voltar"
        variant="warning"
      />

    </div>
  );
};

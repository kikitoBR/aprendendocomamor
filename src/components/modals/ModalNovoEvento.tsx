'use client';

import React, { useState, useEffect } from 'react';
import { EventoEscolar, Turma, CategoriaEvento, StatusEvento } from '@/types';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Target,
  FileText,
  Check,
} from 'lucide-react';

interface ModalNovoEventoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<EventoEscolar, 'id' | 'createdAt' | 'updatedAt' | 'participantes'>,
    turmasIds?: string[]
  ) => void;
  turmas: Turma[];
  eventoToEdit?: EventoEscolar | null;
}

const CATEGORIAS: CategoriaEvento[] = [
  'Passeio',
  'Festividade',
  'Cultural',
  'Pedagógico',
  'Comemorativo',
  'Outro',
];

export const ModalNovoEvento: React.FC<ModalNovoEventoProps> = ({
  isOpen,
  onClose,
  onSave,
  turmas,
  eventoToEdit,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaEvento>('Passeio');
  const [dataEvento, setDataEvento] = useState('');
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [prazoEnquete, setPrazoEnquete] = useState('');
  const [todasTurmas, setTodasTurmas] = useState(true);
  const [selectedTurmas, setSelectedTurmas] = useState<string[]>([]);
  const [ePago, setEPago] = useState(true);
  const [valorPorAluno, setValorPorAluno] = useState<number | string>(35);
  const [quorumMinimo, setQuorumMinimo] = useState<number | string>(25);
  const [status, setStatus] = useState<StatusEvento>('enquete_aberta');
  const [fotoCapaUrl, setFotoCapaUrl] = useState('');

  useEffect(() => {
    if (eventoToEdit) {
      setTitulo(eventoToEdit.titulo || '');
      setDescricao(eventoToEdit.descricao || '');
      setCategoria(eventoToEdit.categoria || 'Passeio');
      setDataEvento(eventoToEdit.dataEvento || '');
      setHorario(eventoToEdit.horario || '');
      setLocal(eventoToEdit.local || '');
      setPrazoEnquete(eventoToEdit.prazoEnquete || '');
      const isTodas = eventoToEdit.turmasIds.includes('todas');
      setTodasTurmas(isTodas);
      setSelectedTurmas(isTodas ? [] : eventoToEdit.turmasIds);
      setEPago(eventoToEdit.ePago);
      setValorPorAluno(eventoToEdit.valorPorAluno);
      setQuorumMinimo(eventoToEdit.quorumMinimo || 25);
      setStatus(eventoToEdit.status || 'enquete_aberta');
      setFotoCapaUrl(eventoToEdit.fotoCapaUrl || '');
    } else {
      setTitulo('');
      setDescricao('');
      setCategoria('Passeio');
      const hoje = new Date();
      const em15Dias = new Date(hoje.getTime() + 15 * 24 * 60 * 60 * 1000);
      const em10Dias = new Date(hoje.getTime() + 10 * 24 * 60 * 60 * 1000);
      setDataEvento(em15Dias.toISOString().slice(0, 10));
      setPrazoEnquete(em10Dias.toISOString().slice(0, 10));
      setHorario('13:30 às 16:30');
      setLocal('Pátio & Bosque da Escola');
      setTodasTurmas(true);
      setSelectedTurmas([]);
      setEPago(true);
      setValorPorAluno(35);
      setQuorumMinimo(30);
      setStatus('enquete_aberta');
      setFotoCapaUrl('');
    }
  }, [eventoToEdit, isOpen]);

  if (!isOpen) return null;

  const handleToggleTurma = (turmaId: string) => {
    if (todasTurmas) {
      setTodasTurmas(false);
      setSelectedTurmas([turmaId]);
    } else {
      if (selectedTurmas.includes(turmaId)) {
        const remaining = selectedTurmas.filter((id) => id !== turmaId);
        if (remaining.length === 0) {
          setTodasTurmas(true);
        } else {
          setSelectedTurmas(remaining);
        }
      } else {
        setSelectedTurmas([...selectedTurmas, turmaId]);
      }
    }
  };

  const handleSelectTodasTurmas = () => {
    setTodasTurmas(true);
    setSelectedTurmas([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const finalTurmasIds = todasTurmas ? ['todas'] : selectedTurmas;
    const turmasNomes = todasTurmas
      ? ['Todas as Turmas']
      : turmas.filter((t) => selectedTurmas.includes(t.id)).map((t) => t.nome);

    onSave(
      {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        dataEvento,
        horario,
        local,
        prazoEnquete,
        turmasIds: finalTurmasIds,
        turmasNomes,
        ePago,
        valorPorAluno: ePago ? Number(valorPorAluno) || 0 : 0,
        quorumMinimo: Number(quorumMinimo) || 20,
        status,
        fotoCapaUrl: fotoCapaUrl.trim() || undefined,
        criadoPor: 'Diretoria Pedagógica',
      },
      finalTurmasIds
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8">
        
        {/* Cabeçalho Premium com Gradiente */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {eventoToEdit ? 'Editar Evento Escolar' : 'Novo Evento & Enquete Escolar'}
              </h3>
              <p className="text-purple-100 text-xs mt-0.5">
                Configure data, turmas participantes, votação dos pais e cobrança
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Título do Evento */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Título do Evento *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: 🎪 Grande Espetáculo do Circo Mágico ou 🐰 Celebração de Páscoa"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>

          {/* Categoria & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaEvento)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Status do Evento
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusEvento)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              >
                <option value="enquete_aberta">🗳️ Enquete Aberta (Votação dos Pais)</option>
                <option value="confirmado">✅ Confirmado pela Escola</option>
                <option value="realizado">🏆 Realizado / Concluído</option>
                <option value="cancelado">❌ Cancelado</option>
              </select>
            </div>
          </div>

          {/* Data, Horário e Prazo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                Data do Evento *
              </label>
              <input
                type="date"
                required
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-violet-600" />
                Horário Previsto
              </label>
              <input
                type="text"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                placeholder="Ex: 13:30 às 16:30"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                Prazo Limite Enquete *
              </label>
              <input
                type="date"
                required
                value={prazoEnquete}
                onChange={(e) => setPrazoEnquete(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Local do Evento */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-violet-600" />
              Local de Realização
            </label>
            <input
              type="text"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex: Circo Mágico da Cidade (Av. 28 de Março) ou Pátio Coberto da Escola"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Turmas Participantes */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-violet-600" />
              Turmas Elegíveis
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={handleSelectTodasTurmas}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                  todasTurmas
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Todas as Turmas da Escola
              </button>
              {turmas.map((turma) => {
                const isSelected = !todasTurmas && selectedTurmas.includes(turma.id);
                return (
                  <button
                    key={turma.id}
                    type="button"
                    onClick={() => handleToggleTurma(turma.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {turma.nome}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cobrança & Valores */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-xs font-black text-slate-900 block">
                  Evento Pago com Cobrança por Aluno?
                </strong>
                <span className="text-[11px] text-slate-500">
                  {ePago ? 'Será gerada cobrança PIX e recibo de participação' : 'Evento gratuito da escola'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEPago(!ePago)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  ePago ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    ePago ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {ePago && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Valor por Aluno (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required={ePago}
                    value={valorPorAluno}
                    onChange={(e) => setValorPorAluno(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-amber-600" />
                    Quórum Mínimo Esperado
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quorumMinimo}
                    onChange={(e) => setQuorumMinimo(e.target.value)}
                    placeholder="Ex: 25 alunos"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Descrição & Orientações Pedagógicas */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-violet-600" />
              Descrição & Comunicado para os Pais *
            </label>
            <textarea
              rows={3}
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Explique os objetivos pedagógicos, atrações, transporte, lanche e informações que os pais precisam saber..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-violet-500 leading-relaxed"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-black shadow-md transition transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{eventoToEdit ? 'Salvar Alterações' : 'Criar Evento & Abrir Enquete'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

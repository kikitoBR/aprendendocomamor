'use client';

import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Turma, Turno, NivelEnsino, Student } from '@/types';
import { formatarMoeda, formatarDataBR } from '@/utils/helpers';
import {
  GraduationCap,
  Plus,
  Users,
  Clock,
  Printer,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  Heart,
  Phone,
} from 'lucide-react';

interface TurmasViewProps {
  onSelectTurmaParaAlunos: (turmaId: string) => void;
  onPrintDiario: (turma: Turma, dataChamada?: string) => void;
}

export const TurmasView: React.FC<TurmasViewProps> = ({
  onSelectTurmaParaAlunos,
  onPrintDiario,
}) => {
  const { turmas, students, addTurma, updateTurma, deleteTurma, currentRole } = useSchool();
  const [modalAberto, setModalAberto] = useState(false);
  const [turmaEmEdicao, setTurmaEmEdicao] = useState<Turma | null>(null);

  // Modal para ver lista de alunos da sala (especialmente útil para professores e coordenação)
  const [turmaAlunosModal, setTurmaAlunosModal] = useState<Turma | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nivel, setNivel] = useState<NivelEnsino>('Educação Infantil');
  const [faixaEtaria, setFaixaEtaria] = useState('');
  const [turno, setTurno] = useState<Turno>('Tarde');
  const [horario, setHorario] = useState('13:00 às 17:00');
  const [capacidade, setCapacidade] = useState<number | string>(18);
  const [professor, setProfessor] = useState('');
  const [sala, setSala] = useState('');
  const [mensalidadeSugerida, setMensalidadeSugerida] = useState<number | string>(500);

  const handleOpenModal = (t?: Turma) => {
    if (t) {
      setTurmaEmEdicao(t);
      setNome(t.nome);
      setCodigo(t.codigo);
      setNivel(t.nivel);
      setFaixaEtaria(t.faixaEtaria);
      setTurno(t.turno);
      setHorario(t.horario);
      setCapacidade(t.capacidadeMaxima);
      setProfessor(t.professorResponsavel || '');
      setSala(t.sala || '');
      setMensalidadeSugerida(t.mensalidadeSugerida || 500);
    } else {
      setTurmaEmEdicao(null);
      setNome('');
      setCodigo('');
      setNivel('Educação Infantil');
      setFaixaEtaria('2 a 3 anos');
      setTurno('Tarde');
      setHorario('13:00 às 17:00');
      setCapacidade(18);
      setProfessor('');
      setSala('');
      setMensalidadeSugerida(500);
    }
    setModalAberto(true);
  };

  const handleSalvarTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (turmaEmEdicao) {
      updateTurma(turmaEmEdicao.id, {
        nome,
        codigo,
        nivel,
        faixaEtaria,
        turno,
        horario,
        capacidadeMaxima: Number(capacidade),
        professorResponsavel: professor,
        sala,
        mensalidadeSugerida: Number(mensalidadeSugerida),
      });
    } else {
      addTurma({
        nome,
        codigo: codigo || nome.slice(0, 3).toUpperCase(),
        nivel,
        faixaEtaria,
        turno,
        horario,
        capacidadeMaxima: Number(capacidade),
        professorResponsavel: professor,
        sala,
        mensalidadeSugerida: Number(mensalidadeSugerida),
        ativa: true,
      });
    }
    setModalAberto(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Turmas & Vagas Escolares
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Organização das salas, horários de entrada e saída, faixa etária e controle de lotação.
          </p>
        </div>

        {['diretoria', 'secretaria'].includes(currentRole) && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md shadow-orange-500/20 transition transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nova Turma
          </button>
        )}
      </div>

      {/* Grade de Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {turmas.map((turma) => {
          const alunosNaTurma = students.filter((s) => s.turmaId === turma.id && s.status === 'Ativo');
          const ocupacaoPerc = Math.round((alunosNaTurma.length / turma.capacidadeMaxima) * 100);

          return (
            <div
              key={turma.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Tag de Nível e Código */}
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {turma.nivel}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {turma.codigo || 'TURMA'}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition">
                  {turma.nome}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Faixa etária: <strong>{turma.faixaEtaria}</strong>
                </p>

                {/* Dados da Turma */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Turno & Horário:</span>
                    <strong className="text-slate-800">{turma.turno} ({turma.horario})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Professor(a):</span>
                    <strong className="text-slate-800">{turma.professorResponsavel || 'Não definido'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sala:</span>
                    <span className="text-slate-700 font-medium">{turma.sala || 'Geral'}</span>
                  </div>

                  {/* Apenas Diretoria/Secretaria vê valor financeiro sugerido */}
                  {['diretoria', 'secretaria'].includes(currentRole) && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Mensalidade Sugerida:</span>
                      <strong className="text-emerald-700 font-mono">{formatarMoeda(turma.mensalidadeSugerida)}</strong>
                    </div>
                  )}
                </div>

                {/* Barra de Lotação / Vagas */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-semibold">Ocupação de Vagas</span>
                    <span className="font-black text-slate-900">
                      {alunosNaTurma.length} / {turma.capacidadeMaxima} ({ocupacaoPerc}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ocupacaoPerc >= 90
                          ? 'bg-rose-500'
                          : ocupacaoPerc >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, ocupacaoPerc)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Ações da Turma */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  onClick={() => setTurmaAlunosModal(turma)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  Ver Alunos ({alunosNaTurma.length})
                </button>

                <button
                  onClick={() => onPrintDiario(turma)}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition"
                  title="Imprimir Lista de Presença da Turma"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {['diretoria', 'secretaria'].includes(currentRole) && (
                  <button
                    onClick={() => handleOpenModal(turma)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="Editar Turma"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Lista de Alunos da Turma */}
      {turmaAlunosModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-5 sm:p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/20 px-2.5 py-0.5 rounded-full">
                  {turmaAlunosModal.nivel} • {turmaAlunosModal.turno}
                </span>
                <h3 className="text-lg font-black tracking-tight mt-1">
                  Alunos da Turma {turmaAlunosModal.nome}
                </h3>
              </div>
              <button
                onClick={() => setTurmaAlunosModal(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-3">
              {students.filter((s) => s.turmaId === turmaAlunosModal.id).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Nenhum aluno matriculado nesta turma.</p>
              ) : (
                students
                  .filter((s) => s.turmaId === turmaAlunosModal.id)
                  .map((aluno, idx) => (
                    <div
                      key={aluno.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-slate-400 font-mono font-bold">{idx + 1}</span>
                        <div>
                          <p className="font-extrabold text-slate-900">{aluno.nome}</p>
                          <p className="text-[11px] text-slate-500">
                            Nasc: {formatarDataBR(aluno.dataNascimento)} • {aluno.idadeCalculada || 'Idade'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:self-end">
                        {aluno.saudeERotina?.alergias ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <Heart className="w-3 h-3 text-rose-500" />
                            Alergia: {aluno.saudeERotina.alergias}
                          </span>
                        ) : null}

                        <span className="text-[11px] text-slate-600 font-medium">
                          {aluno.responsaveis?.mae?.nome ? `Mãe: ${aluno.responsaveis.mae.nome}` : ''}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova / Editar Turma (Apenas Diretoria/Secretaria) */}
      {modalAberto && ['diretoria', 'secretaria'].includes(currentRole) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight">
                {turmaEmEdicao ? 'Editar Turma Escolar' : 'Cadastrar Nova Turma'}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarTurma} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome da Turma *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maternal, Jardim I..."
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Código</label>
                  <input
                    type="text"
                    placeholder="Ex: MAT, JD1"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nível de Ensino</label>
                  <select
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value as NivelEnsino)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="Educação Infantil">Educação Infantil</option>
                    <option value="Ensino Fundamental I">Ensino Fundamental I</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Faixa Etária</label>
                  <input
                    type="text"
                    placeholder="Ex: 1 a 2 anos"
                    value={faixaEtaria}
                    onChange={(e) => setFaixaEtaria(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Turno</label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value as Turno)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Integral">Integral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Horário de Aula</label>
                  <input
                    type="text"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Limite de Vagas</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={capacidade}
                    onChange={(e) => setCapacidade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Professor(a) Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: Tia Juliana"
                    value={professor}
                    onChange={(e) => setProfessor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sala / Espaço</label>
                  <input
                    type="text"
                    placeholder="Ex: Sala 01"
                    value={sala}
                    onChange={(e) => setSala(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mensalidade Padrão (R$)</label>
                  <input
                    type="number"
                    value={mensalidadeSugerida}
                    onChange={(e) => setMensalidadeSugerida(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                {turmaEmEdicao && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Deseja excluir esta turma?')) {
                        deleteTurma(turmaEmEdicao.id);
                        setModalAberto(false);
                      }
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Excluir
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-md transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Salvar Turma
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

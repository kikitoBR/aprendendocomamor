'use client';

import React, { useState, useMemo } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Student, Turma, BoletimAluno, Bimestre, DISCIPLINAS_FUNDAMENTAL_PADRAO, NotaItem } from '@/types';
import {
  GraduationCap,
  Award,
  Search,
  Printer,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Filter,
  Users,
  Sparkles,
  ChevronDown,
  Info,
  LayoutGrid,
  Table as TableIcon,
  HelpCircle,
} from 'lucide-react';

interface NotasBoletimViewProps {
  onPrintBoletim: (student: Student, boletim: BoletimAluno | null) => void;
}

export const NotasBoletimView: React.FC<NotasBoletimViewProps> = ({ onPrintBoletim }) => {
  const {
    students,
    turmas,
    boletins,
    config,
    currentRole,
    salvarNotaAluno,
    salvarBoletimCompleto,
    notify,
  } = useSchool();

  // Filtrar apenas turmas do Ensino Fundamental I ou turmas ativas
  const turmasFundamental = useMemo(() => {
    const fund = turmas.filter((t) => t.nivel === 'Ensino Fundamental I' || t.nome.toLowerCase().includes('ano'));
    return fund.length > 0 ? fund : turmas;
  }, [turmas]);

  const [selectedTurmaId, setSelectedTurmaId] = useState<string>(
    turmasFundamental[0]?.id || turmas[0]?.id || ''
  );
  const [selectedBimestre, setSelectedBimestre] = useState<Bimestre>(1);
  const [layoutMode, setLayoutMode] = useState<'tabela' | 'cards'>('tabela');
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Turma Ativa
  const activeTurma = turmas.find((t) => t.id === selectedTurmaId) || turmasFundamental[0];

  // Alunos da Turma Selecionada
  const alunosDaTurma = useMemo(() => {
    return students
      .filter((s) => s.turmaId === selectedTurmaId && s.status === 'Ativo')
      .filter((s) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return s.nome.toLowerCase().includes(q) || s.matricula.toLowerCase().includes(q);
      });
  }, [students, selectedTurmaId, searchQuery]);

  // Estado Local para Edição Rápida de Notas (Matriz alunoId -> disciplina -> { b1, b2, b3, b4, faltas })
  const [localNotas, setLocalNotas] = useState<{
    [alunoId: string]: {
      [disciplina: string]: { b1?: string; b2?: string; b3?: string; b4?: string; faltas?: string };
    };
  }>({});

  // Obter valor da nota (prioriza edição local, senão pega do contexto)
  const getValorNota = (
    alunoId: string,
    disciplina: string,
    bimestre: Bimestre
  ): string => {
    const bimestreKey = `b${bimestre}` as 'b1' | 'b2' | 'b3' | 'b4';
    if (localNotas[alunoId]?.[disciplina]?.[bimestreKey] !== undefined) {
      return localNotas[alunoId][disciplina][bimestreKey] || '';
    }

    const bol = boletins.find(
      (b) => b.alunoId === alunoId && b.anoLetivo === (config.anoLetivoAtivo || '2026')
    );
    const notaItem = bol?.notas?.find(
      (n) => n.disciplina.toLowerCase() === disciplina.toLowerCase()
    );
    const val = notaItem ? notaItem[bimestreKey] : undefined;
    return val !== undefined && val !== null ? String(val) : '';
  };

  const getFaltasNota = (alunoId: string, disciplina: string): string => {
    if (localNotas[alunoId]?.[disciplina]?.faltas !== undefined) {
      return localNotas[alunoId][disciplina].faltas || '0';
    }

    const bol = boletins.find(
      (b) => b.alunoId === alunoId && b.anoLetivo === (config.anoLetivoAtivo || '2026')
    );
    const notaItem = bol?.notas?.find(
      (n) => n.disciplina.toLowerCase() === disciplina.toLowerCase()
    );
    return String(notaItem?.faltas || 0);
  };

  const handleNotaChange = (
    alunoId: string,
    disciplina: string,
    bimestre: Bimestre,
    rawValue: string
  ) => {
    // Normalizar vírgula para ponto
    let formatted = rawValue.replace(',', '.');
    const num = parseFloat(formatted);

    if (formatted !== '' && isNaN(num)) return;
    if (num > 10.0) formatted = '10.0';
    if (num < 0) formatted = '0.0';

    const bimestreKey = `b${bimestre}` as 'b1' | 'b2' | 'b3' | 'b4';

    setLocalNotas((prev) => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        [disciplina]: {
          ...prev[alunoId]?.[disciplina],
          [bimestreKey]: formatted,
        },
      },
    }));
  };

  const handleFaltasChange = (
    alunoId: string,
    disciplina: string,
    rawValue: string
  ) => {
    const num = parseInt(rawValue, 10);
    const val = isNaN(num) ? '' : String(Math.max(0, num));

    setLocalNotas((prev) => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        [disciplina]: {
          ...prev[alunoId]?.[disciplina],
          faltas: val,
        },
      },
    }));
  };

  // Salvar uma nota específica no contexto
  const handleBlurSalvar = (
    alunoId: string,
    disciplina: string,
    bimestre: Bimestre
  ) => {
    const raw = getValorNota(alunoId, disciplina, bimestre);
    const faltasRaw = getFaltasNota(alunoId, disciplina);
    const num = raw === '' ? null : parseFloat(raw);
    const faltas = faltasRaw === '' ? 0 : parseInt(faltasRaw, 10);

    salvarNotaAluno(alunoId, disciplina, bimestre, num, faltas);
  };

  // Salvar todas as notas preenchidas da tela
  const handleSalvarTodas = () => {
    let totalSalvas = 0;
    alunosDaTurma.forEach((aluno) => {
      const disciplinasParaSalvar =
        selectedDisciplina === 'todas'
          ? DISCIPLINAS_FUNDAMENTAL_PADRAO
          : [selectedDisciplina];

      disciplinasParaSalvar.forEach((disc) => {
        const raw = getValorNota(aluno.id, disc, selectedBimestre);
        const faltasRaw = getFaltasNota(aluno.id, disc);
        const num = raw === '' ? null : parseFloat(raw);
        const faltas = faltasRaw === '' ? 0 : parseInt(faltasRaw, 10);

        if (num !== null) {
          salvarNotaAluno(aluno.id, disc, selectedBimestre, num, faltas);
          totalSalvas++;
        }
      });
    });

    notify(`Notas da turma salvas com sucesso!`, 'success', 'Notas Atualizadas');
  };

  // Estatísticas da Turma
  const estatisticas = useMemo(() => {
    let totalNotas = 0;
    let somaNotas = 0;
    let notasAcima6 = 0;
    let notasAbaixo6 = 0;

    alunosDaTurma.forEach((aluno) => {
      const bol = boletins.find(
        (b) => b.alunoId === aluno.id && b.anoLetivo === (config.anoLetivoAtivo || '2026')
      );
      bol?.notas?.forEach((n) => {
        const bimestreKey = `b${selectedBimestre}` as 'b1' | 'b2' | 'b3' | 'b4';
        const val = n[bimestreKey];
        if (val !== undefined && val !== null) {
          totalNotas++;
          somaNotas += val;
          if (val >= 6.0) notasAcima6++;
          else notasAbaixo6++;
        }
      });
    });

    const mediaGeral = totalNotas > 0 ? (somaNotas / totalNotas).toFixed(1) : '-';

    return {
      totalAlunos: alunosDaTurma.length,
      mediaGeral,
      aprovados: notasAcima6,
      recuperacao: notasAbaixo6,
    };
  }, [alunosDaTurma, boletins, config.anoLetivoAtivo, selectedBimestre]);

  const disciplinasExibidas = useMemo(() => {
    if (selectedDisciplina === 'todas') return DISCIPLINAS_FUNDAMENTAL_PADRAO;
    return [selectedDisciplina];
  }, [selectedDisciplina]);

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      
      {/* Banner Principal / Cabeçalho */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide text-purple-100">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Ensino Fundamental I • Rendimento & Notas</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Notas Escolares & Boletim Bimestral
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 max-w-2xl leading-relaxed">
              Lançamento e acompanhamento de notas do 1º ao 4º Bimestre (1º Ano em diante).
              Cálculo automático de médias e emissão de boletins timbrados em A4.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs border ${
                currentRole === 'diretoria'
                  ? 'bg-amber-400 text-amber-950 border-amber-300'
                  : currentRole === 'secretaria'
                  ? 'bg-emerald-400 text-emerald-950 border-emerald-300'
                  : 'bg-white text-purple-950 border-white/40'
              }`}
            >
              <span>
                {currentRole === 'diretoria'
                  ? '👑 Diretoria'
                  : currentRole === 'secretaria'
                  ? '📝 Secretaria'
                  : '🎓 Professora'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Cards de Métricas da Turma no Bimestre */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Alunos Turma
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900">
              {estatisticas.totalAlunos}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Média ({selectedBimestre}º Bim)
            </span>
            <span className="text-lg sm:text-2xl font-black text-orange-600">
              {estatisticas.mediaGeral}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Notas ≥ 6,0
            </span>
            <span className="text-lg sm:text-2xl font-black text-emerald-700">
              {estatisticas.aprovados}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Notas &lt; 6,0
            </span>
            <span className="text-lg sm:text-2xl font-black text-rose-700">
              {estatisticas.recuperacao}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros & Configuração do Lançamento */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          
          {/* Seletor de Turma */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Turma do Fundamental:
            </label>
            <select
              value={selectedTurmaId}
              onChange={(e) => setSelectedTurmaId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl focus:ring-2 focus:ring-purple-400 cursor-pointer"
            >
              {turmasFundamental.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.turno}) • Prof. {t.professorResponsavel || 'Regente'}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Bimestre */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Bimestre de Lançamento:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {([1, 2, 3, 4] as Bimestre[]).map((bim) => (
                <button
                  key={bim}
                  type="button"
                  onClick={() => setSelectedBimestre(bim)}
                  className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedBimestre === bim
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {bim}º Bim
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de Disciplina / Filtro */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Componente Curricular:
            </label>
            <select
              value={selectedDisciplina}
              onChange={(e) => setSelectedDisciplina(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs px-3.5 py-2.5 rounded-2xl focus:ring-2 focus:ring-purple-400 cursor-pointer"
            >
              <option value="todas">Todas as Disciplinas (Grade Completa)</option>
              {DISCIPLINAS_FUNDAMENTAL_PADRAO.map((disc) => (
                <option key={disc} value={disc}>
                  {disc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Barra de Busca, Alternador de Layout e Ações */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar aluno por nome ou matrícula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs pl-10 pr-3.5 py-2.5 rounded-2xl focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Alternador de Layout (Tabela vs Cards para Mobile) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setLayoutMode('tabela')}
                className={`p-1.5 rounded-lg transition ${
                  layoutMode === 'tabela' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Modo Planilha / Tabela"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('cards')}
                className={`p-1.5 rounded-lg transition ${
                  layoutMode === 'cards' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Modo Cards (Celular / Tablet)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSalvarTodas}
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              title="Salvar todas as notas lançadas nesta tela"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Todas as Notas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grade de Lançamento de Notas */}
      {alunosDaTurma.length > 0 ? (
        layoutMode === 'tabela' ? (
          /* MODO TABELA: Com Coluna do Aluno e Ações Fixas (Sticky) */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-2">
            
            {/* Cabeçalho da Tabela */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70">
              <div>
                <h3 className="font-black text-xs sm:text-sm text-slate-900 uppercase">
                  Planilha de Rendimento • {activeTurma?.nome} ({selectedBimestre}º Bimestre)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Valores de 0.0 a 10.0 salvos automaticamente ao sair do campo.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200 text-[10.5px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> ≥ 6.0 Aprovado
                </span>
                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded-md border border-rose-200 text-[10.5px]">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt; 6.0 Apoio
                </span>
              </div>
            </div>

            {/* Dica de Rolagem Horizontal */}
            <div className="px-4 py-1.5 text-[11px] text-purple-700 bg-purple-50/60 flex items-center gap-1.5 border-b border-purple-100">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                Role horizontalmente para preencher todas as matérias. O nome do aluno permanece fixo à esquerda.
              </span>
            </div>

            {/* Tabela com Scroll Responsivo e Coluna do Aluno Fixa */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-[10.5px] font-black tracking-wider border-b border-slate-200">
                    <th className="p-3 pl-4 w-56 sticky left-0 bg-slate-100 z-20 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.06)]">
                      Aluno
                    </th>
                    {disciplinasExibidas.map((disc) => (
                      <th key={disc} className="p-2.5 text-center min-w-[95px]">
                        {disc}
                      </th>
                    ))}
                    <th className="p-2.5 text-center w-24">Média Bim.</th>
                    <th className="p-2.5 pr-4 text-center w-32 sticky right-0 bg-slate-100 z-20 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alunosDaTurma.map((aluno, idx) => {
                    const bol = boletins.find(
                      (b) => b.alunoId === aluno.id && b.anoLetivo === (config.anoLetivoAtivo || '2026')
                    );

                    // Calcular Média do Bimestre deste Aluno
                    const notasAlunoBim: number[] = [];
                    disciplinasExibidas.forEach((d) => {
                      const valStr = getValorNota(aluno.id, d, selectedBimestre);
                      if (valStr !== '') {
                        const n = parseFloat(valStr);
                        if (!isNaN(n)) notasAlunoBim.push(n);
                      }
                    });

                    const mediaBim =
                      notasAlunoBim.length > 0
                        ? (notasAlunoBim.reduce((a, b) => a + b, 0) / notasAlunoBim.length).toFixed(1)
                        : '-';

                    return (
                      <tr key={aluno.id} className="hover:bg-slate-50/90 transition group">
                        
                        {/* Dados do Aluno (STICKY À ESQUERDA) */}
                        <td className="p-3 pl-4 sticky left-0 bg-white group-hover:bg-slate-50 z-20 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.06)]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0">
                              {aluno.nome.charAt(0)}
                            </div>
                            <div className="truncate max-w-[170px]">
                              <span className="font-extrabold text-slate-900 block leading-tight truncate">
                                {aluno.nome}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {aluno.matricula}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Inputs de Notas por Disciplina */}
                        {disciplinasExibidas.map((disc) => {
                          const val = getValorNota(aluno.id, disc, selectedBimestre);
                          const numVal = parseFloat(val);
                          const isAbaixo = val !== '' && !isNaN(numVal) && numVal < 6.0;

                          return (
                            <td key={disc} className="p-1.5 text-center">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                placeholder="-"
                                value={val}
                                onChange={(e) =>
                                  handleNotaChange(aluno.id, disc, selectedBimestre, e.target.value)
                                }
                                onBlur={() => handleBlurSalvar(aluno.id, disc, selectedBimestre)}
                                className={`w-15 text-center font-black text-xs py-1 px-1 rounded-xl border transition ${
                                  isAbaixo
                                    ? 'bg-rose-50 border-rose-300 text-rose-700 font-black'
                                    : val !== ''
                                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-extrabold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                } focus:ring-2 focus:ring-purple-400 focus:outline-none`}
                              />
                            </td>
                          );
                        })}

                        {/* Média Bimestral */}
                        <td className="p-2.5 text-center">
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-lg uppercase ${
                              mediaBim !== '-' && parseFloat(mediaBim) >= 6.0
                                ? 'bg-emerald-100 text-emerald-900'
                                : mediaBim !== '-'
                                ? 'bg-rose-100 text-rose-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {mediaBim}
                          </span>
                        </td>

                        {/* Ações (STICKY À DIREITA) */}
                        <td className="p-2.5 pr-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-20 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">
                          <button
                            type="button"
                            onClick={() => onPrintBoletim(aluno, bol || null)}
                            className="inline-flex items-center gap-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-xl shadow-2xs transition cursor-pointer"
                            title="Imprimir Boletim Oficial A4"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-300" />
                            <span>Boletim A4</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* MODO CARDS: Ideal para Celulares e Tablets */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alunosDaTurma.map((aluno) => {
              const bol = boletins.find(
                (b) => b.alunoId === aluno.id && b.anoLetivo === (config.anoLetivoAtivo || '2026')
              );

              const notasAlunoBim: number[] = [];
              disciplinasExibidas.forEach((d) => {
                const valStr = getValorNota(aluno.id, d, selectedBimestre);
                if (valStr !== '') {
                  const n = parseFloat(valStr);
                  if (!isNaN(n)) notasAlunoBim.push(n);
                }
              });

              const mediaBim =
                notasAlunoBim.length > 0
                  ? (notasAlunoBim.reduce((a, b) => a + b, 0) / notasAlunoBim.length).toFixed(1)
                  : '-';

              return (
                <div
                  key={aluno.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3.5"
                >
                  {/* Topo do Card com Nome e Botão de Boletim */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center shrink-0">
                        {aluno.nome.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-tight">
                          {aluno.nome}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          Matrícula: {aluno.matricula}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                          mediaBim !== '-' && parseFloat(mediaBim) >= 6.0
                            ? 'bg-emerald-100 text-emerald-900'
                            : mediaBim !== '-'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        Média: {mediaBim}
                      </span>
                      <button
                        type="button"
                        onClick={() => onPrintBoletim(aluno, bol || null)}
                        className="p-2 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition cursor-pointer"
                        title="Imprimir Boletim A4"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-300" />
                      </button>
                    </div>
                  </div>

                  {/* Grade de Disciplinas e Notas do Aluno */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {disciplinasExibidas.map((disc) => {
                      const val = getValorNota(aluno.id, disc, selectedBimestre);
                      const numVal = parseFloat(val);
                      const isAbaixo = val !== '' && !isNaN(numVal) && numVal < 6.0;

                      return (
                        <div
                          key={disc}
                          className="bg-slate-50/80 p-2 rounded-xl border border-slate-100 flex items-center justify-between gap-1.5"
                        >
                          <span className="text-[10px] font-bold text-slate-700 truncate block">
                            {disc}
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="-"
                            value={val}
                            onChange={(e) =>
                              handleNotaChange(aluno.id, disc, selectedBimestre, e.target.value)
                            }
                            onBlur={() => handleBlurSalvar(aluno.id, disc, selectedBimestre)}
                            className={`w-12 text-center font-black text-xs py-1 rounded-lg border shrink-0 ${
                              isAbaixo
                                ? 'bg-rose-50 border-rose-300 text-rose-700'
                                : val !== ''
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : 'bg-white border-slate-200 text-slate-800'
                            } focus:ring-2 focus:ring-purple-400 focus:outline-none`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Nenhum aluno encontrado para esta turma
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Verifique se há alunos matriculados na turma selecionada ou ajuste os termos de busca no filtro acima.
          </p>
        </div>
      )}
    </div>
  );
};

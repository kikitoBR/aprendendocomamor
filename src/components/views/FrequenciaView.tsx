'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Turma, Student, StatusFrequencia, ChamadaFrequencia } from '@/types';
import { formatarDataBR } from '@/utils/helpers';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  Printer,
  Save,
  BookOpen,
  CheckCheck,
  User,
  Percent,
  TrendingUp,
  Image as ImageIcon,
  Camera,
  Trash2,
  X,
  Plus,
} from 'lucide-react';

interface FrequenciaViewProps {
  onPrintDiario: (turma: Turma, dataChamada?: string) => void;
}

export const FrequenciaView: React.FC<FrequenciaViewProps> = ({ onPrintDiario }) => {
  const { turmas, students, frequencias, salvarChamada, currentRole } = useSchool();

  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<string>(turmas[0]?.id || 'jardim-1-tarde');
  const [dataChamada, setDataChamada] = useState<string>(new Date().toISOString().slice(0, 10));
  const [registros, setRegistros] = useState<{ [alunoId: string]: StatusFrequencia }>({});
  const [observacoes, setObservacoes] = useState<{ [alunoId: string]: string }>({});
  const [conteudoMinistrado, setConteudoMinistrado] = useState('');
  const [fotosAtividades, setFotosAtividades] = useState<string[]>([]);
  const [salvoSucesso, setSalvoSucesso] = useState(false);

  const turmaAtual = turmas.find((t) => t.id === turmaSelecionadaId) || turmas[0];
  const alunosDaTurma = students.filter((s) => s.turmaId === turmaSelecionadaId && s.status === 'Ativo');

  // Determinar ano, mês e nome do mês com base na data da chamada
  const [anoChamadaStr, mesChamadaStr] = dataChamada.split('-');
  const mesNumChamada = parseInt(mesChamadaStr, 10) || 2;
  const MESES_NOMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mesNomeChamada = MESES_NOMES[mesNumChamada - 1] || 'Mês';

  // Chamadas registradas desta turma no mês selecionado
  const chamadasDoMesTurma = frequencias.filter(
    (f) => f.turmaId === turmaSelecionadaId && f.data.startsWith(`${anoChamadaStr}-${mesChamadaStr}`)
  );

  // Calcular estatísticas mensais gerais da turma
  let totalPresencasMes = 0;
  let totalRegistrosMes = 0;

  chamadasDoMesTurma.forEach((c) => {
    c.registros.forEach((r) => {
      totalRegistrosMes++;
      if (r.status === 'Presente') totalPresencasMes++;
    });
  });

  // Estatísticas de presença por aluno no mês
  const getStatsAlunoMes = (alunoId: string) => {
    let p = 0;
    let total = 0;
    chamadasDoMesTurma.forEach((c) => {
      const reg = c.registros.find((r) => r.alunoId === alunoId);
      if (reg) {
        total++;
        if (reg.status === 'Presente') p++;
      }
    });

    // Se o dia de hoje já está com registro local mas não salvo na lista, computar
    const statusHoje = registros[alunoId] || 'Presente';
    const chamadaJaSalvaHoje = chamadasDoMesTurma.some((c) => c.data === dataChamada);
    if (!chamadaJaSalvaHoje) {
      total++;
      if (statusHoje === 'Presente') p++;
    }

    const pct = total > 0 ? Math.round((p / total) * 100) : 100;
    return { presencas: p, total: Math.max(total, 1), pct };
  };

  // Porcentagem geral da turma no mês
  const pctFrequenciaMesTurma = totalRegistrosMes > 0
    ? Math.round((totalPresencasMes / totalRegistrosMes) * 100)
    : 100;

  // Carregar chamada existente para o dia ou inicializar como Presente
  useEffect(() => {
    const chamadaExistente = frequencias.find(
      (f) => f.turmaId === turmaSelecionadaId && f.data === dataChamada
    );

    if (chamadaExistente) {
      const regMap: { [alunoId: string]: StatusFrequencia } = {};
      const obsMap: { [alunoId: string]: string } = {};

      chamadaExistente.registros.forEach((r) => {
        regMap[r.alunoId] = r.status;
        if (r.observacao) obsMap[r.alunoId] = r.observacao;
      });

      setRegistros(regMap);
      setObservacoes(obsMap);
      setConteudoMinistrado(chamadaExistente.conteudoMinistrado || '');
      setFotosAtividades(chamadaExistente.fotosAtividades || []);
    } else {
      // Padrão: todos presentes
      const regMap: { [alunoId: string]: StatusFrequencia } = {};
      alunosDaTurma.forEach((a) => {
        regMap[a.id] = 'Presente';
      });
      setRegistros(regMap);
      setObservacoes({});
      setConteudoMinistrado('');
      setFotosAtividades([]);
    }
    setSalvoSucesso(false);
  }, [turmaSelecionadaId, dataChamada, frequencias]);

  const handleUploadFotosAtividades = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFotosAtividades((prev) => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoverFotoAtividade = (index: number) => {
    setFotosAtividades((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStatusChange = (alunoId: string, status: StatusFrequencia) => {
    setRegistros((prev) => ({ ...prev, [alunoId]: status }));
  };

  const handleMarcarTodos = (status: StatusFrequencia) => {
    const novoMap: { [alunoId: string]: StatusFrequencia } = {};
    alunosDaTurma.forEach((a) => {
      novoMap[a.id] = status;
    });
    setRegistros(novoMap);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaAtual) return;

    const listaRegistros = alunosDaTurma.map((aluno) => ({
      alunoId: aluno.id,
      alunoNome: aluno.nome,
      fotoUrl: aluno.fotoUrl,
      status: registros[aluno.id] || 'Presente',
      observacao: observacoes[aluno.id] || '',
    }));

    salvarChamada({
      turmaId: turmaAtual.id,
      turmaNome: turmaAtual.nome,
      turno: turmaAtual.turno,
      data: dataChamada,
      registros: listaRegistros,
      conteudoMinistrado,
      fotosAtividades,
      registradoPor: currentRole === 'professor' ? (turmaAtual.professorResponsavel || 'Professor') : 'Coordenação',
    });

    setSalvoSucesso(true);
    setTimeout(() => setSalvoSucesso(false), 3500);
  };

  // Contadores do dia
  const totalPresentes = Object.values(registros).filter((s) => s === 'Presente').length;
  const totalFaltas = Object.values(registros).filter((s) => s === 'Falta').length;
  const totalJustificadas = Object.values(registros).filter((s) => s === 'Justificada').length;
  const pctPresencaHoje = alunosDaTurma.length > 0 ? Math.round((totalPresentes / alunosDaTurma.length) * 100) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pedagógico • Chamada & Frequência Diária
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Registro visual rápido de presenças, faltas e diário de classe da Educação Infantil e Fundamental.
          </p>
        </div>

        {turmaAtual && (
          <button
            onClick={() => onPrintDiario(turmaAtual, dataChamada)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow transition"
          >
            <Printer className="w-4 h-4" />
            Imprimir Diário de Presença
          </button>
        )}
      </div>

      {/* Barra de Seleção de Turma, Data e Porcentagem de Frequência do Mês */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto min-w-0 flex-1">
          {/* Seletor de Turma */}
          <div className="min-w-0">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Turma Selecionada
            </label>
            <select
              value={turmaSelecionadaId}
              onChange={(e) => setTurmaSelecionadaId(e.target.value)}
              className="w-full max-w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white truncate focus:outline-hidden focus:ring-2 focus:ring-orange-400"
            >
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.turno}) • Prof. {t.professorResponsavel || 'Geral'}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Data */}
          <div className="min-w-0">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Data da Chamada
            </label>
            <input
              type="date"
              value={dataChamada}
              onChange={(e) => setDataChamada(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* Resumo Rápido da Chamada + Porcentagem de Frequência do Mês */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 w-full lg:w-auto justify-around shrink-0">
          <div className="text-center px-1.5 sm:px-2 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Total</span>
            <span className="text-sm font-black text-slate-900">{alunosDaTurma.length}</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-slate-300" />
          <div className="text-center px-1.5 sm:px-2 min-w-0">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block truncate">Presentes</span>
            <span className="text-sm font-black text-emerald-700">{totalPresentes}</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-slate-300" />
          <div className="text-center px-1.5 sm:px-2 min-w-0">
            <span className="text-[10px] uppercase font-bold text-rose-700 block truncate">Faltas</span>
            <span className="text-sm font-black text-rose-700">{totalFaltas}</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-slate-300" />
          <div className="text-center px-1.5 sm:px-2 min-w-0">
            <span className="text-[10px] uppercase font-bold text-amber-700 block truncate">Justif.</span>
            <span className="text-sm font-black text-amber-700">{totalJustificadas}</span>
          </div>
          <div className="h-6 w-px bg-slate-300" />
          {/* Porcentagem de Frequência do Mês */}
          <div className="text-center px-2 py-0.5 rounded-xl bg-emerald-100/70 border border-emerald-300 min-w-0">
            <span className="text-[9.5px] uppercase font-black text-emerald-900 block truncate">
              Freq. {mesNomeChamada}
            </span>
            <span className="text-sm font-black text-emerald-800 font-mono">
              {pctFrequenciaMesTurma}%
            </span>
          </div>
        </div>
      </div>

      {/* Ações de Lote e Modo de Acesso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {currentRole === 'professor' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarcarTodos('Presente')}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3.5 py-1.5 rounded-xl text-xs border border-emerald-200 transition"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              Marcar Todos Presentes
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold">
            <span>👁️ <strong>Modo Consulta</strong> • Apenas professores(as) podem lançar e alterar frequências.</span>
          </div>
        )}

        {salvoSucesso && (
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Chamada Salva com Sucesso!
          </div>
        )}
      </div>

      {/* Formulário com Lista de Alunos */}
      <form onSubmit={handleSalvar} className="space-y-6">
        {alunosDaTurma.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-2">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">Nenhum aluno matriculado nesta turma</h3>
            <p className="text-slate-400 text-xs">Cadastre alunos para esta turma no módulo de Alunos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alunosDaTurma.map((aluno, idx) => {
              const statusAtual = registros[aluno.id] || 'Presente';
              const statsAluno = getStatsAlunoMes(aluno.id);

              return (
                <div
                  key={aluno.id}
                  className={`rounded-3xl p-4 border transition flex flex-col justify-between space-y-3 bg-white shadow-sm ${
                    statusAtual === 'Presente'
                      ? 'border-emerald-200 hover:border-emerald-400'
                      : statusAtual === 'Falta'
                      ? 'border-rose-200 bg-rose-50/20 hover:border-rose-400'
                      : 'border-amber-200 bg-amber-50/20 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-400 w-5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {aluno.fotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={aluno.fotoUrl} alt={aluno.nome} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-amber-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="font-bold text-xs text-slate-900 uppercase truncate">
                          {aluno.nome}
                        </h4>
                        <span
                          className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-lg shrink-0 border ${
                            statsAluno.pct >= 85
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : statsAluno.pct >= 75
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                          title={`Assiduidade em ${mesNomeChamada}: ${statsAluno.presencas} presenças de ${statsAluno.total} chamadas`}
                        >
                          {statsAluno.pct}% Mês
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Matrícula: {aluno.matricula} • <strong className="text-slate-700 font-semibold">{statsAluno.presencas}/{statsAluno.total}</strong> presenças ({mesNomeChamada})
                      </p>
                    </div>
                  </div>

                  {/* Ações de Frequência: Editável para Professor, Badge para Diretoria/Secretaria */}
                  {currentRole === 'professor' ? (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(aluno.id, 'Presente')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                          statusAtual === 'Presente'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Presente
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(aluno.id, 'Falta')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                          statusAtual === 'Falta'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Falta
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(aluno.id, 'Justificada')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                          statusAtual === 'Justificada'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Justificada
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-slate-500 font-medium text-[11px]">Registro do Dia:</span>
                      <span
                        className={`px-3 py-1 rounded-xl font-black uppercase text-[11px] flex items-center gap-1 ${
                          statusAtual === 'Presente'
                            ? 'bg-emerald-100 text-emerald-800'
                            : statusAtual === 'Falta'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {statusAtual === 'Presente' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Presente
                          </>
                        ) : statusAtual === 'Falta' ? (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Falta
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Falta Justificada
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Diário de Classe / Conteúdo da Aula & Fotos das Atividades */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-500" />
              Diário de Classe & Atividades Realizadas Hoje
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Data: {formatarDataBR(dataChamada)} • {turmaAtual?.nome}
            </span>
          </div>

          {currentRole === 'professor' ? (
            <div className="space-y-3">
              <textarea
                rows={3}
                value={conteudoMinistrado}
                onChange={(e) => setConteudoMinistrado(e.target.value)}
                placeholder="Ex: Roda de acolhimento e contação da história 'O Monstro das Cores'. Atividade lúdica com massinha de modelar caseira..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 text-xs text-slate-800"
              />

              {/* Seção de Fotos das Atividades do Dia */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-orange-950">
                      Fotos das Atividades de Hoje na Sala de Aula ({fotosAtividades.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-orange-800 font-medium hidden sm:inline">
                    Visível para os pais no Portal da Família
                  </span>
                </div>

                {/* Grade de Fotos Anexadas */}
                {fotosAtividades.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                    {fotosAtividades.map((foto, index) => (
                      <div
                        key={index}
                        className="relative group rounded-xl overflow-hidden border border-orange-300/80 bg-white aspect-square shadow-2xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={foto}
                          alt={`Atividade ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoverFotoAtividade(index)}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 shadow-md transition"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botão de Upload de Fotos */}
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-orange-300 hover:border-orange-500 bg-white/90 hover:bg-orange-100/50 cursor-pointer transition text-center">
                  <Camera className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-orange-900">
                    + Anexar Fotos das Atividades (Celular / Computador)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUploadFotosAtividades}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                {conteudoMinistrado ? `“${conteudoMinistrado}”` : 'Nenhum conteúdo registrado pelo professor para esta data.'}
              </div>

              {/* Exibição das Fotos para Diretoria / Secretaria */}
              {fotosAtividades.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                    Fotos Anexadas pelo Educador ({fotosAtividades.length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {fotosAtividades.map((foto, index) => (
                      <div
                        key={index}
                        className="rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square shadow-2xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={foto}
                          alt={`Atividade ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">Nenhuma foto de atividade anexada nesta data.</p>
              )}
            </div>
          )}
        </div>

        {/* Botão Salvar Chamada (Exclusivo Professor) */}
        {currentRole === 'professor' && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            {salvoSucesso && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold animate-in fade-in zoom-in-95 duration-200">
                <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Chamada da turma salva e sincronizada com sucesso!</span>
              </div>
            )}

            <button
              type="submit"
              className={`flex items-center gap-2 font-black px-8 py-3.5 rounded-2xl text-sm shadow-xl transition-all duration-300 transform active:scale-95 ${
                salvoSucesso
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30 scale-105'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20'
              }`}
            >
              {salvoSucesso ? (
                <>
                  <CheckCheck className="w-5 h-5 animate-bounce" />
                  <span>Salvo com Sucesso! ✓</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salvar Chamada & Diário</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Student, Mensalidade, Turma, ChamadaFrequencia } from '@/types';
import { formatarMoeda, formatarDataBR, linkWhatsApp, mesesAno } from '@/utils/helpers';
import {
  Heart,
  Calendar,
  CreditCard,
  FileText,
  Printer,
  MessageCircle,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  MapPin,
  Megaphone,
  BellRing,
  Pin,
  BookmarkCheck,
  Smile,
  Baby,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

interface PortalResponsavelViewProps {
  onPrintFicha: (student: Student) => void;
  onPrintCarne: (student: Student) => void;
  onOpenRecibo: (mensalidade: Mensalidade, student: Student) => void;
}

export const PortalResponsavelView: React.FC<PortalResponsavelViewProps> = ({
  onPrintFicha,
  onPrintCarne,
  onOpenRecibo,
}) => {
  const {
    students,
    turmas,
    mensalidades,
    frequencias,
    avisos,
    config,
    parentStudentId,
    setParentStudentId,
    notify,
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'avisos' | 'financeiro' | 'frequencia' | 'geral'>('avisos');
  const [mesFrequenciaIndex, setMesFrequenciaIndex] = useState<number>(new Date().getMonth() + 1);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [avisosLidos, setAvisosLidos] = useState<{ [avisoId: string]: boolean }>({});

  const handleConfirmarLeitura = (avisoId: string, titulo: string) => {
    const novoStatus = !avisosLidos[avisoId];
    setAvisosLidos((prev) => ({ ...prev, [avisoId]: novoStatus }));
    if (novoStatus) {
      notify(`Você confirmou a leitura de "${titulo}"`, 'success', 'Leitura Confirmada');
    }
  };

  // Aluno Selecionado
  const currentStudent = students.find((s) => s.id === parentStudentId) || students[0];
  const turmaDoAluno = turmas.find((t) => t.id === currentStudent?.turmaId) || turmas[0];

  // Mensalidades do Aluno
  const mensalidadesDoAluno = currentStudent
    ? mensalidades
        .filter((m) => m.alunoId === currentStudent.id && m.ano === 2026)
        .sort((a, b) => a.mesIndex - b.mesIndex)
    : [];

  const totalPagas = mensalidadesDoAluno.filter((m) => m.status === 'Pago').length;
  const totalPendentes = mensalidadesDoAluno.filter((m) => m.status !== 'Pago').length;

  // Frequência do Mês Selecionado
  const listaMeses = mesesAno();
  const mesAtualObj = listaMeses.find((m) => m.index === mesFrequenciaIndex) || listaMeses[1];
  const totalDiasNoMes = new Date(2026, mesFrequenciaIndex, 0).getDate();
  const diasDoMes = Array.from({ length: totalDiasNoMes }, (_, i) => i + 1);

  // Filtrar chamadas do aluno no mês
  const chamadasDoMes = frequencias.filter((f) => {
    if (f.turmaId !== currentStudent?.turmaId) return false;
    const parts = f.data.split('-');
    return parts.length === 3 && parseInt(parts[1], 10) === mesFrequenciaIndex;
  });

  const mapaPresencas: { [dia: number]: { status: string; observacao?: string } } = {};
  chamadasDoMes.forEach((c) => {
    const diaNum = parseInt(c.data.split('-')[2], 10);
    const reg = c.registros.find((r) => r.alunoId === currentStudent?.id);
    if (reg) {
      mapaPresencas[diaNum] = { status: reg.status, observacao: reg.observacao };
    }
  });

  const totalPresencas = Object.values(mapaPresencas).filter((p) => p.status === 'Presente').length;
  const totalFaltas = Object.values(mapaPresencas).filter((p) => p.status === 'Falta').length;
  const totalJustificadas = Object.values(mapaPresencas).filter((p) => p.status === 'Justificada').length;

  // Última Anotação do Diário de Classe
  const ultimaChamadaComConteudo = frequencias
    .filter((f) => f.turmaId === currentStudent?.turmaId && f.conteudoMinistrado)
    .sort((a, b) => b.data.localeCompare(a.data))[0];

  const handleCopiarPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(config.chavePix);
      setCopiadoPix(true);
      notify('Chave PIX da escola copiada com sucesso!', 'success', 'PIX Copiado');
      setTimeout(() => setCopiadoPix(false), 3000);
    }
  };

  const linkZapSecretaria = linkWhatsApp(
    config.telefonePrincipal,
    `Olá Secretaria da Escola Aprendendo com Amor! Sou responsável pelo(a) aluno(a) ${currentStudent?.nome} (Matrícula: ${currentStudent?.matricula}) e gostaria de tirar uma dúvida.`
  );

  // Comunicados destinados aos pais / família
  const avisosParaPais = avisos.filter(
    (a) => !a.publicoAlvo || a.publicoAlvo === 'pais' || a.publicoAlvo === 'ambos'
  );

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
        <Baby className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Nenhum aluno encontrado</h3>
        <p className="text-xs text-slate-500 mt-1">Selecione um aluno para visualizar o portal da família.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Banner de Boas-Vindas & Seletor de Filho(a) */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide text-purple-100">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-300" />
              <span>Portal da Família • Escola Aprendendo com Amor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Acompanhamento Escolar & Financeiro
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 max-w-2xl leading-relaxed">
              Bem-vindos! Aqui você acompanha a frequência diária, recados pedagógicos da professora, 2ª via de recibos e chave PIX para pagamentos.
            </p>
          </div>

          {/* Seletor de Aluno / Irmãos */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shrink-0 flex flex-col gap-1.5 min-w-[240px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
              Visualizando Filho(a):
            </span>
            <select
              value={currentStudent.id}
              onChange={(e) => {
                setParentStudentId(e.target.value);
                notify(`Visualizando dados de ${students.find((s) => s.id === e.target.value)?.nome}`, 'info');
              }}
              className="w-full bg-white text-slate-900 font-extrabold text-xs px-3 py-2 rounded-xl border border-transparent shadow-sm focus:ring-2 focus:ring-purple-400 cursor-pointer"
            >
              {students.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome} ({aluno.turmaNome})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Card Principal de Perfil do Filho(a) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative w-18 h-22 sm:w-20 sm:h-24 rounded-2xl bg-amber-50 border-2 border-amber-200 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
            {currentStudent.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentStudent.fotoUrl} alt={currentStudent.nome} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-amber-500" />
            )}
            <span className="absolute bottom-1 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
              3x4
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-purple-100 text-purple-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full font-mono">
                Matrícula: {currentStudent.matricula}
              </span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Turma {currentStudent.turmaNome}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Ano Letivo 2026
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {currentStudent.nome}
            </h2>

            <p className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
              <span>🎂 <strong>Nascimento:</strong> {formatarDataBR(currentStudent.dataNascimento)} ({currentStudent.idadeCalculada})</span>
              <span>⏰ <strong>Turno:</strong> {currentStudent.turno} ({currentStudent.horario || '13:00 às 17:00'})</span>
              <span>👩‍🏫 <strong>Professora:</strong> {turmaDoAluno?.professorResponsavel || 'Tia Juliana Ribeiro'}</span>
            </p>
          </div>
        </div>

        {/* Botões Rápidos */}
        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          <button
            onClick={() => onPrintFicha(currentStudent)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
            title="Visualizar e Imprimir Ficha Oficial Timbrada (A4)"
          >
            <Printer className="w-4 h-4" />
            <span>Ficha Oficial A4</span>
          </button>

          <button
            onClick={() => onPrintCarne(currentStudent)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
            title="Imprimir Carnê de Mensalidades 2026"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Carnê 2026</span>
          </button>

          <a
            href={linkZapSecretaria}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-sm transition shrink-0"
            title="Falar com a Secretaria no WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp Escola</span>
          </a>
        </div>
      </div>

      {/* Navegação por Abas do Portal (Mural de Comunicados em 1º Lugar com Destaque Máximo) */}
      <div className="bg-white rounded-3xl p-1.5 border border-slate-100 shadow-sm flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('avisos')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs font-black transition shrink-0 relative ${
            activeSubTab === 'avisos'
              ? 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-300'
              : 'text-orange-700 bg-orange-50/80 hover:bg-orange-100/80 border border-orange-200/60'
          }`}
        >
          <div className="relative">
            <Megaphone className={`w-4 h-4 ${activeSubTab === 'avisos' ? 'animate-bounce' : 'text-orange-600'}`} />
            {avisosParaPais.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <span>Mural de Comunicados</span>
          {avisosParaPais.length > 0 && (
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeSubTab === 'avisos'
                  ? 'bg-white text-orange-700 shadow-xs'
                  : 'bg-orange-500 text-white'
              }`}
            >
              {avisosParaPais.length} {avisosParaPais.length === 1 ? 'aviso' : 'avisos'}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('financeiro')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black transition shrink-0 ${
            activeSubTab === 'financeiro'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Mensalidades & PIX (2ª Via)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('frequencia')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black transition shrink-0 ${
            activeSubTab === 'frequencia'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Frequência & Diário</span>
        </button>

        <button
          onClick={() => setActiveSubTab('geral')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black transition shrink-0 ${
            activeSubTab === 'geral'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Ficha & Saúde</span>
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}

      {/* ABA 1: FICHA & SAÚDE */}
      {activeSubTab === 'geral' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados Médicos e Cuidados */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Saúde, Alergias & Rotina de Cuidados
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="font-bold text-amber-900 block uppercase text-[10px]">Alergias e Restrições:</span>
                <p className="text-slate-800 font-semibold">
                  {currentStudent.saudeERotina?.alergias || 'Nenhuma alergia relatada'}
                </p>
                <p className="text-slate-600 text-[11px]">
                  <strong>Alimentação:</strong> {currentStudent.saudeERotina?.restricoesAlimentares || 'Sem restrição alimentar'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-700 block uppercase text-[10px]">Pessoas Autorizadas na Portaria:</span>
                <p className="text-slate-900 font-semibold">
                  {currentStudent.saudeERotina?.pessoasAutorizadasBusca || currentStudent.responsaveis?.mae?.nome || 'Apenas os pais/responsáveis legais'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-700 block uppercase text-[10px]">Contatos de Emergência:</span>
                <p className="text-rose-700 font-bold">
                  🚨 {currentStudent.responsaveis?.numeroEmergencia || currentStudent.responsaveis?.mae?.telefone || 'Telefone da mãe'}
                </p>
                {currentStudent.responsaveis?.numeroReserva && (
                  <p className="text-slate-600">Reserva: {currentStudent.responsaveis.numeroReserva}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dados dos Responsáveis & Endereço */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Responsáveis & Endereço Cadastrado
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-700 block uppercase text-[10px]">Mãe:</span>
                <p className="text-slate-900 font-bold">{currentStudent.responsaveis?.mae?.nome || 'Não informada'}</p>
                <p className="text-slate-600">Telefone: {currentStudent.responsaveis?.mae?.telefone || '-'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-700 block uppercase text-[10px]">Pai:</span>
                <p className="text-slate-900 font-bold">{currentStudent.responsaveis?.pai?.nome || 'Não informado'}</p>
                <p className="text-slate-600">Telefone: {currentStudent.responsaveis?.pai?.telefone || '-'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-700 block uppercase text-[10px]">Endereço Residencial:</span>
                <p className="text-slate-800">
                  {currentStudent.endereco?.rua}, {currentStudent.endereco?.numeroCasa} – {currentStudent.endereco?.bairro}, {currentStudent.endereco?.cidade}/{currentStudent.endereco?.uf}
                </p>
                <p className="text-slate-500 font-mono text-[10px]">CEP: {currentStudent.endereco?.cep || '28055-160'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: FREQUÊNCIA & DIÁRIO */}
      {activeSubTab === 'frequencia' && (
        <div className="space-y-6">
          {/* Seletor de Meses & Resumo */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Frequência Mensal de {currentStudent.nome.split(' ')[0]}
                </h3>
              </div>

              {/* Seletor de Mês */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {listaMeses.map((m) => (
                  <button
                    key={m.index}
                    onClick={() => setMesFrequenciaIndex(m.index)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                      mesFrequenciaIndex === m.index
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {m.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* Contadores do Mês */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Presenças</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700">{totalPresencas}</span>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Faltas</span>
                <span className="text-xl sm:text-2xl font-black text-rose-700">{totalFaltas}</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Justificadas</span>
                <span className="text-xl sm:text-2xl font-black text-amber-700">{totalJustificadas}</span>
              </div>
            </div>

            {/* Calendário de Dias do Mês */}
            <div className="pt-3">
              <h4 className="text-xs font-bold text-slate-700 mb-2">
                Mapa de Dias Letivos de {mesAtualObj.nome} / 2026:
              </h4>
              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-16 gap-1.5 text-center">
                {diasDoMes.map((dia) => {
                  const reg = mapaPresencas[dia];
                  let bgClass = 'bg-slate-50 text-slate-400 border-slate-200';
                  let icon = dia;

                  if (reg) {
                    if (reg.status === 'Presente') {
                      bgClass = 'bg-emerald-500 text-white font-black shadow-xs border-emerald-600';
                    } else if (reg.status === 'Falta') {
                      bgClass = 'bg-rose-600 text-white font-black shadow-xs border-rose-700';
                    } else if (reg.status === 'Justificada') {
                      bgClass = 'bg-amber-500 text-white font-black shadow-xs border-amber-600';
                    }
                  }

                  return (
                    <div
                      key={dia}
                      className={`p-2 rounded-xl border text-xs flex flex-col items-center justify-center min-h-[46px] transition ${bgClass}`}
                      title={reg ? `Dia ${dia}: ${reg.status} ${reg.observacao ? `(${reg.observacao})` : ''}` : `Dia ${dia}`}
                    >
                      <span className="text-[10px] font-bold">{dia}</span>
                      <span className="text-[8px] mt-0.5">
                        {reg ? (reg.status === 'Presente' ? '✓' : reg.status === 'Falta' ? 'F' : 'FJ') : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Diário de Classe Pedagógico */}
          {ultimaChamadaComConteudo && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-5 h-5 text-orange-500" />
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Diário de Classe & Atividades da Turma ({formatarDataBR(ultimaChamadaComConteudo.data)})
                </h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-orange-50/50 p-4 rounded-2xl border border-orange-100 font-medium">
                &ldquo;{ultimaChamadaComConteudo.conteudoMinistrado}&rdquo;
              </p>

              {/* Fotos das Atividades Realizadas na Sala de Aula */}
              {ultimaChamadaComConteudo.fotosAtividades && ultimaChamadaComConteudo.fotosAtividades.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-950">
                      📸 Fotos das Atividades de Hoje ({ultimaChamadaComConteudo.fotosAtividades.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {ultimaChamadaComConteudo.fotosAtividades.map((foto, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl overflow-hidden border border-purple-200 bg-slate-50 shadow-xs aspect-square group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={foto}
                          alt={`Atividade ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-right">
                Registrado por: {ultimaChamadaComConteudo.registradoPor}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: MENSALIDADES & PIX (2ª VIA) */}
      {activeSubTab === 'financeiro' && (
        <div className="space-y-6">
          {/* Card PIX Oficial da Escola */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pagamento Instantâneo sem Filas</span>
                </div>
                <h3 className="text-xl font-black tracking-tight">
                  Chave PIX Oficial da Escola Aprendendo com Amor
                </h3>
                <p className="text-xs text-emerald-100">
                  {config.bancoPix} • Titular: {config.titularPix}
                </p>
              </div>

              {/* Botão Copiar Chave */}
              <button
                onClick={handleCopiarPix}
                className="flex items-center justify-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 font-black px-5 py-3 rounded-2xl text-xs shadow-md transition transform active:scale-95 shrink-0"
              >
                {copiadoPix ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiadoPix ? 'Chave Copiada! ✓' : 'Copiar Chave PIX'}</span>
              </button>
            </div>

            <div className="bg-emerald-900/40 p-3.5 rounded-2xl font-mono font-bold text-center text-sm sm:text-base tracking-wider border border-emerald-400/30">
              {config.chavePix}
            </div>

            <p className="text-[11px] text-emerald-100 text-center">
              💡 Após o pagamento, envie o comprovante diretamente no WhatsApp da secretaria para baixa imediata.
            </p>
          </div>

          {/* Grade das 12 Mensalidades de 2026 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  Carnê & Mensalidades do Ano Letivo 2026
                </h3>
                <p className="text-xs text-slate-500">
                  {totalPagas} parcelas quitadas de 12 • Mensalidade: {formatarMoeda(currentStudent.valorMensalidadePadrao)}
                </p>
              </div>

              <button
                onClick={() => onPrintCarne(currentStudent)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                Imprimir Carnê Completo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mensalidadesDoAluno.map((m) => {
                const isPago = m.status === 'Pago';

                return (
                  <div
                    key={m.id}
                    className={`rounded-2xl p-4 border transition flex flex-col justify-between space-y-3 ${
                      isPago
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                          Parcela {m.numeroParcela}/12
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900">{m.mesReferencia}</h4>
                        <p className="text-[11px] text-slate-500">Vencimento: {formatarDataBR(m.dataVencimento)}</p>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          isPago
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isPago ? 'Pago ✓' : 'Pendente'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Valor:</span>
                        <strong className="text-sm font-black font-mono text-slate-900">
                          {formatarMoeda(m.valorFinal)}
                        </strong>
                      </div>

                      {isPago ? (
                        <button
                          onClick={() => onOpenRecibo(m, currentStudent)}
                          className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl text-xs transition"
                          title="Imprimir 2ª Via do Recibo Oficial"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          2ª Via Recibo
                        </button>
                      ) : (
                        <button
                          onClick={handleCopiarPix}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition"
                          title="Pagar via PIX"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Pagar PIX
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ABA 1 (PRINCIPAL): MURAL DE COMUNICADOS DE ALTO IMPACTO */}
      {activeSubTab === 'avisos' && (
        <div className="space-y-6">
          {/* Banner Chamativo de Alerta para os Pais */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 p-5 sm:p-7 text-white shadow-xl shadow-orange-600/15">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-black uppercase tracking-wider text-white">
                  <BellRing className="w-4 h-4 animate-pulse text-amber-200" />
                  Mural Oficial de Recados & Avisos
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Atenção, Pais e Responsáveis! 📢✨
                </h2>
                <p className="text-orange-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Fiquem sempre atentos às datas de reuniões, eventos festivos, reposições e avisos pedagógicos para acompanhar de perto a rotina escolar do seu filho(a).
                </p>
              </div>

              <div className="shrink-0 bg-white/15 backdrop-blur-md border border-white/20 px-5 py-3.5 rounded-2xl text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-100 block">
                  Avisos Ativos
                </span>
                <span className="text-3xl font-black text-white">{avisosParaPais.length}</span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista dos Avisos com Alto Destaque Visual */}
            <div className="lg:col-span-2 space-y-4">
              {avisosParaPais.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm space-y-3">
                  <BookmarkCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="font-black text-slate-800 text-base">Tudo em dia com a escola!</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Nenhum novo comunicado publicado pela direção no momento. Quando houver reuniões ou eventos, eles aparecerão aqui em destaque.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {avisosParaPais.map((aviso) => {
                    const isLido = !!avisosLidos[aviso.id];
                    const isFixado = aviso.fixado;
                    const isUrgente = aviso.tipo === 'Urgente';

                    const linkZapAviso = linkWhatsApp(
                      config.telefonePrincipal,
                      `Olá Secretaria! Sou responsável pelo(a) aluno(a) ${currentStudent?.nome} e gostaria de tirar uma dúvida sobre o comunicado: "${aviso.titulo}".`
                    );

                    return (
                      <div
                        key={aviso.id}
                        className={`rounded-3xl p-5 sm:p-6 border-2 transition relative overflow-hidden shadow-sm hover:shadow-md ${
                          isUrgente
                            ? 'bg-rose-50/80 border-rose-300'
                            : isFixado
                            ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                            : isLido
                            ? 'bg-white border-slate-200 opacity-95'
                            : 'bg-white border-orange-200 ring-2 ring-orange-400/20'
                        }`}
                      >
                        {/* Faixa lateral indicativa de alta visibilidade */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                            isUrgente
                              ? 'bg-rose-600'
                              : isFixado
                              ? 'bg-amber-500'
                              : 'bg-orange-500'
                          }`}
                        />

                        <div className="pl-1 sm:pl-2 space-y-3.5">
                          {/* Header do Card */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isFixado && (
                                <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                                  <Pin className="w-3 h-3" />
                                  Fixado no Topo
                                </span>
                              )}
                              {isUrgente && (
                                <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase animate-pulse shadow-xs">
                                  🚨 Atenção Urgente
                                </span>
                              )}
                              {aviso.publicoAlvo === 'pais' ? (
                                <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-purple-200">
                                  👨‍👩‍👧 Exclusivo para os Pais
                                </span>
                              ) : (
                                <span className="bg-orange-100 text-orange-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-orange-200">
                                  🌐 Comunicado Geral
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>Publicado: {formatarDataBR(aviso.data)}</span>
                            </div>
                          </div>

                          {/* Título & Mensagem */}
                          <div className="space-y-1.5">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                              {aviso.titulo}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                              {aviso.mensagem}
                            </p>

                            {/* Foto / Cartaz Anexado ao Comunicado */}
                            {aviso.fotoUrl && (
                              <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200/80 bg-white max-h-72 sm:max-h-96 flex items-center justify-center shadow-xs">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={aviso.fotoUrl}
                                  alt={aviso.titulo}
                                  className="max-h-72 sm:max-h-96 w-auto object-contain rounded-xl hover:scale-[1.02] transition"
                                />
                              </div>
                            )}
                          </div>

                          {/* Rodapé com Autor e Ações Interativas */}
                          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="text-[11px] text-slate-500 font-medium">
                              ✍️ Por: <strong className="text-slate-800">{aviso.autor}</strong>
                            </span>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                              <button
                                type="button"
                                onClick={() => handleConfirmarLeitura(aviso.id, aviso.titulo)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                                  isLido
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isLido ? 'Leitura Confirmada ✓' : 'Confirmar Leitura'}</span>
                              </button>

                              <a
                                href={linkZapAviso}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition"
                                title="Tirar dúvida no WhatsApp da Escola"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="hidden sm:inline">Dúvidas?</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Atendimento & Contato Rápido da Escola */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4 h-fit sticky top-24">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Phone className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Fale com a Direção
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                  <span className="text-purple-900 font-bold block text-[10px] uppercase">Secretaria / Atendimento:</span>
                  <p className="text-slate-900 font-black text-sm">{config.telefonePrincipal}</p>
                  {config.telefoneSecundario && <p className="text-slate-600 text-xs mt-0.5">{config.telefoneSecundario}</p>}
                </div>

                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Endereço da Escola:</span>
                  <p className="text-slate-700 font-semibold">
                    {config.endereco}, {config.bairro} – {config.cidade}/{config.uf}
                  </p>
                  <p className="text-slate-400 text-[10px] font-mono mt-0.5">CEP: {config.cep}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">E-mail:</span>
                  <p className="text-slate-700 font-medium">{config.email}</p>
                </div>

                <div className="pt-2">
                  <a
                    href={linkZapSecretaria}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Student, Turma } from '@/types';
import { formatarDataBR, linkWhatsApp } from '@/utils/helpers';
import * as XLSX from 'xlsx';
import {
  Search,
  Plus,
  Filter,
  Printer,
  CreditCard,
  Eye,
  MessageCircle,
  Download,
  LayoutGrid,
  List,
  Phone,
  User,
  Trash2,
} from 'lucide-react';
import { ModalConfirmacao } from '@/components/modals/ModalConfirmacao';

interface AlunosViewProps {
  onOpenNovoAluno: () => void;
  onSelectStudent: (student: Student) => void;
  onPrintFicha: (student: Student) => void;
  onPrintCarne: (student: Student) => void;
  onEditStudent: (student: Student) => void;
}

export const AlunosView: React.FC<AlunosViewProps> = ({
  onOpenNovoAluno,
  onSelectStudent,
  onPrintFicha,
  onPrintCarne,
  onEditStudent,
}) => {
  const { students, turmas, deleteStudent, config } = useSchool();
  const [busca, setBusca] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('todas');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'tabela'>('cards');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Filtragem
  const alunosFiltrados = students.filter((aluno) => {
    const matchBusca =
      aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
      aluno.matricula.toLowerCase().includes(busca.toLowerCase()) ||
      aluno.cpf.includes(busca) ||
      aluno.responsaveis.mae.nome.toLowerCase().includes(busca.toLowerCase()) ||
      aluno.responsaveis.pai.nome.toLowerCase().includes(busca.toLowerCase());

    const matchTurma = filtroTurma === 'todas' || aluno.turmaId === filtroTurma;
    const matchTurno = filtroTurno === 'todos' || aluno.turno === filtroTurno;

    return matchBusca && matchTurma && matchTurno;
  });

  const exportarParaExcel = () => {
    const dadosExcel = alunosFiltrados.map((a) => ({
      Matrícula: a.matricula,
      Nome: a.nome,
      'Data Nasc': formatarDataBR(a.dataNascimento),
      Idade: a.idadeCalculada,
      Sexo: a.sexo,
      CPF: a.cpf,
      Turma: a.turmaNome,
      Turno: a.turno,
      Horário: a.horario,
      Mãe: a.responsaveis.mae.nome,
      'Telefone Mãe': a.responsaveis.mae.telefone,
      Pai: a.responsaveis.pai.nome,
      'Telefone Pai': a.responsaveis.pai.telefone,
      'Emergência': a.responsaveis.numeroEmergencia,
      Endereço: `${a.endereco.rua}, ${a.endereco.numeroCasa} - ${a.endereco.bairro}`,
      Status: a.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos');
    XLSX.writeFile(workbook, `alunos_aprendendo_com_amor_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Secretaria • Alunos & Matrículas
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Gerenciamento completo das fichas cadastrais, turmas e documentos oficiais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarParaExcel}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition"
            title="Exportar listagem atual para Excel"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>

          <button
            onClick={onOpenNovoAluno}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md shadow-orange-500/20 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nova Matrícula
          </button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do aluno, mãe, pai, matrícula ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500 text-xs font-medium text-slate-800"
          />
        </div>

        {/* Filtro de Turma */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filtroTurma}
            onChange={(e) => setFiltroTurma(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white"
          >
            <option value="todas">Todas as Turmas ({students.length})</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} ({t.turno})
              </option>
            ))}
          </select>

          {/* Filtro de Turno */}
          <select
            value={filtroTurno}
            onChange={(e) => setFiltroTurno(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white"
          >
            <option value="todos">Todos os Turnos</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Integral">Integral</option>
          </select>

          {/* Alternar Visualização */}
          <div className="flex border border-slate-200 rounded-2xl p-1 bg-slate-50 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-xl transition ${viewMode === 'cards' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}
              title="Visualização em Cartões"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('tabela')}
              className={`p-1.5 rounded-xl transition ${viewMode === 'tabela' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}
              title="Visualização em Tabela Densa"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Resultados - Contagem */}
      <div className="text-xs text-slate-500 px-1 flex items-center justify-between">
        <span>Exibindo <strong>{alunosFiltrados.length}</strong> de {students.length} alunos cadastrados</span>
      </div>

      {/* MODO CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {alunosFiltrados.map((aluno) => {
            const telMae = aluno.responsaveis?.mae?.telefone;
            const zapLink = telMae ? linkWhatsApp(telMae, `Olá! Secretaria da Escola Aprendendo com Amor falando sobre ${aluno.nome}.`) : '';

            return (
              <div
                key={aluno.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group space-y-4"
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-start gap-3.5">
                  <div className="relative w-14 h-16 rounded-2xl bg-amber-50 border border-amber-200 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                    {aluno.fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={aluno.fotoUrl} alt={aluno.nome} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-amber-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        {aluno.matricula}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {aluno.turmaNome}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectStudent(aluno)}
                      className="font-extrabold text-sm text-slate-900 truncate hover:text-orange-600 cursor-pointer mt-1"
                    >
                      {aluno.nome}
                    </h3>

                    <p className="text-[11px] text-slate-500">
                      🎂 {formatarDataBR(aluno.dataNascimento)} ({aluno.idadeCalculada || '2 anos'}) • {aluno.turno}
                    </p>
                  </div>
                </div>

                {/* Responsáveis e Contato */}
                <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Mãe / Contato:</span>
                    {telMae && (
                      <a
                        href={zapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-[11px] font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {telMae}
                      </a>
                    )}
                  </div>
                  <p className="font-semibold text-slate-800 truncate">{aluno.responsaveis.mae.nome || aluno.responsaveis.pai.nome || 'Não informado'}</p>
                  {aluno.responsaveis.numeroEmergencia && (
                    <p className="text-[10px] text-rose-600 font-medium truncate">
                      Emergência: {aluno.responsaveis.numeroEmergencia}
                    </p>
                  )}
                </div>

                {/* Botões de Ação do Card */}
                <div className="pt-1 flex items-center justify-between gap-1.5 border-t border-slate-100">
                  <button
                    onClick={() => onSelectStudent(aluno)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver Ficha
                  </button>

                  <button
                    onClick={() => onPrintFicha(aluno)}
                    className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition"
                    title="Imprimir Ficha Oficial A4"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onPrintCarne(aluno)}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition"
                    title="Imprimir Carnê de Mensalidades"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setStudentToDelete(aluno)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                    title="Excluir Aluno"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODO TABELA DENSA */}
      {viewMode === 'tabela' && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Matrícula</th>
                  <th className="p-3.5">Nome do Aluno</th>
                  <th className="p-3.5">Turma / Turno</th>
                  <th className="p-3.5">Nascimento (Idade)</th>
                  <th className="p-3.5">Mãe / Telefone</th>
                  <th className="p-3.5">Emergência</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {alunosFiltrados.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-amber-700">{aluno.matricula}</td>
                    <td className="p-3.5 font-bold text-slate-900 uppercase">
                      <span
                        onClick={() => onSelectStudent(aluno)}
                        className="cursor-pointer hover:text-orange-600"
                      >
                        {aluno.nome}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-indigo-700">{aluno.turmaNome}</span> ({aluno.turno})
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {formatarDataBR(aluno.dataNascimento)} <span className="text-[10px] text-slate-400">({aluno.idadeCalculada})</span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium text-slate-800">{aluno.responsaveis.mae.nome || '-'}</p>
                      <p className="text-[11px] text-slate-500">{aluno.responsaveis.mae.telefone || '-'}</p>
                    </td>
                    <td className="p-3.5 font-semibold text-rose-600">
                      {aluno.responsaveis.numeroEmergencia || '-'}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectStudent(aluno)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                          title="Detalhes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPrintFicha(aluno)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg"
                          title="Imprimir Ficha Oficial"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPrintCarne(aluno)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg"
                          title="Imprimir Carnê"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(aluno)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Excluir Aluno"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Aluno */}
      <ModalConfirmacao
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            deleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        title="Excluir Matrícula Escolar?"
        description={
          <div>
            Tem certeza que deseja excluir a matrícula de{' '}
            <strong className="text-slate-900 font-bold">{studentToDelete?.nome}</strong> (Matrícula:{' '}
            <span className="font-mono font-bold">{studentToDelete?.matricula}</span>)?
            <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs leading-relaxed">
              <strong>⚠️ Aviso Importante:</strong> Esta ação apagará definitivamente o cadastro do aluno, informações médicas de saúde e todas as 12 parcelas de mensalidades do ano letivo vinculadas.
            </div>
          </div>
        }
        confirmText="Sim, Excluir Matrícula"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

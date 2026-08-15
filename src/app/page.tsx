'use client';

import React, { useState, useEffect } from 'react';
import { SchoolProvider, useSchool } from '@/context/SchoolContext';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/views/DashboardView';
import { AlunosView } from '@/components/views/AlunosView';
import { FinanceiroView } from '@/components/views/FinanceiroView';
import { DespesasView } from '@/components/views/DespesasView';
import { FrequenciaView } from '@/components/views/FrequenciaView';
import { TurmasView } from '@/components/views/TurmasView';
import { ConfiguracoesView } from '@/components/views/ConfiguracoesView';
import { PortalResponsavelView } from '@/components/views/PortalResponsavelView';

import { ModalNovoAluno } from '@/components/modals/ModalNovoAluno';
import { ModalDetalhesAluno } from '@/components/modals/ModalDetalhesAluno';
import { ModalBaixaMensalidade } from '@/components/modals/ModalBaixaMensalidade';
import { ModalConfirmacao } from '@/components/modals/ModalConfirmacao';

import { FichaMatriculaPrint } from '@/components/print/FichaMatriculaPrint';
import { ReciboOficialPrint } from '@/components/print/ReciboOficialPrint';
import { CarneMensalidadesPrint } from '@/components/print/CarneMensalidadesPrint';
import { ListaPresencaPrint } from '@/components/print/ListaPresencaPrint';

import { Student, Mensalidade, Turma, FormaPagamento } from '@/types';

function MainApp() {
  const {
    config,
    turmas,
    students,
    mensalidades,
    frequencias,
    currentRole,
    addStudent,
    updateStudent,
    deleteStudent,
    baixarMensalidade,
    estornarMensalidade,
    isHydrated,
  } = useSchool();

  // Navegação com Persistência no LocalStorage
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('aprendendocomamor_tab_v2');
      if (currentRole === 'responsavel') {
        setActiveTab('portal-pais');
      } else if (savedTab) {
        if (currentRole === 'professor' && ['alunos', 'financeiro', 'despesas', 'configuracoes', 'portal-pais'].includes(savedTab)) {
          setActiveTab('dashboard');
        } else if (currentRole === 'secretaria' && ['despesas', 'configuracoes', 'portal-pais'].includes(savedTab)) {
          setActiveTab('dashboard');
        } else if (savedTab === 'portal-pais') {
          setActiveTab('dashboard');
        } else {
          setActiveTab(savedTab);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentRole]);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('aprendendocomamor_tab_v2', tab);
    } catch (e) {
      console.error(e);
    }
  };

  // Modais de Formulário
  const [isNovoAlunoModalOpen, setIsNovoAlunoModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // Modal de Detalhes
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);

  // Modal de Baixa de Mensalidade
  const [baixaModalOpen, setBaixaModalOpen] = useState(false);
  const [mensalidadeToPay, setMensalidadeToPay] = useState<Mensalidade | null>(null);
  const [studentToPay, setStudentToPay] = useState<Student | null>(null);

  // Modal de Confirmação Crítica (Exclusão de Aluno)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Modal de Confirmação Crítica (Estorno de Mensalidade)
  const [mensalidadeToEstorno, setMensalidadeToEstorno] = useState<{ id: string; mes: string; aluno: string } | null>(null);

  // Telas de Impressão Oficial
  const [studentForFichaPrint, setStudentForFichaPrint] = useState<Student | null>(null);
  const [studentForCarnePrint, setStudentForCarnePrint] = useState<Student | null>(null);
  const [receiptForPrint, setReceiptForPrint] = useState<{
    mensalidade: Mensalidade;
    student: Student;
  } | null>(null);
  const [turmaForPresencaPrint, setTurmaForPresencaPrint] = useState<{
    turma: Turma;
    dataChamada?: string;
  } | null>(null);

  // Handlers
  const handleOpenNovoAluno = () => {
    setStudentToEdit(null);
    setIsNovoAlunoModalOpen(true);
  };

  const handleOpenEditAluno = (student: Student) => {
    setStudentToEdit(student);
    setIsNovoAlunoModalOpen(true);
    setSelectedStudentForDetails(null);
  };

  const handleSaveStudent = (data: Partial<Student>) => {
    if (studentToEdit) {
      updateStudent(studentToEdit.id, data);
    } else {
      const novo = addStudent(data);
      setStudentForFichaPrint(novo);
    }
  };

  const handleOpenBaixa = (mensalidade: Mensalidade, student: Student) => {
    setMensalidadeToPay(mensalidade);
    setStudentToPay(student);
    setBaixaModalOpen(true);
  };

  const handleConfirmBaixa = (data: {
    formaPagamento: FormaPagamento;
    dataPagamento: string;
    desconto: number;
    acrescimo: number;
    pagoPor: string;
    observacoes: string;
    abrirRecibo: boolean;
  }) => {
    if (!mensalidadeToPay || !studentToPay) return;

    baixarMensalidade(mensalidadeToPay.id, {
      formaPagamento: data.formaPagamento,
      dataPagamento: data.dataPagamento,
      desconto: data.desconto,
      acrescimo: data.acrescimo,
      observacoes: data.observacoes,
      pagoPor: data.pagoPor,
    });

    if (data.abrirRecibo) {
      const updatedMensalidade: Mensalidade = {
        ...mensalidadeToPay,
        status: 'Pago',
        formaPagamento: data.formaPagamento,
        dataPagamento: data.dataPagamento,
        desconto: data.desconto,
        acrescimo: data.acrescimo,
        valorFinal: Math.max(0, mensalidadeToPay.valorOriginal - data.desconto + data.acrescimo),
        pagoPor: data.pagoPor,
      };
      setReceiptForPrint({ mensalidade: updatedMensalidade, student: studentToPay });
    }
  };

  const handleOpenRecibo = (mensalidade: Mensalidade, student: Student) => {
    setReceiptForPrint({ mensalidade, student });
  };

  const handleSelectTurmaParaAlunos = (turmaId: string) => {
    if (['diretoria', 'secretaria'].includes(currentRole)) {
      handleSelectTab('alunos');
    }
  };

  const handleRequestDeleteStudent = (studentId: string) => {
    const st = students.find((s) => s.id === studentId);
    if (st) {
      setStudentToDelete(st);
    }
  };

  const handleConfirmDeleteStudent = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setSelectedStudentForDetails(null);
      setStudentToDelete(null);
    }
  };

  const handleRequestEstorno = (mensalidadeId: string) => {
    const m = mensalidades.find((mens) => mens.id === mensalidadeId);
    if (m) {
      setMensalidadeToEstorno({ id: m.id, mes: m.mesReferencia, aluno: m.alunoNome });
    }
  };

  const handleConfirmEstorno = () => {
    if (mensalidadeToEstorno) {
      estornarMensalidade(mensalidadeToEstorno.id);
      setMensalidadeToEstorno(null);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-700">Carregando sistema da Escola Aprendendo com Amor...</p>
      </div>
    );
  }

  const isPrinting = Boolean(
    studentForFichaPrint || receiptForPrint || studentForCarnePrint || turmaForPresencaPrint
  );

  return (
    <div className={`min-h-screen bg-slate-50/80 flex flex-col ${isPrinting ? 'print:bg-white print:p-0 print:m-0' : ''}`}>
      {/* Header Principal com Troca de Perfis */}
      <div className={isPrinting ? 'print:hidden' : ''}>
        <Header
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenNovoAluno={handleOpenNovoAluno}
        />
      </div>

      {/* Conteúdo da Aba Ativa */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 ${isPrinting ? 'print:hidden' : ''}`}>
        {currentRole === 'responsavel' && (
          <PortalResponsavelView
            onPrintFicha={setStudentForFichaPrint}
            onPrintCarne={setStudentForCarnePrint}
            onOpenRecibo={(m, s) => setReceiptForPrint({ mensalidade: m, student: s })}
          />
        )}

        {currentRole !== 'responsavel' && activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={handleSelectTab}
            onOpenNovoAluno={handleOpenNovoAluno}
            onSelectStudent={setSelectedStudentForDetails}
            onOpenBaixa={handleOpenBaixa}
            onOpenRecibo={handleOpenRecibo}
          />
        )}

        {currentRole !== 'responsavel' && activeTab === 'alunos' && ['diretoria', 'secretaria'].includes(currentRole) && (
          <AlunosView
            onOpenNovoAluno={handleOpenNovoAluno}
            onSelectStudent={setSelectedStudentForDetails}
            onPrintFicha={setStudentForFichaPrint}
            onPrintCarne={setStudentForCarnePrint}
            onEditStudent={handleOpenEditAluno}
          />
        )}

        {activeTab === 'financeiro' && ['diretoria', 'secretaria'].includes(currentRole) && (
          <FinanceiroView
            onOpenBaixa={handleOpenBaixa}
            onOpenRecibo={handleOpenRecibo}
          />
        )}

        {currentRole !== 'responsavel' && activeTab === 'despesas' && currentRole === 'diretoria' && <DespesasView />}

        {currentRole !== 'responsavel' && activeTab === 'frequencia' && (
          <FrequenciaView
            onPrintDiario={(turma, dataChamada) =>
              setTurmaForPresencaPrint({ turma, dataChamada })
            }
          />
        )}

        {currentRole !== 'responsavel' && activeTab === 'turmas' && (
          <TurmasView
            onSelectTurmaParaAlunos={handleSelectTurmaParaAlunos}
            onPrintDiario={(turma, dataChamada) =>
              setTurmaForPresencaPrint({ turma, dataChamada })
            }
          />
        )}

        {currentRole !== 'responsavel' && activeTab === 'configuracoes' && currentRole === 'diretoria' && <ConfiguracoesView />}
      </main>

      {/* Modais de Operação */}
      <ModalNovoAluno
        isOpen={isNovoAlunoModalOpen}
        onClose={() => setIsNovoAlunoModalOpen(false)}
        onSave={handleSaveStudent}
        turmas={turmas}
        studentToEdit={studentToEdit}
        anoLetivoAtivo={config.anoLetivoAtivo}
      />

      <ModalDetalhesAluno
        isOpen={!!selectedStudentForDetails}
        onClose={() => setSelectedStudentForDetails(null)}
        student={selectedStudentForDetails}
        mensalidades={mensalidades}
        config={config}
        onEdit={handleOpenEditAluno}
        onDelete={handleRequestDeleteStudent}
        onPrintFicha={setStudentForFichaPrint}
        onPrintCarne={setStudentForCarnePrint}
        onOpenBaixa={handleOpenBaixa}
        onOpenRecibo={handleOpenRecibo}
        onEstornar={handleRequestEstorno}
      />

      <ModalBaixaMensalidade
        isOpen={baixaModalOpen}
        onClose={() => setBaixaModalOpen(false)}
        mensalidade={mensalidadeToPay}
        student={studentToPay}
        onConfirm={handleConfirmBaixa}
      />

      {/* Modal de Confirmação: Exclusão de Matrícula */}
      <ModalConfirmacao
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDeleteStudent}
        title="Excluir Matrícula Escolar?"
        description={
          <div>
            Tem certeza que deseja excluir a matrícula de{' '}
            <strong className="text-slate-900 font-bold">{studentToDelete?.nome}</strong> (Matrícula:{' '}
            <span className="font-mono">{studentToDelete?.matricula}</span>)?
            <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs">
              <strong>⚠️ Aviso Importante:</strong> Esta ação apagará definitivamente o cadastro do aluno, informações médicas de saúde e todas as 12 parcelas de mensalidades do ano letivo de 2026.
            </div>
          </div>
        }
        confirmText="Sim, Excluir Matrícula"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Modal de Confirmação: Estorno de Pagamento */}
      <ModalConfirmacao
        isOpen={!!mensalidadeToEstorno}
        onClose={() => setMensalidadeToEstorno(null)}
        onConfirm={handleConfirmEstorno}
        title="Confirmar Estorno de Mensalidade?"
        description={
          <div>
            Deseja estornar o pagamento da mensalidade de{' '}
            <strong className="text-slate-900">{mensalidadeToEstorno?.mes}</strong> do aluno(a){' '}
            <strong>{mensalidadeToEstorno?.aluno}</strong>?
            <p className="mt-2 text-slate-500 text-xs">
              O status da parcela voltará a constar como <strong>Pendente</strong> e o número de recibo anterior será invalidado.
            </p>
          </div>
        }
        confirmText="Sim, Confirmar Estorno"
        cancelText="Voltar"
        variant="warning"
      />

      {/* Telas de Impressão Oficial Timbrada */}
      {studentForFichaPrint && (
        <FichaMatriculaPrint
          student={studentForFichaPrint}
          config={config}
          onClose={() => setStudentForFichaPrint(null)}
        />
      )}

      {receiptForPrint && (
        <ReciboOficialPrint
          mensalidade={receiptForPrint.mensalidade}
          student={receiptForPrint.student}
          config={config}
          onClose={() => setReceiptForPrint(null)}
        />
      )}

      {studentForCarnePrint && (
        <CarneMensalidadesPrint
          student={studentForCarnePrint}
          mensalidades={mensalidades}
          config={config}
          onClose={() => setStudentForCarnePrint(null)}
        />
      )}

      {turmaForPresencaPrint && (
        <ListaPresencaPrint
          turma={turmaForPresencaPrint.turma}
          dataChamada={turmaForPresencaPrint.dataChamada}
          students={students}
          config={config}
          frequencias={frequencias}
          onClose={() => setTurmaForPresencaPrint(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <MainApp />
    </SchoolProvider>
  );
}

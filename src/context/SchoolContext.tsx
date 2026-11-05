'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Student,
  Turma,
  Mensalidade,
  Despesa,
  ChamadaFrequencia,
  Aviso,
  EscolaConfig,
  PerfilUsuario,
  FormaPagamento,
  BoletimAluno,
  Bimestre,
  NotaItem,
  EventoEscolar,
  RespostaEnquete,
  ParticipanteEvento,
} from '@/types';
import {
  initialConfig,
  initialTurmas,
  initialStudents,
  initialMensalidades,
  initialDespesas,
  initialAvisos,
  initialFrequencias,
  initialBoletins,
  initialEventos,
} from '@/data/initialData';
import {
  realStudents,
  realMensalidades,
  realDespesas,
} from '@/data/realData';
import {
  gerarMensalidadesParaAluno,
  gerarNumeroMatricula,
  gerarNumeroRecibo,
  calcularIdade,
} from '@/utils/helpers';
import { ToastNotification, ToastItem } from '@/components/ui/ToastNotification';

interface SchoolContextType {
  config: EscolaConfig;
  students: Student[];
  turmas: Turma[];
  mensalidades: Mensalidade[];
  despesas: Despesa[];
  frequencias: ChamadaFrequencia[];
  boletins: BoletimAluno[];
  avisos: Aviso[];
  eventos: EventoEscolar[];
  currentRole: PerfilUsuario;
  parentStudentId: string;
  isHydrated: boolean;
  dbConnected: boolean;

  refreshFromDb: () => Promise<void>;
  setCurrentRole: (role: PerfilUsuario) => void;
  setParentStudentId: (id: string) => void;
  notify: (message: string, type?: 'success' | 'info' | 'warning' | 'error', title?: string) => void;

  // Alunos
  addStudent: (data: Partial<Student>) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;

  // Turmas
  addTurma: (data: Omit<Turma, 'id'>) => void;
  updateTurma: (id: string, data: Partial<Turma>) => void;
  deleteTurma: (id: string) => void;

  // Mensalidades
  baixarMensalidade: (
    id: string,
    pagamento: {
      formaPagamento: FormaPagamento;
      dataPagamento: string;
      desconto?: number;
      acrescimo?: number;
      observacoes?: string;
      pagoPor?: string;
    }
  ) => void;
  estornarMensalidade: (id: string) => void;
  gerarCarnesAno: (alunoId: string, ano?: number) => void;
  atualizarMensalidade: (id: string, data: Partial<Mensalidade>) => void;

  // Despesas & DRE
  addDespesa: (despesa: Omit<Despesa, 'id'>) => void;
  updateDespesa: (id: string, data: Partial<Despesa>) => void;
  deleteDespesa: (id: string) => void;
  pagarDespesa: (id: string, dataPagamento?: string, formaPagamento?: string) => void;

  // Frequência
  salvarChamada: (chamada: Omit<ChamadaFrequencia, 'id' | 'createdAt'>) => void;
  getChamadasPorTurma: (turmaId: string) => ChamadaFrequencia[];

  // Boletins & Notas Escolares (1º Ano em diante)
  salvarNotaAluno: (
    alunoId: string,
    disciplina: string,
    bimestre: Bimestre,
    valor: number | null,
    faltas?: number,
    observacao?: string
  ) => void;
  salvarBoletimCompleto: (boletim: BoletimAluno) => void;
  getBoletimDoAluno: (alunoId: string) => BoletimAluno | undefined;

  // Avisos
  addAviso: (aviso: Omit<Aviso, 'id'>) => void;
  updateAviso: (aviso: Aviso) => void;
  deleteAviso: (id: string) => void;

  // Eventos & Enquetes Escolares
  addEvento: (
    data: Omit<EventoEscolar, 'id' | 'createdAt' | 'updatedAt' | 'participantes'>,
    turmasIds?: string[]
  ) => EventoEscolar;
  updateEvento: (id: string, data: Partial<EventoEscolar>) => void;
  deleteEvento: (id: string) => void;
  responderEnquete: (
    eventoId: string,
    alunoId: string,
    resposta: RespostaEnquete,
    observacao?: string,
    respondidoPor?: string
  ) => void;
  confirmarEvento: (eventoId: string) => void;
  registrarPagamentoEvento: (
    eventoId: string,
    alunoId: string,
    pagamento: {
      formaPagamento: FormaPagamento;
      dataPagamento: string;
      observacoes?: string;
    }
  ) => void;
  estornarPagamentoEvento: (eventoId: string, alunoId: string) => void;

  // Configurações e Migração
  updateConfig: (newConfig: Partial<EscolaConfig>) => void;
  importarAlunos: (alunosImportados: Partial<Student>[]) => { sucesso: number; total: number };
  carregarDadosReaisDaPlanilha: () => void;
  exportarBackup: () => void;
  restaurarBackup: (jsonContent: string) => boolean;
  resetarDados: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONFIG: 'aprendendocomamor_config_v2',
  STUDENTS: 'aprendendocomamor_students_v2',
  TURMAS: 'aprendendocomamor_turmas_v2',
  MENSALIDADES: 'aprendendocomamor_mensalidades_v2',
  DESPESAS: 'aprendendocomamor_despesas_v2',
  FREQUENCIAS: 'aprendendocomamor_frequencias_v2',
  BOLETINS: 'aprendendocomamor_boletins_v2',
  AVISOS: 'aprendendocomamor_avisos_v2',
  EVENTOS: 'aprendendocomamor_eventos_v2',
  ROLE: 'aprendendocomamor_role_v2',
  PARENT_STUDENT_ID: 'aprendendocomamor_parent_student_id_v2',
};

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [config, setConfig] = useState<EscolaConfig>(initialConfig);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [turmas, setTurmas] = useState<Turma[]>(initialTurmas);
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>(initialMensalidades);
  const [despesas, setDespesas] = useState<Despesa[]>(initialDespesas);
  const [frequencias, setFrequencias] = useState<ChamadaFrequencia[]>(initialFrequencias);
  const [boletins, setBoletins] = useState<BoletimAluno[]>(initialBoletins);
  const [avisos, setAvisos] = useState<Aviso[]>(initialAvisos);
  const [eventos, setEventos] = useState<EventoEscolar[]>(initialEventos);
  const [currentRole, setCurrentRole] = useState<PerfilUsuario>('diretoria');
  const [parentStudentId, setParentStudentIdState] = useState<string>('aluno-fund-1-lucas-gabriel');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const setParentStudentId = useCallback((id: string) => {
    setParentStudentIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.PARENT_STUDENT_ID, id);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Notificações Toast com Auto-Dismiss
  const notify = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', title?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { id, type, message, title };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sincronização e Busca dos Dados do MySQL Remoto
  const refreshFromDb = useCallback(async () => {
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const {
            config: dbCfg,
            turmas: dbTurmas,
            students: dbStudents,
            mensalidades: dbMens,
            despesas: dbDesp,
            frequencias: dbFreq,
            avisos: dbAvisos,
          } = json.data;

          if (dbCfg && Object.keys(dbCfg).length > 0) setConfig(dbCfg);
          if (dbTurmas && dbTurmas.length > 0) setTurmas(dbTurmas);
          if (dbStudents && dbStudents.length > 0) setStudents(dbStudents);
          if (dbMens && dbMens.length > 0) setMensalidades(dbMens);
          if (dbDesp && dbDesp.length > 0) setDespesas(dbDesp);
          if (dbFreq) setFrequencias(dbFreq);
          if (dbAvisos && dbAvisos.length > 0) setAvisos(dbAvisos);

          setDbConnected(true);
        }
      }
    } catch (err) {
      console.warn('Banco MySQL offline ou inacessível no momento, usando cache local:', err);
      setDbConnected(false);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Hidratação Inicial (Lê do MySQL e atualiza cache local)
  useEffect(() => {
    // 1. Carrega primeiro o cache local para renderização instantânea
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      const savedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      const savedTurmas = localStorage.getItem(STORAGE_KEYS.TURMAS);
      const savedMensalidades = localStorage.getItem(STORAGE_KEYS.MENSALIDADES);
      const savedDespesas = localStorage.getItem(STORAGE_KEYS.DESPESAS);
      const savedFrequencias = localStorage.getItem(STORAGE_KEYS.FREQUENCIAS);
      const savedBoletins = localStorage.getItem(STORAGE_KEYS.BOLETINS);
      const savedAvisos = localStorage.getItem(STORAGE_KEYS.AVISOS);
      const savedEventos = localStorage.getItem(STORAGE_KEYS.EVENTOS);
      const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE);

      if (savedConfig) setConfig(JSON.parse(savedConfig));
      if (savedStudents) setStudents(JSON.parse(savedStudents));
      if (savedTurmas) setTurmas(JSON.parse(savedTurmas));
      if (savedMensalidades) setMensalidades(JSON.parse(savedMensalidades));
      if (savedDespesas) setDespesas(JSON.parse(savedDespesas));
      if (savedFrequencias) {
        const parsedFreq = JSON.parse(savedFrequencias);
        if (Array.isArray(parsedFreq) && parsedFreq.length > 0) {
          setFrequencias(parsedFreq);
        }
      }
      if (savedBoletins) {
        const parsedBol = JSON.parse(savedBoletins);
        if (Array.isArray(parsedBol) && parsedBol.length > 0) {
          setBoletins(parsedBol);
        }
      }
      if (savedAvisos) setAvisos(JSON.parse(savedAvisos));
      if (savedEventos) {
        const parsedEv = JSON.parse(savedEventos);
        if (Array.isArray(parsedEv) && parsedEv.length > 0) {
          setEventos(parsedEv);
        }
      }
      if (savedRole) setCurrentRole(savedRole as PerfilUsuario);
      const savedParentStudent = localStorage.getItem(STORAGE_KEYS.PARENT_STUDENT_ID);
      if (savedParentStudent) setParentStudentIdState(savedParentStudent);
    } catch (err) {
      console.error('Erro ao ler cache local:', err);
    }

    // 2. Busca os dados mais recentes do MySQL no phpMyAdmin
    refreshFromDb();
  }, [refreshFromDb]);

  // Persistência em Cache no LocalStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      localStorage.setItem(STORAGE_KEYS.TURMAS, JSON.stringify(turmas));
      localStorage.setItem(STORAGE_KEYS.MENSALIDADES, JSON.stringify(mensalidades));
      localStorage.setItem(STORAGE_KEYS.DESPESAS, JSON.stringify(despesas));
      localStorage.setItem(STORAGE_KEYS.FREQUENCIAS, JSON.stringify(frequencias));
      localStorage.setItem(STORAGE_KEYS.BOLETINS, JSON.stringify(boletins));
      localStorage.setItem(STORAGE_KEYS.AVISOS, JSON.stringify(avisos));
      localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
      localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
      localStorage.setItem(STORAGE_KEYS.PARENT_STUDENT_ID, parentStudentId);
    } catch (e) {
      console.error('Erro ao persistir no localStorage:', e);
    }
  }, [isHydrated, config, students, turmas, mensalidades, despesas, frequencias, boletins, avisos, eventos, currentRole, parentStudentId]);

  // Alunos
  const addStudent = (data: Partial<Student>): Student => {
    const matricula = data.matricula || gerarNumeroMatricula(config.anoLetivoAtivo, students.length);
    const id = `aluno-${Date.now()}`;
    const idadeCalc = data.dataNascimento ? calcularIdade(data.dataNascimento) : '';

    const newStudent: Student = {
      id,
      matricula,
      nome: data.nome || 'Novo Aluno',
      fotoUrl: data.fotoUrl || '',
      dataNascimento: data.dataNascimento || '2023-01-01',
      idadeCalculada: idadeCalc,
      sexo: data.sexo || 'F',
      nacionalidade: data.nacionalidade || 'Brasileira',
      certidaoNascimento: data.certidaoNascimento || {
        numeroRegistro: '',
        livroEFolha: '',
      },
      identidade: data.identidade || '',
      cpf: data.cpf || '',
      turmaId: data.turmaId || (turmas[0]?.id ?? 'maternal-tarde'),
      turmaNome: data.turmaNome || (turmas[0]?.nome ?? 'Maternal'),
      turno: data.turno || 'Tarde',
      horario: data.horario || '13:00 às 17:00',
      anoLetivo: data.anoLetivo || config.anoLetivoAtivo,
      status: data.status || 'Ativo',
      responsaveis: data.responsaveis || {
        mae: { nome: '', cpf: '', localTrabalho: '', telefone: '' },
        pai: { nome: '', cpf: '', localTrabalho: '', telefone: '' },
        numeroEmergencia: '',
        numeroReserva: '',
        email: '',
      },
      endereco: data.endereco || {
        rua: '',
        numeroCasa: '',
        complemento: '',
        bairro: '',
        cidade: 'Campos dos Goytacazes',
        uf: 'RJ',
        cep: '',
      },
      saudeERotina: data.saudeERotina || {
        alergias: '',
        restricoesAlimentares: '',
        medicamentosUsoContinuo: '',
        observacoesMedicas: '',
        pessoasAutorizadasBusca: '',
        autorizacaoImagem: true,
        autorizacaoPasseios: true,
      },
      renovacoes: data.renovacoes || [
        {
          ano: config.anoLetivoAtivo,
          idade: idadeCalc || '2 anos',
          turma: data.turmaNome || 'Maternal',
          matricula,
          dataRenovacao: new Date().toLocaleDateString('pt-BR'),
          status: 'Ativo',
        },
      ],
      valorMensalidadePadrao: data.valorMensalidadePadrao || 500,
      diaVencimentoPadrao: data.diaVencimentoPadrao || 10,
      descontoPadrao: data.descontoPadrao || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStudents((prev) => [newStudent, ...prev]);

    const novasMens = gerarMensalidadesParaAluno(newStudent, Number(config.anoLetivoAtivo) || 2026, newStudent.diaVencimentoPadrao);
    setMensalidades((prev) => [...prev, ...novasMens]);

    // Persistência assíncrona no MySQL
    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    }).catch((e) => console.error('Erro ao salvar aluno no MySQL:', e));

    fetch('/api/mensalidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novasMens),
    }).catch((e) => console.error('Erro ao gerar mensalidades no MySQL:', e));

    notify(`Aluno(a) ${newStudent.nome} matriculado(a) com sucesso!`, 'success', 'Matrícula Concluída');
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    let updatedAluno: Student | null = null;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = {
          ...s,
          ...data,
          idadeCalculada: data.dataNascimento ? calcularIdade(data.dataNascimento) : s.idadeCalculada,
          updatedAt: new Date().toISOString(),
        };
        updatedAluno = updated;

        if (data.nome || data.turmaNome) {
          setMensalidades((mensPrev) =>
            mensPrev.map((m) =>
              m.alunoId === id
                ? {
                    ...m,
                    alunoNome: data.nome || m.alunoNome,
                    turmaNome: data.turmaNome || m.turmaNome,
                  }
                : m
            )
          );
        }

        return updated;
      })
    );

    if (updatedAluno) {
      fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAluno),
      }).catch((e) => console.error('Erro ao atualizar aluno no MySQL:', e));
    }

    notify('Dados cadastrais do aluno atualizados com sucesso!', 'success', 'Cadastro Atualizado');
  };

  const deleteStudent = (id: string) => {
    const aluno = getStudentById(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setMensalidades((prev) => prev.filter((m) => m.alunoId !== id));

    fetch(`/api/students?id=${id}`, {
      method: 'DELETE',
    }).catch((e) => console.error('Erro ao excluir aluno no MySQL:', e));

    notify(`Matrícula de ${aluno?.nome || 'aluno'} e histórico excluídos.`, 'info', 'Matrícula Removida');
  };

  const getStudentById = (id: string) => students.find((s) => s.id === id);

  // Turmas
  const addTurma = (data: Omit<Turma, 'id'>) => {
    const id = `turma-${Date.now()}`;
    const newTurma: Turma = { ...data, id };
    setTurmas((prev) => [...prev, newTurma]);

    fetch('/api/turmas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTurma),
    }).catch((e) => console.error('Erro ao salvar turma no MySQL:', e));

    notify(`Turma ${data.nome} criada com sucesso!`, 'success', 'Turma Cadastrada');
  };

  const updateTurma = (id: string, data: Partial<Turma>) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...data };
        fetch('/api/turmas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch((e) => console.error('Erro ao atualizar turma no MySQL:', e));
        return updated;
      })
    );
    notify('Dados da turma atualizados com sucesso!', 'success', 'Turma Atualizada');
  };

  const deleteTurma = (id: string) => {
    setTurmas((prev) => prev.filter((t) => t.id !== id));

    fetch(`/api/turmas?id=${id}`, {
      method: 'DELETE',
    }).catch((e) => console.error('Erro ao excluir turma no MySQL:', e));

    notify('Turma removida com sucesso.', 'info', 'Turma Excluída');
  };

  // Mensalidades
  const baixarMensalidade = (
    id: string,
    pagamento: {
      formaPagamento: FormaPagamento;
      dataPagamento: string;
      desconto?: number;
      acrescimo?: number;
      observacoes?: string;
      pagoPor?: string;
    }
  ) => {
    const reciboNum = gerarNumeroRecibo(Math.floor(Math.random() * 9000) + 1000);
    setMensalidades((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const desc = pagamento.desconto !== undefined ? pagamento.desconto : m.desconto;
        const acresc = pagamento.acrescimo !== undefined ? pagamento.acrescimo : m.acrescimo;
        const valorFinal = Math.max(0, m.valorOriginal - desc + acresc);

        const updated = {
          ...m,
          status: 'Pago' as const,
          dataPagamento: pagamento.dataPagamento,
          formaPagamento: pagamento.formaPagamento,
          desconto: desc,
          acrescimo: acresc,
          valorFinal,
          numeroRecibo: m.numeroRecibo || reciboNum,
          observacoes: pagamento.observacoes || '',
          pagoPor: pagamento.pagoPor || '',
        };

        fetch('/api/mensalidades', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            data: {
              status: 'Pago',
              dataPagamento: pagamento.dataPagamento,
              formaPagamento: pagamento.formaPagamento,
              desconto: desc,
              acrescimo: acresc,
              valorFinal,
              numeroRecibo: updated.numeroRecibo,
              observacoes: pagamento.observacoes || '',
              pagoPor: pagamento.pagoPor || '',
            },
          }),
        }).catch((e) => console.error('Erro ao baixar mensalidade no MySQL:', e));

        return updated;
      })
    );

    notify('Pagamento registrado com sucesso! Recibo gerado.', 'success', 'Baixa de Mensalidade');
  };

  const estornarMensalidade = (id: string) => {
    setMensalidades((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const obs = 'Estornado em ' + new Date().toLocaleDateString('pt-BR');

        fetch('/api/mensalidades', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            data: {
              status: 'Pendente',
              dataPagamento: null,
              formaPagamento: null,
              numeroRecibo: null,
              observacoes: obs,
            },
          }),
        }).catch((e) => console.error('Erro ao estornar no MySQL:', e));

        return {
          ...m,
          status: 'Pendente' as const,
          dataPagamento: undefined,
          formaPagamento: undefined,
          numeroRecibo: undefined,
          observacoes: obs,
        };
      })
    );

    notify('Pagamento estornado com sucesso. A mensalidade voltou para pendente.', 'warning', 'Estorno Realizado');
  };

  const gerarCarnesAno = (alunoId: string, ano: number = 2026) => {
    const aluno = getStudentById(alunoId);
    if (!aluno) return;
    const novas = gerarMensalidadesParaAluno(aluno, ano, aluno.diaVencimentoPadrao);
    setMensalidades((prev) => {
      const outras = prev.filter((m) => !(m.alunoId === alunoId && m.ano === ano));
      return [...outras, ...novas];
    });

    fetch('/api/mensalidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novas),
    }).catch((e) => console.error('Erro ao gerar carnês no MySQL:', e));

    notify(`Carnê de ${ano} gerado com sucesso!`, 'success', 'Carnê Gerado');
  };

  const atualizarMensalidade = (id: string, data: Partial<Mensalidade>) => {
    setMensalidades((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));

    fetch('/api/mensalidades', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, data }),
    }).catch((e) => console.error('Erro ao atualizar mensalidade no MySQL:', e));

    notify('Mensalidade atualizada!', 'success', 'Mensalidade');
  };

  // Despesas
  const addDespesa = (despesaData: Omit<Despesa, 'id'>) => {
    const id = `despesa-${Date.now()}`;
    const newDespesa: Despesa = { ...despesaData, id };
    setDespesas((prev) => [newDespesa, ...prev]);

    fetch('/api/despesas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDespesa),
    }).catch((e) => console.error('Erro ao salvar despesa no MySQL:', e));

    notify(`Despesa "${despesaData.descricao}" cadastrada!`, 'success', 'Despesa Adicionada');
  };

  const updateDespesa = (id: string, data: Partial<Despesa>) => {
    setDespesas((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const updated = { ...d, ...data };
        fetch('/api/despesas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch((e) => console.error('Erro ao atualizar despesa no MySQL:', e));
        return updated;
      })
    );
    notify('Despesa atualizada com sucesso!', 'success', 'Despesa');
  };

  const deleteDespesa = (id: string) => {
    setDespesas((prev) => prev.filter((d) => d.id !== id));

    fetch(`/api/despesas?id=${id}`, {
      method: 'DELETE',
    }).catch((e) => console.error('Erro ao excluir despesa no MySQL:', e));

    notify('Despesa removida do registro financeiro.', 'info', 'Despesa Excluída');
  };

  const pagarDespesa = (id: string, dataPagamento?: string, formaPagamento?: string) => {
    setDespesas((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const updated: Despesa = {
          ...d,
          status: 'Pago',
          dataPagamento: dataPagamento || new Date().toISOString().slice(0, 10),
          formaPagamento: formaPagamento || 'PIX / Débito',
        };

        fetch('/api/despesas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch((e) => console.error('Erro ao pagar despesa no MySQL:', e));

        return updated;
      })
    );
    notify('Despesa baixada como quitada!', 'success', 'Baixa de Despesa');
  };

  // Frequência
  const salvarChamada = (chamadaData: Omit<ChamadaFrequencia, 'id' | 'createdAt'>) => {
    const id = `chamada-${chamadaData.turmaId}-${chamadaData.data}`;
    const novaChamada: ChamadaFrequencia = {
      ...chamadaData,
      id,
      createdAt: new Date().toISOString(),
    };

    setFrequencias((prev) => {
      const semEsta = prev.filter((f) => !(f.turmaId === chamadaData.turmaId && f.data === chamadaData.data));
      return [novaChamada, ...semEsta];
    });

    fetch('/api/frequencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaChamada),
    }).catch((e) => console.error('Erro ao salvar chamada no MySQL:', e));

    const presentes = chamadaData.registros.filter((r) => r.status === 'Presente').length;
    const faltas = chamadaData.registros.filter((r) => r.status === 'Falta').length;

    notify(
      `Chamada salva com sucesso! (${presentes} presentes, ${faltas} faltas)`,
      'success',
      'Diário de Presença Salvo'
    );
  };

  const getChamadasPorTurma = (turmaId: string) =>
    frequencias.filter((f) => f.turmaId === turmaId);

  // Boletins & Notas Escolares (1º Ano em diante)
  const salvarNotaAluno = (
    alunoId: string,
    disciplina: string,
    bimestre: Bimestre,
    valor: number | null,
    faltas?: number,
    observacao?: string
  ) => {
    const student = students.find((s) => s.id === alunoId);
    if (!student) return;

    setBoletins((prev) => {
      const existing = prev.find((b) => b.alunoId === alunoId && b.anoLetivo === config.anoLetivoAtivo);
      const newNotas: NotaItem[] = existing ? [...existing.notas] : [];

      const notaIdx = newNotas.findIndex((n) => n.disciplina.toLowerCase() === disciplina.toLowerCase());
      const bimestreKey = `b${bimestre}` as 'b1' | 'b2' | 'b3' | 'b4';

      if (notaIdx >= 0) {
        newNotas[notaIdx] = {
          ...newNotas[notaIdx],
          [bimestreKey]: valor,
          ...(faltas !== undefined ? { faltas } : {}),
          ...(observacao !== undefined ? { observacao } : {}),
        };
      } else {
        newNotas.push({
          disciplina,
          [bimestreKey]: valor,
          faltas: faltas || 0,
          observacao: observacao || '',
        });
      }

      if (existing) {
        return prev.map((b) =>
          b.id === existing.id
            ? {
                ...b,
                alunoNome: student.nome,
                turmaId: student.turmaId,
                turmaNome: student.turmaNome,
                notas: newNotas,
                atualizadoPor:
                  currentRole === 'diretoria'
                    ? 'Diretoria Pedagógica'
                    : currentRole === 'secretaria'
                    ? 'Secretaria Escolar'
                    : 'Professora Responsável',
                updatedAt: new Date().toISOString(),
              }
            : b
        );
      } else {
        const newBoletim: BoletimAluno = {
          id: `boletim-${alunoId}-${config.anoLetivoAtivo}`,
          alunoId,
          alunoNome: student.nome,
          turmaId: student.turmaId,
          turmaNome: student.turmaNome,
          anoLetivo: config.anoLetivoAtivo,
          mediaMinimaAprovacao: 6.0,
          notas: newNotas,
          atualizadoPor:
            currentRole === 'diretoria'
              ? 'Diretoria Pedagógica'
              : currentRole === 'secretaria'
              ? 'Secretaria Escolar'
              : 'Professora Responsável',
          updatedAt: new Date().toISOString(),
        };
        return [...prev, newBoletim];
      }
    });

    notify(`Nota de ${disciplina} (${bimestre}º Bimestre) salva com sucesso!`, 'success', 'Boletim Atualizado');
  };

  const salvarBoletimCompleto = (boletim: BoletimAluno) => {
    setBoletins((prev) => {
      const idx = prev.findIndex((b) => b.id === boletim.id || (b.alunoId === boletim.alunoId && b.anoLetivo === boletim.anoLetivo));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...boletim,
          updatedAt: new Date().toISOString(),
          atualizadoPor:
            currentRole === 'diretoria'
              ? 'Diretoria Pedagógica'
              : currentRole === 'secretaria'
              ? 'Secretaria Escolar'
              : 'Professora Responsável',
        };
        return copy;
      }
      return [...prev, { ...boletim, id: boletim.id || `boletim-${boletim.alunoId}-${config.anoLetivoAtivo}` }];
    });
    notify(`Boletim de ${boletim.alunoNome} salvo com sucesso!`, 'success', 'Boletim Escolar');
  };

  const getBoletimDoAluno = (alunoId: string): BoletimAluno | undefined => {
    return boletins.find((b) => b.alunoId === alunoId && b.anoLetivo === config.anoLetivoAtivo);
  };

  // Avisos
  const addAviso = (avisoData: Omit<Aviso, 'id'>) => {
    const id = `aviso-${Date.now()}`;
    const newAviso: Aviso = { ...avisoData, id };
    setAvisos((prev) => [{ ...newAviso }, ...prev]);

    fetch('/api/avisos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAviso),
    }).catch((e) => console.error('Erro ao salvar aviso no MySQL:', e));

    notify('Novo aviso publicado no mural!', 'success', 'Mural Escolar');
  };

  const updateAviso = (aviso: Aviso) => {
    setAvisos((prev) => prev.map((a) => (a.id === aviso.id ? { ...aviso } : a)));

    fetch('/api/avisos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aviso),
    }).catch((e) => console.error('Erro ao atualizar aviso no MySQL:', e));

    notify('Aviso atualizado com sucesso!', 'success', 'Mural Escolar');
  };

  const deleteAviso = (id: string) => {
    setAvisos((prev) => prev.filter((a) => a.id !== id));

    fetch(`/api/avisos?id=${id}`, {
      method: 'DELETE',
    }).catch((e) => console.error('Erro ao excluir aviso no MySQL:', e));

    notify('Aviso removido do mural.', 'info', 'Mural');
  };

  // Eventos & Enquetes Escolares
  const addEvento = (
    data: Omit<EventoEscolar, 'id' | 'createdAt' | 'updatedAt' | 'participantes'>,
    turmasIds?: string[]
  ): EventoEscolar => {
    const id = `evento-${Date.now()}`;
    const selectedTurmas = turmasIds || data.turmasIds || ['todas'];

    const eligibleStudents = students.filter((st) => {
      if (st.status !== 'Ativo') return false;
      if (selectedTurmas.includes('todas')) return true;
      return selectedTurmas.includes(st.turmaId);
    });

    const participantes: ParticipanteEvento[] = eligibleStudents.map((st) => ({
      alunoId: st.id,
      alunoNome: st.nome,
      turmaId: st.turmaId,
      turmaNome: st.turmaNome,
      resposta: 'pendente',
      valor: data.ePago ? data.valorPorAluno : 0,
      statusPagamento: 'pendente',
    }));

    const turmasNomes = selectedTurmas.includes('todas')
      ? ['Todas as Turmas']
      : turmas.filter((t) => selectedTurmas.includes(t.id)).map((t) => t.nome);

    const novoEvento: EventoEscolar = {
      ...data,
      id,
      turmasIds: selectedTurmas,
      turmasNomes: turmasNomes.length > 0 ? turmasNomes : ['Todas as Turmas'],
      participantes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEventos((prev) => [novoEvento, ...prev]);
    notify(`Evento "${novoEvento.titulo}" criado com sucesso com ${participantes.length} alunos elegíveis!`, 'success', 'Novo Evento');
    return novoEvento;
  };

  const updateEvento = (id: string, data: Partial<EventoEscolar>) => {
    setEventos((prev) =>
      prev.map((ev) =>
        ev.id === id ? { ...ev, ...data, updatedAt: new Date().toISOString() } : ev
      )
    );
    notify('Evento atualizado com sucesso!', 'success', 'Evento Atualizado');
  };

  const deleteEvento = (id: string) => {
    setEventos((prev) => prev.filter((ev) => ev.id !== id));
    notify('Evento removido com sucesso.', 'info', 'Evento Removido');
  };

  const responderEnquete = (
    eventoId: string,
    alunoId: string,
    resposta: RespostaEnquete,
    observacao?: string,
    respondidoPor?: string
  ) => {
    setEventos((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventoId) return ev;

        const participantExists = ev.participantes.some((p) => p.alunoId === alunoId);
        let updatedParticipantes: ParticipanteEvento[];

        if (participantExists) {
          updatedParticipantes = ev.participantes.map((p) => {
            if (p.alunoId !== alunoId) return p;
            return {
              ...p,
              resposta,
              dataResposta: new Date().toISOString().slice(0, 10),
              respondidoPor: respondidoPor || (currentRole === 'responsavel' ? 'Pais (Portal)' : 'Secretaria'),
              observacao: observacao !== undefined ? observacao : p.observacao,
              statusPagamento: resposta === 'nao' ? ('isento' as const) : p.statusPagamento,
            };
          });
        } else {
          const st = students.find((s) => s.id === alunoId);
          const novoParticipante: ParticipanteEvento = {
            alunoId,
            alunoNome: st?.nome || 'Aluno',
            turmaId: st?.turmaId || 'turma',
            turmaNome: st?.turmaNome || 'Turma',
            resposta,
            dataResposta: new Date().toISOString().slice(0, 10),
            respondidoPor: respondidoPor || (currentRole === 'responsavel' ? 'Pais (Portal)' : 'Secretaria'),
            observacao,
            valor: ev.ePago ? ev.valorPorAluno : 0,
            statusPagamento: resposta === 'nao' ? ('isento' as const) : ('pendente' as const),
          };
          updatedParticipantes = [...ev.participantes, novoParticipante];
        }

        return {
          ...ev,
          participantes: updatedParticipantes,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    const msg =
      resposta === 'sim'
        ? 'Presença confirmada no evento!'
        : resposta === 'nao'
        ? 'Resposta "Não participará" registrada.'
        : 'Resposta da enquete atualizada.';
    notify(msg, 'success', 'Enquete Registrada');
  };

  const confirmarEvento = (eventoId: string) => {
    setEventos((prev) =>
      prev.map((ev) =>
        ev.id === eventoId
          ? { ...ev, status: 'confirmado', updatedAt: new Date().toISOString() }
          : ev
      )
    );
    notify('O evento foi confirmado oficialmente pela escola!', 'success', 'Evento Confirmado');
  };

  const registrarPagamentoEvento = (
    eventoId: string,
    alunoId: string,
    pagamento: {
      formaPagamento: FormaPagamento;
      dataPagamento: string;
      observacoes?: string;
    }
  ) => {
    const reciboNum = `EV-REC-${Date.now().toString().slice(-6)}`;

    setEventos((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventoId) return ev;

        const updatedParticipantes = ev.participantes.map((p) => {
          if (p.alunoId !== alunoId) return p;
          return {
            ...p,
            statusPagamento: 'pago' as const,
            formaPagamento: pagamento.formaPagamento,
            dataPagamento: pagamento.dataPagamento,
            reciboNumero: reciboNum,
            observacoesPagamento: pagamento.observacoes,
          };
        });

        return {
          ...ev,
          participantes: updatedParticipantes,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    notify(`Pagamento registrado com sucesso! Recibo nº ${reciboNum}`, 'success', 'Pagamento do Evento');
  };

  const estornarPagamentoEvento = (eventoId: string, alunoId: string) => {
    setEventos((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventoId) return ev;

        const updatedParticipantes = ev.participantes.map((p) => {
          if (p.alunoId !== alunoId) return p;
          return {
            ...p,
            statusPagamento: 'pendente' as const,
            formaPagamento: undefined,
            dataPagamento: undefined,
            reciboNumero: undefined,
          };
        });

        return {
          ...ev,
          participantes: updatedParticipantes,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    notify('Pagamento do evento estornado. Situação voltou para pendente.', 'warning', 'Estorno do Evento');
  };

  // Configurações & Backup
  const updateConfig = (newConfig: Partial<EscolaConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);

    fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((e) => console.error('Erro ao atualizar configurações no MySQL:', e));

    notify('Configurações da escola salvas com sucesso!', 'success', 'Configurações Atualizadas');
  };

  const importarAlunos = (alunosImportados: Partial<Student>[]) => {
    let count = 0;
    alunosImportados.forEach((item) => {
      if (item.nome) {
        addStudent(item);
        count++;
      }
    });
    notify(`${count} alunos importados com sucesso!`, 'success', 'Importação Concluída');
    return { sucesso: count, total: alunosImportados.length };
  };

  const carregarDadosReaisDaPlanilha = () => {
    setStudents(realStudents);
    setMensalidades(realMensalidades);
    setDespesas(realDespesas);
    setConfig(initialConfig);
    setTurmas(initialTurmas);
    notify('Base oficial de 83 alunos e despesas de 2026 recarregada com sucesso!', 'success', 'Base Carregada');
  };

  const exportarBackup = () => {
    const backupData = {
      config,
      students,
      turmas,
      mensalidades,
      despesas,
      frequencias,
      boletins,
      avisos,
      exportedAt: new Date().toISOString(),
      versao: '2.0-aprendendocomamor',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_escola_aprendendocomamor_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Arquivo de backup exportado para o seu computador!', 'success', 'Backup Exportado');
  };

  const restaurarBackup = (jsonContent: string): boolean => {
    try {
      const data = JSON.parse(jsonContent);
      if (data.students && data.turmas) {
        if (data.config) setConfig(data.config);
        if (data.students) setStudents(data.students);
        if (data.turmas) setTurmas(data.turmas);
        if (data.mensalidades) setMensalidades(data.mensalidades);
        if (data.despesas) setDespesas(data.despesas);
        if (data.frequencias) setFrequencias(data.frequencias);
        if (data.boletins) setBoletins(data.boletins);
        if (data.avisos) setAvisos(data.avisos);
        notify('Backup restaurado com sucesso no sistema!', 'success', 'Restauração Concluída');
        return true;
      }
      notify('Arquivo de backup inválido.', 'error', 'Erro na Restauração');
      return false;
    } catch {
      notify('Falha ao processar o arquivo de backup.', 'error', 'Erro');
      return false;
    }
  };

  const resetarDados = () => {
    setConfig(initialConfig);
    setStudents(initialStudents);
    setTurmas(initialTurmas);
    setMensalidades(initialMensalidades);
    setDespesas(initialDespesas);
    setFrequencias([]);
    setBoletins(initialBoletins);
    setAvisos(initialAvisos);
    setEventos(initialEventos);
    notify('Sistema restaurado para os dados padrão iniciais.', 'info', 'Reset de Dados');
  };

  return (
    <SchoolContext.Provider
      value={{
        config,
        students,
        turmas,
        mensalidades,
        despesas,
        frequencias,
        boletins,
        avisos,
        eventos,
        currentRole,
        parentStudentId,
        isHydrated,
        dbConnected,
        refreshFromDb,
        setCurrentRole,
        setParentStudentId,
        notify,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudentById,
        addTurma,
        updateTurma,
        deleteTurma,
        baixarMensalidade,
        estornarMensalidade,
        gerarCarnesAno,
        atualizarMensalidade,
        addDespesa,
        updateDespesa,
        deleteDespesa,
        pagarDespesa,
        salvarChamada,
        getChamadasPorTurma,
        salvarNotaAluno,
        salvarBoletimCompleto,
        getBoletimDoAluno,
        addAviso,
        updateAviso,
        deleteAviso,
        addEvento,
        updateEvento,
        deleteEvento,
        responderEnquete,
        confirmarEvento,
        registrarPagamentoEvento,
        estornarPagamentoEvento,
        updateConfig,
        importarAlunos,
        carregarDadosReaisDaPlanilha,
        exportarBackup,
        restaurarBackup,
        resetarDados,
      }}
    >
      {children}
      {/* Container Flutuante de Toasts */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool deve ser usado dentro de um SchoolProvider');
  }
  return context;
};

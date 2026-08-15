import { Student, Turma, Mensalidade, EscolaConfig, Aviso, Despesa } from '@/types';
import { realStudents, realMensalidades, realDespesas } from './realData';

export const initialConfig: EscolaConfig = {
  nome: 'Escola Aprendendo com Amor',
  razaoSocial: 'Escola Aprendendo com Amor LTDA',
  cnpj: '33.144.173/0001-32',
  resolucao: 'RESOLUÇÃO CME Nº 09 - 15/05/2024',
  endereco: 'Rua Waldemar Prata, 156',
  bairro: 'Parque Corrientes',
  cidade: 'Campos dos Goytacazes',
  uf: 'RJ',
  cep: '28055-160',
  telefonePrincipal: '(22) 99762-7654',
  telefoneSecundario: '(22) 99893-7242',
  email: 'aprendendocomamor.escola@gmail.com',
  instagram: '@aprendendocomamor',
  chavePix: '33.144.173/0001-32',
  bancoPix: 'Banco Inter / Sicoob',
  titularPix: 'Escola Aprendendo com Amor LTDA',
  anoLetivoAtivo: '2026',
  diaVencimentoPadrao: 10,
  metaFaturamentoMensal: 24650.0, // Meta exata da planilha INDICE.html
};

export const initialTurmas: Turma[] = [
  {
    id: 'maternal-tarde',
    nome: 'Maternal',
    codigo: 'MAT',
    nivel: 'Educação Infantil',
    faixaEtaria: '1 a 2 anos',
    turno: 'Tarde',
    horario: '13:00 às 17:00',
    capacidadeMaxima: 8, // Conforme limite de sala da planilha
    professorResponsavel: 'Tia Juliana Ribeiro',
    sala: 'Sala 01 - Maternal',
    mensalidadeSugerida: 480.0,
    ativa: true,
  },
  {
    id: 'jardim-1-tarde',
    nome: 'Jardim I',
    codigo: 'JD1',
    nivel: 'Educação Infantil',
    faixaEtaria: '2 a 3 anos',
    turno: 'Tarde',
    horario: '13:00 às 17:00',
    capacidadeMaxima: 12,
    professorResponsavel: 'Tia Mariana Castro',
    sala: 'Sala 02 - Jardim I',
    mensalidadeSugerida: 500.0,
    ativa: true,
  },
  {
    id: 'jardim-2-tarde',
    nome: 'Jardim II',
    codigo: 'JD2',
    nivel: 'Educação Infantil',
    faixaEtaria: '3 a 4 anos',
    turno: 'Tarde',
    horario: '13:00 às 17:00',
    capacidadeMaxima: 25,
    professorResponsavel: 'Tia Carla Silveira',
    sala: 'Sala 03 - Jardim II',
    mensalidadeSugerida: 520.0,
    ativa: true,
  },
  {
    id: 'jardim-3-manha',
    nome: 'Jardim III',
    codigo: 'JD3',
    nivel: 'Educação Infantil',
    faixaEtaria: '4 a 5 anos',
    turno: 'Manhã',
    horario: '07:30 às 11:30',
    capacidadeMaxima: 12,
    professorResponsavel: 'Tia Beatriz Lima',
    sala: 'Sala 04 - Jardim III',
    mensalidadeSugerida: 520.0,
    ativa: true,
  },
  {
    id: 'fund-1-manha',
    nome: 'Fundamental I',
    codigo: 'FUND1',
    nivel: 'Ensino Fundamental I',
    faixaEtaria: '6 a 10 anos',
    turno: 'Manhã',
    horario: '07:30 às 11:45',
    capacidadeMaxima: 10,
    professorResponsavel: 'Prof. Renata Albuquerque',
    sala: 'Sala 05 - Fundamental',
    mensalidadeSugerida: 580.0,
    ativa: true,
  },
];

// Carregar diretamente os alunos reais da planilha
export const initialStudents: Student[] = realStudents;

export const initialMensalidades: Mensalidade[] = realMensalidades;

export const initialDespesas: Despesa[] = realDespesas;

export const initialAvisos: Aviso[] = [
  {
    id: 'aviso-1',
    titulo: 'Reunião de Pais e Mestres - 1º Bimestre',
    mensagem: 'Convidamos todas as famílias para a nossa primeira reunião pedagógica do ano letivo de 2026, no próximo sábado às 09:00h.',
    tipo: 'Geral',
    publicoAlvo: 'ambos',
    data: '12/02/2026',
    autor: 'Diretoria Pedagógica',
    fixado: true,
  },
  {
    id: 'aviso-2',
    titulo: 'Dia do Brinquedo & Fantasia (Sexta-feira)',
    mensagem: 'Para as turmas da Educação Infantil (Maternal e Jardins), sexta-feira teremos atividades lúdicas temáticas!',
    tipo: 'Turma',
    publicoAlvo: 'pais',
    turmaNome: 'Educação Infantil',
    data: '13/02/2026',
    autor: 'Coordenação Infantil',
    fixado: false,
  },
  {
    id: 'aviso-3',
    titulo: 'Alinhamento Pedagógico Semanal (Professores)',
    mensagem: 'Lembramos aos educadores sobre a entrega dos relatórios bimestrais e planejamento de atividades até esta quinta-feira.',
    tipo: 'Geral',
    publicoAlvo: 'professores',
    data: '14/02/2026',
    autor: 'Coordenação Pedagógica',
    fixado: false,
  },
  {
    id: 'aviso-4',
    titulo: 'Campanha de Vacinação e Atualização de Caderneta',
    mensagem: 'Favor enviar na agenda uma cópia atualizada do comprovante de vacinação para conferência na secretaria.',
    tipo: 'Geral',
    publicoAlvo: 'pais',
    data: '10/02/2026',
    autor: 'Secretaria Escolar',
    fixado: false,
  },
];

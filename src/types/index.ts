export type NivelEnsino = 'Educação Infantil' | 'Ensino Fundamental I';

export type Turno = 'Manhã' | 'Tarde' | 'Integral' | 'Semi-integral';

export type StatusAluno = 'Ativo' | 'Inativo' | 'Trancado' | 'Concluído';

export type StatusPagamento = 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';

export type FormaPagamento = 'PIX' | 'Dinheiro' | 'Cartão de Débito' | 'Cartão de Crédito' | 'Transferência';

export type StatusFrequencia = 'Presente' | 'Falta' | 'Justificada';

export type PerfilUsuario = 'diretoria' | 'secretaria' | 'professor' | 'responsavel';

export type CategoriaDespesa =
  | 'Folha de Pagamento (Profissionais)'
  | 'Aluguel'
  | 'Contas de Luz'
  | 'Contas de Água'
  | 'Internet & Telefonia'
  | 'Contador'
  | 'Impostos & Receita Federal'
  | 'FGTS'
  | 'IPTU'
  | 'ICMS'
  | 'Taxa Prefeitura / Vigilância'
  | 'Bombeiro & Extintor'
  | 'Materiais de Limpeza & Pedagógicos'
  | '13º Mensal / Provisão'
  | 'Manutenção & Despesas Gerais';

export interface Despesa {
  id: string;
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
  mesReferencia: string; // Ex: "Fevereiro / 2026"
  mesIndex: number; // 1 a 12
  ano: number;
  dataVencimento?: string;
  dataPagamento?: string;
  status: 'Pago' | 'Pendente';
  formaPagamento?: string;
  observacoes?: string;
}

export interface Responsavel {
  nome: string;
  cpf: string;
  localTrabalho: string;
  telefone: string;
}

export interface ResponsaveisInfo {
  mae: Responsavel;
  pai: Responsavel;
  numeroEmergencia: string;
  numeroReserva: string;
  email: string;
}

export interface EnderecoInfo {
  rua: string;
  numeroCasa: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface SaudeERotina {
  alergias: string;
  restricoesAlimentares: string;
  medicamentosUsoContinuo: string;
  observacoesMedicas: string;
  pessoasAutorizadasBusca: string;
  autorizacaoImagem: boolean;
  autorizacaoPasseios: boolean;
}

export interface RenovacaoHistorico {
  ano: string;
  idade: string;
  turma: string;
  matricula: string;
  dataRenovacao: string;
  assResponsavel?: string;
  status: string;
}

export interface Student {
  id: string;
  matricula: string;
  nome: string;
  fotoUrl?: string;
  dataNascimento: string;
  idadeCalculada?: string;
  sexo: 'M' | 'F';
  nacionalidade: string;
  certidaoNascimento: {
    numeroRegistro: string;
    livroEFolha: string;
  };
  identidade: string;
  cpf: string;
  turmaId: string;
  turmaNome: string;
  turno: Turno;
  horario: string;
  anoLetivo: string;
  status: StatusAluno;
  responsaveis: ResponsaveisInfo;
  endereco: EnderecoInfo;
  saudeERotina: SaudeERotina;
  renovacoes: RenovacaoHistorico[];
  valorMensalidadePadrao: number;
  diaVencimentoPadrao: number;
  descontoPadrao?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Mensalidade {
  id: string;
  alunoId: string;
  alunoNome: string;
  turmaNome: string;
  mesReferencia: string;
  mesIndex: number;
  ano: number;
  numeroParcela: number;
  valorOriginal: number;
  desconto: number;
  acrescimo: number;
  valorFinal: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: StatusPagamento;
  formaPagamento?: FormaPagamento;
  numeroRecibo?: string;
  observacoes?: string;
  pagoPor?: string;
  registradoPor?: string;
}

export interface Turma {
  id: string;
  nome: string;
  codigo: string;
  nivel: NivelEnsino;
  faixaEtaria: string;
  turno: Turno;
  horario: string;
  capacidadeMaxima: number;
  professorResponsavel?: string;
  sala?: string;
  mensalidadeSugerida: number;
  ativa: boolean;
}

export interface ItemFrequencia {
  alunoId: string;
  alunoNome: string;
  fotoUrl?: string;
  status: StatusFrequencia;
  observacao?: string;
}

export interface ChamadaFrequencia {
  id: string;
  turmaId: string;
  turmaNome: string;
  data: string;
  turno: Turno;
  registros: ItemFrequencia[];
  conteudoMinistrado?: string;
  registradoPor: string;
  createdAt: string;
}

export type PublicoAlvoAviso = 'professores' | 'pais' | 'ambos';

export interface Aviso {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'Geral' | 'Turma' | 'Urgente' | 'Evento' | 'Financeiro';
  publicoAlvo?: PublicoAlvoAviso; // 'professores' | 'pais' | 'ambos'
  turmaId?: string;
  turmaNome?: string;
  data: string;
  autor: string;
  fixado?: boolean;
}

export interface EscolaConfig {
  nome: string;
  razaoSocial?: string;
  cnpj: string;
  resolucao: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefonePrincipal: string;
  telefoneSecundario: string;
  email: string;
  instagram: string;
  chavePix: string;
  bancoPix: string;
  titularPix: string;
  anoLetivoAtivo: string;
  diaVencimentoPadrao: number;
  metaFaturamentoMensal: number;
}

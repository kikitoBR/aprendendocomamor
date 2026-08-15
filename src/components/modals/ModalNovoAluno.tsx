'use client';

import React, { useState, useEffect } from 'react';
import { Student, Turma, Turno, StatusAluno } from '@/types';
import { calcularIdade } from '@/utils/helpers';
import { X, User, Heart, MapPin, Users, CheckCircle, Upload } from 'lucide-react';

interface ModalNovoAlunoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => void;
  turmas: Turma[];
  studentToEdit?: Student | null;
  anoLetivoAtivo: string;
}

export const ModalNovoAluno: React.FC<ModalNovoAlunoProps> = ({
  isOpen,
  onClose,
  onSave,
  turmas,
  studentToEdit,
  anoLetivoAtivo,
}) => {
  const [activeTab, setActiveTab] = useState<'dados' | 'responsaveis' | 'endereco' | 'saude'>('dados');

  // Form State
  const [nome, setNome] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [dataNascimento, setDataNascimento] = useState('2023-05-02');
  const [idadeCalculada, setIdadeCalculada] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F'>('F');
  const [nacionalidade, setNacionalidade] = useState('Brasileira');
  const [certidaoNumero, setCertidaoNumero] = useState('');
  const [certidaoLivroFolha, setCertidaoLivroFolha] = useState('');
  const [identidade, setIdentidade] = useState('');
  const [cpf, setCpf] = useState('');
  const [turmaId, setTurmaId] = useState(turmas[0]?.id || 'jardim-1-tarde');
  const [turno, setTurno] = useState<Turno>('Tarde');
  const [horario, setHorario] = useState('13:00 às 17:00');
  const [status, setStatus] = useState<StatusAluno>('Ativo');
  const [valorMensalidade, setValorMensalidade] = useState<number | string>(500);
  const [diaVencimento, setDiaVencimento] = useState(10);
  const [descontoPadrao, setDescontoPadrao] = useState<number | string>(0);

  // Responsáveis
  const [maeNome, setMaeNome] = useState('');
  const [maeCpf, setMaeCpf] = useState('');
  const [maeTrabalho, setMaeTrabalho] = useState('');
  const [maeTelefone, setMaeTelefone] = useState('');

  const [paiNome, setPaiNome] = useState('');
  const [paiCpf, setPaiCpf] = useState('');
  const [paiTrabalho, setPaiTrabalho] = useState('');
  const [paiTelefone, setPaiTelefone] = useState('');

  const [numeroEmergencia, setNumeroEmergencia] = useState('');
  const [numeroReserva, setNumeroReserva] = useState('');
  const [email, setEmail] = useState('');

  // Endereço
  const [rua, setRua] = useState('');
  const [numeroCasa, setNumeroCasa] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('Campos dos Goytacazes');
  const [uf, setUf] = useState('RJ');
  const [cep, setCep] = useState('');

  // Saúde e Rotina
  const [alergias, setAlergias] = useState('');
  const [restricoesAlimentares, setRestricoesAlimentares] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [observacoesMedicas, setObservacoesMedicas] = useState('');
  const [pessoasAutorizadas, setPessoasAutorizadas] = useState('');
  const [autorizacaoImagem, setAutorizacaoImagem] = useState(true);
  const [autorizacaoPasseios, setAutorizacaoPasseios] = useState(true);

  // Atualizar idade quando muda a data de nascimento
  useEffect(() => {
    if (dataNascimento) {
      setIdadeCalculada(calcularIdade(dataNascimento));
    }
  }, [dataNascimento]);

  // Se a turma mudar, sincroniza o turno e a sugestão de mensalidade
  const handleTurmaChange = (selectedTurmaId: string) => {
    setTurmaId(selectedTurmaId);
    const turmaSelecionada = turmas.find((t) => t.id === selectedTurmaId);
    if (turmaSelecionada) {
      setTurno(turmaSelecionada.turno);
      setHorario(turmaSelecionada.horario);
      if (!studentToEdit) {
        setValorMensalidade(turmaSelecionada.mensalidadeSugerida || 500);
      }
    }
  };

  // Preencher quando for edição
  useEffect(() => {
    if (studentToEdit) {
      setNome(studentToEdit.nome);
      setFotoUrl(studentToEdit.fotoUrl || '');
      setDataNascimento(studentToEdit.dataNascimento);
      setIdadeCalculada(studentToEdit.idadeCalculada || calcularIdade(studentToEdit.dataNascimento));
      setSexo(studentToEdit.sexo);
      setNacionalidade(studentToEdit.nacionalidade || 'Brasileira');
      setCertidaoNumero(studentToEdit.certidaoNascimento?.numeroRegistro || '');
      setCertidaoLivroFolha(studentToEdit.certidaoNascimento?.livroEFolha || '');
      setIdentidade(studentToEdit.identidade || '');
      setCpf(studentToEdit.cpf || '');
      setTurmaId(studentToEdit.turmaId);
      setTurno(studentToEdit.turno);
      setHorario(studentToEdit.horario);
      setStatus(studentToEdit.status);
      setValorMensalidade(studentToEdit.valorMensalidadePadrao || 500);
      setDiaVencimento(studentToEdit.diaVencimentoPadrao || 10);
      setDescontoPadrao(studentToEdit.descontoPadrao || 0);

      setMaeNome(studentToEdit.responsaveis?.mae?.nome || '');
      setMaeCpf(studentToEdit.responsaveis?.mae?.cpf || '');
      setMaeTrabalho(studentToEdit.responsaveis?.mae?.localTrabalho || '');
      setMaeTelefone(studentToEdit.responsaveis?.mae?.telefone || '');

      setPaiNome(studentToEdit.responsaveis?.pai?.nome || '');
      setPaiCpf(studentToEdit.responsaveis?.pai?.cpf || '');
      setPaiTrabalho(studentToEdit.responsaveis?.pai?.localTrabalho || '');
      setPaiTelefone(studentToEdit.responsaveis?.pai?.telefone || '');

      setNumeroEmergencia(studentToEdit.responsaveis?.numeroEmergencia || '');
      setNumeroReserva(studentToEdit.responsaveis?.numeroReserva || '');
      setEmail(studentToEdit.responsaveis?.email || '');

      setRua(studentToEdit.endereco?.rua || '');
      setNumeroCasa(studentToEdit.endereco?.numeroCasa || '');
      setComplemento(studentToEdit.endereco?.complemento || '');
      setBairro(studentToEdit.endereco?.bairro || '');
      setCidade(studentToEdit.endereco?.cidade || 'Campos dos Goytacazes');
      setUf(studentToEdit.endereco?.uf || 'RJ');
      setCep(studentToEdit.endereco?.cep || '');

      setAlergias(studentToEdit.saudeERotina?.alergias || '');
      setRestricoesAlimentares(studentToEdit.saudeERotina?.restricoesAlimentares || '');
      setMedicamentos(studentToEdit.saudeERotina?.medicamentosUsoContinuo || '');
      setObservacoesMedicas(studentToEdit.saudeERotina?.observacoesMedicas || '');
      setPessoasAutorizadas(studentToEdit.saudeERotina?.pessoasAutorizadasBusca || '');
      setAutorizacaoImagem(studentToEdit.saudeERotina?.autorizacaoImagem ?? true);
      setAutorizacaoPasseios(studentToEdit.saudeERotina?.autorizacaoPasseios ?? true);
    } else {
      // Resetar form
      setNome('');
      setFotoUrl('');
      setDataNascimento('2023-05-02');
      setCpf('');
      setMaeNome('');
      setPaiNome('');
      setMaeTelefone('');
      setPaiTelefone('');
      setNumeroEmergencia('');
      setNumeroReserva('');
      setRua('');
      setBairro('');
      setNumeroCasa('');
      setComplemento('');
      setCep('');
      setAlergias('');
      setPessoasAutorizadas('');
    }
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, informe o nome do aluno.');
      setActiveTab('dados');
      return;
    }

    const turmaEscolhida = turmas.find((t) => t.id === turmaId);
    const turmaNome = turmaEscolhida?.nome || 'Maternal';

    const payload: Partial<Student> = {
      nome: nome.trim(),
      fotoUrl,
      dataNascimento,
      idadeCalculada,
      sexo,
      nacionalidade,
      certidaoNascimento: {
        numeroRegistro: certidaoNumero,
        livroEFolha: certidaoLivroFolha,
      },
      identidade,
      cpf,
      turmaId,
      turmaNome,
      turno,
      horario,
      anoLetivo: studentToEdit?.anoLetivo || anoLetivoAtivo,
      status,
      valorMensalidadePadrao: Number(valorMensalidade) || 500,
      diaVencimentoPadrao: Number(diaVencimento) || 10,
      descontoPadrao: Number(descontoPadrao) || 0,
      responsaveis: {
        mae: {
          nome: maeNome,
          cpf: maeCpf,
          localTrabalho: maeTrabalho,
          telefone: maeTelefone,
        },
        pai: {
          nome: paiNome,
          cpf: paiCpf,
          localTrabalho: paiTrabalho,
          telefone: paiTelefone,
        },
        numeroEmergencia,
        numeroReserva,
        email,
      },
      endereco: {
        rua,
        numeroCasa,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
      },
      saudeERotina: {
        alergias,
        restricoesAlimentares,
        medicamentosUsoContinuo: medicamentos,
        observacoesMedicas,
        pessoasAutorizadasBusca: pessoasAutorizadas,
        autorizacaoImagem,
        autorizacaoPasseios,
      },
    };

    onSave(payload);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Cabeçalho do Modal */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-inner">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {studentToEdit ? 'Editar Cadastro do Aluno' : 'Nova Matrícula Escolar'}
              </h2>
              <p className="text-amber-100 text-xs mt-0.5">
                {studentToEdit ? `Atualizando informações de ${studentToEdit.nome}` : 'Preencha os dados oficiais da Ficha de Matrícula'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 ${
              activeTab === 'dados'
                ? 'bg-white text-orange-600 border-orange-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <User className="w-4 h-4" />
            1. Dados do Aluno & Turma
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('responsaveis')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 ${
              activeTab === 'responsaveis'
                ? 'bg-white text-orange-600 border-orange-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            2. Filiação & Emergência
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('endereco')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 ${
              activeTab === 'endereco'
                ? 'bg-white text-orange-600 border-orange-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <MapPin className="w-4 h-4" />
            3. Endereço
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saude')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 ${
              activeTab === 'saude'
                ? 'bg-white text-orange-600 border-orange-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Heart className="w-4 h-4" />
            4. Saúde & Autorizações
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ABA 1: DADOS DO ALUNO */}
          {activeTab === 'dados' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Foto e Nome */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-3 flex flex-col items-center gap-2">
                  <div className="relative group w-28 h-32 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden bg-slate-100 flex flex-col items-center justify-center text-center shadow-inner">
                    {fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fotoUrl} alt="Foto Aluno" className="w-full h-full object-cover" />
                    ) : (
                      <div className="p-2 text-slate-400 flex flex-col items-center">
                        <Upload className="w-6 h-6 mb-1 text-slate-400" />
                        <span className="text-[10px] font-bold">Foto 3x4</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold cursor-pointer transition">
                      Alterar Foto
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-400">PNG, JPG ou JPEG</span>
                </div>

                <div className="md:col-span-9 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nome Completo do Aluno *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria Julia de Souza Quirino"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
                        required
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Idade Calculada
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={idadeCalculada || 'Calculando...'}
                        className="w-full px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Sexo
                      </label>
                      <select
                        value={sexo}
                        onChange={(e) => setSexo(e.target.value as 'M' | 'F')}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium"
                      >
                        <option value="F">Feminino (F)</option>
                        <option value="M">Masculino (M)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentos Civis */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Documentação Civil & Registro
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Certidão de Nascimento (Termo / Matrícula)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 128475 01 55 2023..."
                      value={certidaoNumero}
                      onChange={(e) => setCertidaoNumero(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Livro e Folha
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Livro A-412 / Fl 188"
                      value={certidaoLivroFolha}
                      onChange={(e) => setCertidaoLivroFolha(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      CPF do Aluno
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Turma, Turno e Valores */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Turma & Condições Financeiras
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Turma *
                    </label>
                    <select
                      value={turmaId}
                      onChange={(e) => handleTurmaChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                    >
                      {turmas.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nome} ({t.turno})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Turno & Horário
                    </label>
                    <input
                      type="text"
                      value={`${turno} - ${horario}`}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg bg-slate-200/60 border border-slate-300 text-xs font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Mensalidade Padrão (R$)
                    </label>
                    <input
                      type="number"
                      value={valorMensalidade}
                      onChange={(e) => setValorMensalidade(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Dia Vencimento
                    </label>
                    <select
                      value={diaVencimento}
                      onChange={(e) => setDiaVencimento(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                    >
                      <option value={5}>Dia 05</option>
                      <option value={10}>Dia 10 (Padrão)</option>
                      <option value={15}>Dia 15</option>
                      <option value={20}>Dia 20</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: RESPONSÁVEIS */}
          {activeTab === 'responsaveis' && (
            <div className="space-y-5 animate-in fade-in">
              {/* MÃE */}
              <div className="border border-rose-200 rounded-2xl p-4 bg-rose-50/40 space-y-3">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-rose-500" />
                  Dados da Mãe
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome da Mãe</label>
                    <input
                      type="text"
                      placeholder="Ex: Tamires de Souza Conceição"
                      value={maeNome}
                      onChange={(e) => setMaeNome(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(22) 99882-4647"
                      value={maeTelefone}
                      onChange={(e) => setMaeTelefone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">CPF da Mãe</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={maeCpf}
                      onChange={(e) => setMaeCpf(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Local de Trabalho</label>
                    <input
                      type="text"
                      placeholder="Ex: Comércio Central - Campos dos Goytacazes"
                      value={maeTrabalho}
                      onChange={(e) => setMaeTrabalho(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* PAI */}
              <div className="border border-blue-200 rounded-2xl p-4 bg-blue-50/40 space-y-3">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-500" />
                  Dados do Pai
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome do Pai</label>
                    <input
                      type="text"
                      placeholder="Ex: Fabricio Quirino de Souza"
                      value={paiNome}
                      onChange={(e) => setPaiNome(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(22) 99882-4647"
                      value={paiTelefone}
                      onChange={(e) => setPaiTelefone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">CPF do Pai</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={paiCpf}
                      onChange={(e) => setPaiCpf(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Local de Trabalho</label>
                    <input
                      type="text"
                      placeholder="Ex: Serviços e Transporte"
                      value={paiTrabalho}
                      onChange={(e) => setPaiTrabalho(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* CONTATOS DE EMERGÊNCIA & RESERVA */}
              <div className="border border-amber-200 rounded-2xl p-4 bg-amber-50/40 space-y-3">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Contatos de Emergência & Reserva
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Número de Emergência (com Parentesco)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: (22) 99882-4647 (Fabricio Pai)"
                      value={numeroEmergencia}
                      onChange={(e) => setNumeroEmergencia(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-rose-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Número Reserva (com Parentesco)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: (22) 99997-7451 (Avó Emilce)"
                      value={numeroReserva}
                      onChange={(e) => setNumeroReserva(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-amber-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      E-mail da Família
                    </label>
                    <input
                      type="email"
                      placeholder="familia@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: ENDEREÇO */}
          {activeTab === 'endereco' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Rua / Logradouro</label>
                  <input
                    type="text"
                    placeholder="Ex: Dr. Álvaro Grain"
                    value={rua}
                    onChange={(e) => setRua(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Número</label>
                  <input
                    type="text"
                    placeholder="Ex: 149"
                    value={numeroCasa}
                    onChange={(e) => setNumeroCasa(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Complemento</label>
                  <input
                    type="text"
                    placeholder="Ex: Casa 3"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bairro</label>
                  <input
                    type="text"
                    placeholder="Ex: Julião Nogueira"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">CEP</label>
                  <input
                    type="text"
                    placeholder="28000-001"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: SAÚDE & AUTORIZAÇÕES */}
          {activeTab === 'saude' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alergias a Medicamentos / Insetos / Outros
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Nenhuma alergia conhecida a medicamentos"
                    value={alergias}
                    onChange={(e) => setAlergias(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Restrições Alimentares / Intolerâncias
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Intolerância leve à lactose"
                    value={restricoesAlimentares}
                    onChange={(e) => setRestricoesAlimentares(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pessoas Autorizadas a Retirar a Criança na Escola
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tamires (Mãe), Fabricio (Pai), Avó Emilce, Van Escolar Tio Marcos"
                    value={pessoasAutorizadas}
                    onChange={(e) => setPessoasAutorizadas(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={autorizacaoImagem}
                      onChange={(e) => setAutorizacaoImagem(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                    />
                    Autorização de uso de imagem em atividades pedagógicas e eventos escolares
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={autorizacaoPasseios}
                      onChange={(e) => setAutorizacaoPasseios(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                    />
                    Autorização para passeios e visitas pedagógicas supervisionadas
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Rodapé com Ações */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 transition transform active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              {studentToEdit ? 'Salvar Alterações' : 'Concluir Matrícula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

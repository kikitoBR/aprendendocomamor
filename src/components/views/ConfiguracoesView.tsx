'use client';

import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { EscolaConfig } from '@/types';
import {
  Settings,
  Save,
  Building,
  CreditCard,
  Phone,
  CheckCircle,
  MapPin,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { ModalConfirmacao } from '@/components/modals/ModalConfirmacao';

export const ConfiguracoesView: React.FC = () => {
  const {
    config,
    updateConfig,
    exportarBackup,
    restaurarBackup,
    carregarDadosReaisDaPlanilha,
    resetarDados,
  } = useSchool();

  const [formData, setFormData] = useState<EscolaConfig>(config);
  const [salvo, setSalvo] = useState(false);

  // Estados de confirmação
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isReloadRealDataConfirmOpen, setIsReloadRealDataConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        restaurarBackup(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Configurações da Escola & Sistema
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Dados cadastrais oficiais para impressão de fichas timbradas, recibos e cobrança via PIX.
          </p>
        </div>

        {salvo && (
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-md animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            Configurações Salvas com Sucesso!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Institucionais e Regulamentares */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-orange-500" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Identificação Institucional & Regulamentação
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome de Exibição da Escola *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ Oficial *</label>
              <input
                type="text"
                required
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ato / Resolução do CME de Autorização
              </label>
              <input
                type="text"
                value={formData.resolucao}
                onChange={(e) => setFormData({ ...formData, resolucao: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ano Letivo Ativo</label>
              <input
                type="text"
                value={formData.anoLetivoAtivo}
                onChange={(e) => setFormData({ ...formData, anoLetivoAtivo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Endereço da Sede */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-orange-500" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Localização da Sede
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro / Rua</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CEP</label>
              <input
                type="text"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">UF / Estado</label>
              <input
                type="text"
                value={formData.uf}
                onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Contatos & Canais Oficiais */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Phone className="w-5 h-5 text-orange-500" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Contatos Telefônicos & Canais Digitais
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Principal *
              </label>
              <input
                type="text"
                required
                value={formData.telefonePrincipal}
                onChange={(e) => setFormData({ ...formData, telefonePrincipal: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Secundário</label>
              <input
                type="text"
                value={formData.telefoneSecundario}
                onChange={(e) => setFormData({ ...formData, telefoneSecundario: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail da Escola</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram (@)</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Dados de Pagamento e PIX */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Dados Financeiros & Chave PIX Oficial
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Chave PIX da Escola *
              </label>
              <input
                type="text"
                required
                value={formData.chavePix}
                onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Banco / Instituição</label>
              <input
                type="text"
                value={formData.bancoPix}
                onChange={(e) => setFormData({ ...formData, bancoPix: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Titular da Conta</label>
              <input
                type="text"
                value={formData.titularPix}
                onChange={(e) => setFormData({ ...formData, titularPix: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Botão Salvar Configurações */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-orange-500/20 transition transform active:scale-95"
          >
            <Save className="w-5 h-5" />
            Salvar Configurações
          </button>
        </div>
      </form>

      {/* Seção de Backup, Restauração e Manutenção com Confirmação */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Backup, Restauração & Manutenção dos Dados
            </h2>
            <p className="text-xs text-slate-500">
              Exporte todos os dados cadastrais e financeiros para segurança ou restaure versões anteriores.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={exportarBackup}
            className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold p-3.5 rounded-2xl text-xs transition border border-indigo-100"
          >
            <Download className="w-4 h-4" />
            Exportar Backup JSON
          </button>

          <label className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold p-3.5 rounded-2xl text-xs transition border border-slate-200 cursor-pointer text-center">
            <Upload className="w-4 h-4" />
            Restaurar Backup
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => setIsReloadRealDataConfirmOpen(true)}
            className="flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold p-3.5 rounded-2xl text-xs transition border border-amber-200"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar 83 Alunos 2026
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold p-3.5 rounded-2xl text-xs transition border border-rose-200"
          >
            <Trash2 className="w-4 h-4" />
            Restaurar Padrões Iniciais
          </button>
        </div>
      </div>

      {/* Modal de Confirmação: Recarregar 83 Alunos */}
      <ModalConfirmacao
        isOpen={isReloadRealDataConfirmOpen}
        onClose={() => setIsReloadRealDataConfirmOpen(false)}
        onConfirm={() => {
          carregarDadosReaisDaPlanilha();
          setIsReloadRealDataConfirmOpen(false);
        }}
        title="Recarregar Base Oficial de 83 Alunos?"
        description={
          <div>
            Esta ação sincronizará novamente o sistema com todos os <strong>83 alunos reais</strong> e despesas oficiais de 2026 extraídos da planilha da escola.
            <p className="mt-2 text-slate-500 text-xs">
              Modificações manuais não salvas em backup poderão ser sobrescritas.
            </p>
          </div>
        }
        confirmText="Sim, Recarregar Base"
        cancelText="Cancelar"
        variant="warning"
      />

      {/* Modal de Confirmação: Reset Completo */}
      <ModalConfirmacao
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetarDados();
          setIsResetConfirmOpen(false);
        }}
        title="Restaurar Configurações e Dados Padrão?"
        description={
          <div>
            Tem certeza que deseja resetar o banco de dados local para os dados de demonstração iniciais?
            <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs">
              <strong>⚠️ Atenção:</strong> Todos os registros atuais de frequência, pagamentos e novos alunos cadastrados serão apagados.
            </div>
          </div>
        }
        confirmText="Sim, Resetar Tudo"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

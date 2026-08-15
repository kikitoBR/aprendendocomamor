'use client';

import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Despesa, CategoriaDespesa } from '@/types';
import { formatarMoeda, formatarDataBR, mesesAno } from '@/utils/helpers';
import * as XLSX from 'xlsx';
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Plus,
  Download,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  X,
  Building,
  Zap,
  Droplet,
  Wifi,
  Users,
  Briefcase,
  Receipt,
  Sparkles,
} from 'lucide-react';

import { ModalConfirmacao } from '@/components/modals/ModalConfirmacao';

export const DespesasView: React.FC = () => {
  const { despesas, mensalidades, addDespesa, updateDespesa, deleteDespesa, pagarDespesa, config } = useSchool();
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);
  const [modalNovaDespesa, setModalNovaDespesa] = useState(false);
  const [despesaEmEdicao, setDespesaEmEdicao] = useState<Despesa | null>(null);
  const [despesaToDelete, setDespesaToDelete] = useState<Despesa | null>(null);

  // Form State
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaDespesa>('Contas de Luz');
  const [valor, setValor] = useState<number | string>(200);
  const [dataVencimento, setDataVencimento] = useState('2026-02-15');
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pendente');

  const listaMeses = mesesAno();

  // Filtrar despesas e mensalidades do mês
  const despesasDoMes = despesas.filter((d) => d.mesIndex === mesSelecionado && d.ano === 2026);
  const mensalidadesDoMes = mensalidades.filter((m) => m.mesIndex === mesSelecionado && m.ano === 2026);

  // DRE Cálculos
  const totalEntradas = mensalidadesDoMes
    .filter((m) => m.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valorFinal, 0);

  const totalSaidasPagas = despesasDoMes
    .filter((d) => d.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalSaidasGeral = despesasDoMes.reduce((acc, curr) => acc + curr.valor, 0);

  const saldoLiquido = totalEntradas - totalSaidasPagas;

  const categoriasLista: CategoriaDespesa[] = [
    'Folha de Pagamento (Profissionais)',
    'Aluguel',
    'Contas de Luz',
    'Contas de Água',
    'Internet & Telefonia',
    'Contador',
    'Impostos & Receita Federal',
    'FGTS',
    'IPTU',
    'ICMS',
    'Taxa Prefeitura / Vigilância',
    'Bombeiro & Extintor',
    'Materiais de Limpeza & Pedagógicos',
    '13º Mensal / Provisão',
    'Manutenção & Despesas Gerais',
  ];

  const handleOpenModal = (d?: Despesa) => {
    if (d) {
      setDespesaEmEdicao(d);
      setDescricao(d.descricao);
      setCategoria(d.categoria);
      setValor(d.valor);
      setDataVencimento(d.dataVencimento || '');
      setStatus(d.status);
    } else {
      setDespesaEmEdicao(null);
      setDescricao('');
      setCategoria('Contas de Luz');
      setValor(200);
      setDataVencimento(`2026-${String(mesSelecionado).padStart(2, '0')}-15`);
      setStatus('Pendente');
    }
    setModalNovaDespesa(true);
  };

  const handleSalvarDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    const mesNome = listaMeses.find((m) => m.index === mesSelecionado)?.nome || 'Fevereiro';

    if (despesaEmEdicao) {
      updateDespesa(despesaEmEdicao.id, {
        descricao,
        categoria,
        valor: Number(valor),
        dataVencimento,
        status,
        dataPagamento: status === 'Pago' ? new Date().toISOString().slice(0, 10) : undefined,
      });
    } else {
      addDespesa({
        descricao,
        categoria,
        valor: Number(valor),
        mesReferencia: `${mesNome} / 2026`,
        mesIndex: mesSelecionado,
        ano: 2026,
        dataVencimento,
        dataPagamento: status === 'Pago' ? new Date().toISOString().slice(0, 10) : undefined,
        status,
        formaPagamento: 'PIX / Débito',
      });
    }
    setModalNovaDespesa(false);
  };

  const exportarDespesasExcel = () => {
    const dados = despesasDoMes.map((d) => ({
      Mês: d.mesReferencia,
      Descrição: d.descricao,
      Categoria: d.categoria,
      Valor: d.valor,
      Vencimento: formatarDataBR(d.dataVencimento),
      'Data Pagamento': formatarDataBR(d.dataPagamento),
      Status: d.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Despesas');
    XLSX.writeFile(workbook, `despesas_aprendendo_com_amor_${mesSelecionado}_2026.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Controle de Despesas & DRE Escolar
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Demonstrativo de Resultados: Entradas das mensalidades vs Saídas operacionais (Luz, Água, Folha, Aluguel, Impostos).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarDespesasExcel}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md shadow-rose-500/20 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Lançar Despesa
          </button>
        </div>
      </div>

      {/* Seletor de Meses */}
      <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {listaMeses.map((m) => (
          <button
            key={m.index}
            onClick={() => setMesSelecionado(m.index)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
              mesSelecionado === m.index
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {m.nome}
          </button>
        ))}
      </div>

      {/* DRE Cards de Balanço Mensal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              (+) Entradas (Mensalidades Pagas)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700 font-mono">
            {formatarMoeda(totalEntradas)}
          </div>
          <span className="text-[11px] text-emerald-800 mt-1 block">
            {mensalidadesDoMes.filter((m) => m.status === 'Pago').length} pagamentos confirmados
          </span>
        </div>

        {/* Saídas */}
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              (-) Saídas (Despesas Operacionais)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-700 font-mono">
            {formatarMoeda(totalSaidasPagas)}
          </div>
          <span className="text-[11px] text-rose-800 mt-1 block">
            Total Previsto no Mês: {formatarMoeda(totalSaidasGeral)}
          </span>
        </div>

        {/* Saldo Líquido */}
        <div
          className={`rounded-3xl p-6 shadow-sm border ${
            saldoLiquido >= 0
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-red-500 text-white border-red-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              (=) Lucro Líquido / Saldo Real
            </span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-black font-mono">
            {formatarMoeda(saldoLiquido)}
          </div>
          <span className="text-[11px] text-slate-300 mt-1 block">
            {saldoLiquido >= 0 ? 'Resultado Operacional Positivo 🚀' : 'Atenção: Despesas superaram receitas'}
          </span>
        </div>
      </div>

      {/* Tabela de Despesas Detalhadas */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-rose-500" />
            Extrato de Despesas Operacionais ({despesasDoMes.length} itens)
          </h3>
          <span className="text-xs text-slate-500">
            Total: <strong>{formatarMoeda(totalSaidasGeral)}</strong>
          </span>
        </div>

        {/* Visualização em Cards (Mobile < md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {despesasDoMes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="font-bold text-slate-700 text-sm">Nenhuma despesa neste mês</p>
            </div>
          ) : (
            despesasDoMes.map((d) => (
              <div key={`mob-${d.id}`} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg truncate">
                    {d.categoria}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      d.status === 'Pago'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {d.status === 'Pago' ? 'Pago' : 'Pendente'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">{d.descricao}</p>

                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Vencimento</span>
                    <span className="text-slate-700 font-semibold">{formatarDataBR(d.dataVencimento)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor</span>
                    <span className="font-black font-mono text-rose-700 text-sm">{formatarMoeda(d.valor)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {d.status !== 'Pago' && (
                    <button
                      onClick={() => pagarDespesa(d.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl font-bold text-xs transition shadow-xs flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Dar Baixa (Pagar)</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenModal(d)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDespesaToDelete(d)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                    title="Excluir Despesa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Visualização em Tabela (Desktop >= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5">Descrição</th>
                <th className="p-3.5">Vencimento</th>
                <th className="p-3.5">Valor (R$)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {despesasDoMes.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-slate-900">{d.categoria}</td>
                  <td className="p-3.5 text-slate-600">{d.descricao}</td>
                  <td className="p-3.5 text-slate-700 font-medium">{formatarDataBR(d.dataVencimento)}</td>
                  <td className="p-3.5 font-black font-mono text-rose-700 text-sm">{formatarMoeda(d.valor)}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        d.status === 'Pago'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {d.status === 'Pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {d.status !== 'Pago' ? (
                        <button
                          onClick={() => pagarDespesa(d.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] transition shadow-xs"
                        >
                          Pagar
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                          Quitado
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenModal(d)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDespesaToDelete(d)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Excluir Despesa"
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

      {/* Modal Lançar / Editar Despesa */}
      {modalNovaDespesa && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-rose-600 to-red-600 p-6 text-white flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight">
                {despesaEmEdicao ? 'Editar Despesa' : 'Lançar Nova Despesa'}
              </h3>
              <button
                onClick={() => setModalNovaDespesa(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarDespesa} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Categoria *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaDespesa)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                >
                  {categoriasLista.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição da Conta / Despesa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Enel Luz do mês, Compra de materiais..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-rose-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status do Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Pendente')}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      status === 'Pendente'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Pendente
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Pago')}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      status === 'Pago'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Já Pago
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModalNovaDespesa(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação: Exclusão de Despesa */}
      <ModalConfirmacao
        isOpen={!!despesaToDelete}
        onClose={() => setDespesaToDelete(null)}
        onConfirm={() => {
          if (despesaToDelete) {
            deleteDespesa(despesaToDelete.id);
            setDespesaToDelete(null);
          }
        }}
        title="Excluir Despesa Operacional?"
        description={
          <div>
            Tem certeza que deseja remover a despesa{' '}
            <strong className="text-slate-900 font-bold">{despesaToDelete?.descricao}</strong> no valor de{' '}
            <strong className="text-rose-600 font-bold">{formatarMoeda(despesaToDelete?.valor || 0)}</strong> do mês de{' '}
            {despesaToDelete?.mesReferencia}?
            <p className="mt-2 text-slate-500 text-xs">
              Esta ação recalculará o DRE mensal e o balanço financeiro da instituição.
            </p>
          </div>
        }
        confirmText="Sim, Excluir Despesa"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

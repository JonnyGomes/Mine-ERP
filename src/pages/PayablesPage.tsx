import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AccountPayable, PayableStatus } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const PayablesPage: React.FC = () => {
  const { payables, suppliers, payPayable, addPayable } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal Baixa
  const [selectedPayable, setSelectedPayable] = useState<AccountPayable | null>(null);
  const [payAmountInput, setPayAmountInput] = useState('');

  // Modal Novo
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newSupId, setNewSupId] = useState(suppliers[0]?.id || '');
  const [newDoc, setNewDoc] = useState('');
  const [newCategory, setNewCategory] = useState('Mercadorias');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');

  const handleOpenPayment = (p: AccountPayable) => {
    setSelectedPayable(p);
    setPayAmountInput(p.balance.toFixed(2));
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayable) return;
    const amount = parseFloat(payAmountInput.replace(',', '.')) || 0;
    if (amount <= 0) return;

    payPayable(selectedPayable.id, amount);
    setSelectedPayable(null);
  };

  const handleCreatePayable = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === newSupId) || suppliers[0];
    const val = parseFloat(newAmount.replace(',', '.')) || 0;
    if (val <= 0) return;

    addPayable({
      supplierId: sup.id,
      supplierName: sup.name,
      documentNumber: newDoc || `NF-${Date.now().toString().slice(-5)}`,
      category: newCategory,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newDueDate,
      amount: val,
      paidAmount: 0,
      balance: val,
      status: 'PENDENTE',
      notes: newNotes,
    });

    setIsNewModalOpen(false);
    setNewAmount('');
    setNewDoc('');
    setNewNotes('');
  };

  const filtered = payables.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.supplierName.toLowerCase().includes(q) ||
      p.documentNumber.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: PayableStatus) => {
    const styles: Record<PayableStatus, string> = {
      PENDENTE: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
      PARCIAL: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      PAGO: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      VENCIDO: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
      CANCELADO: 'bg-slate-100 text-slate-500',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const totalBalance = filtered.reduce((acc, p) => acc + p.balance, 0);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Contas a Pagar
          </h1>
          <p className="text-xs text-slate-500">
            Controle de despesas operacionais, boletos de fornecedores e compromissos
          </p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Conta a Pagar</span>
        </button>
      </div>

      {/* Filter and Totals Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por fornecedor, documento ou categoria..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="VENCIDO">Vencido</option>
            <option value="PARCIAL">Parcial</option>
            <option value="PAGO">Pago</option>
          </select>

          <div className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Total a Pagar: <span className="font-mono text-rose-600 dark:text-rose-400 font-bold tabular-nums">{formatCurrency(totalBalance)}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Documento</th>
                <th className="py-2.5 px-3">Fornecedor</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Vencimento</th>
                <th className="py-2.5 px-3 text-right">Valor Título</th>
                <th className="py-2.5 px-3 text-right">Valor Pago</th>
                <th className="py-2.5 px-3 text-right">Saldo Devedor</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nenhuma conta a pagar encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {p.documentNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {p.supplierName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {p.category}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {formatDateBR(p.dueDate)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(p.paidAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(p.balance)}
                    </td>
                    <td className="py-2.5 px-3 text-center">{getStatusBadge(p.status)}</td>
                    <td className="py-2.5 px-3 text-center">
                      {p.balance > 0 ? (
                        <button
                          onClick={() => handleOpenPayment(p)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs"
                          title="Pagar / Baixar conta"
                        >
                          Pagar
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Pago</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BAIXAR CONTA A PAGAR */}
      <Modal
        isOpen={Boolean(selectedPayable)}
        onClose={() => setSelectedPayable(null)}
        title="Pagamento de Conta a Pagar"
        subtitle={`Documento: ${selectedPayable?.documentNumber} - Fornecedor: ${selectedPayable?.supplierName}`}
        maxWidth="sm"
      >
        {selectedPayable && (
          <form onSubmit={handleConfirmPayment} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Total da Fatura:</span>
                <span className="font-mono font-bold">{formatCurrency(selectedPayable.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Pendente:</span>
                <span className="font-mono font-bold text-rose-600">{formatCurrency(selectedPayable.balance)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Valor a Liquidar (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                max={selectedPayable.balance}
                value={payAmountInput}
                onChange={(e) => setPayAmountInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-base font-mono font-bold dark:bg-slate-800"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPayable(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Confirmar Pagamento
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL NOVA CONTA A PAGAR */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nova Conta a Pagar"
        subtitle="Lançamento de despesa operacional ou fornecedor"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePayable} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fornecedor / Beneficiário *
            </label>
            <select
              value={newSupId}
              onChange={(e) => setNewSupId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Documento (NF / Boleto)
              </label>
              <input
                type="text"
                placeholder="Ex: NF-55201"
                value={newDoc}
                onChange={(e) => setNewDoc(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria
              </label>
              <input
                type="text"
                placeholder="Ex: Mercadorias, Energia, Aluguel"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Vencimento *
              </label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observações
            </label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Salvar Conta a Pagar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

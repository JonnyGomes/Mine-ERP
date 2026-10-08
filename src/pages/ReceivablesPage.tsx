import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AccountReceivable, ReceivableStatus } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import {
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

export const ReceivablesPage: React.FC = () => {
  const { receivables, customers, payReceivable, addReceivable } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal Baixar Parcela
  const [selectedReceivable, setSelectedReceivable] = useState<AccountReceivable | null>(null);
  const [payAmountInput, setPayAmountInput] = useState('');

  // Modal Nova Conta a Receber
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCustId, setNewCustId] = useState(customers[0]?.id || '');
  const [newDoc, setNewDoc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');

  const handleOpenPayment = (rec: AccountReceivable) => {
    setSelectedReceivable(rec);
    setPayAmountInput(rec.balance.toFixed(2));
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable) return;
    const amount = parseFloat(payAmountInput.replace(',', '.')) || 0;
    if (amount <= 0) return;

    payReceivable(selectedReceivable.id, amount);
    setSelectedReceivable(null);
  };

  const handleCreateReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustId) || customers[0];
    const val = parseFloat(newAmount.replace(',', '.')) || 0;
    if (val <= 0) return;

    addReceivable({
      customerId: cust.id,
      customerName: cust.name,
      documentNumber: newDoc || `DOC-${Date.now().toString().slice(-5)}`,
      installmentNumber: 1,
      totalInstallments: 1,
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

  const filtered = receivables.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.customerName.toLowerCase().includes(q) ||
      r.documentNumber.toLowerCase().includes(q) ||
      (r.saleNumber && r.saleNumber.includes(q));
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: ReceivableStatus) => {
    const styles: Record<ReceivableStatus, string> = {
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

  const totalBalance = filtered.reduce((acc, r) => acc + r.balance, 0);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Contas a Receber
          </h1>
          <p className="text-xs text-slate-500">
            Controle de boletos, vendas a prazo, recebimentos parciais e baixas de títulos
          </p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Título a Receber</span>
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
            placeholder="Buscar por cliente, documento ou número da venda..."
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
            Saldo a Receber: <span className="font-mono text-blue-600 dark:text-blue-400 font-bold tabular-nums">{formatCurrency(totalBalance)}</span>
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
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Emissão</th>
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
                    Nenhum título encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {r.documentNumber}
                      {r.saleNumber && <span className="block text-[10px] text-slate-400 font-normal">Venda #{r.saleNumber}</span>}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {r.customerName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {formatDateBR(r.issueDate)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {formatDateBR(r.dueDate)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(r.paidAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(r.balance)}
                    </td>
                    <td className="py-2.5 px-3 text-center">{getStatusBadge(r.status)}</td>
                    <td className="py-2.5 px-3 text-center">
                      {r.balance > 0 ? (
                        <button
                          onClick={() => handleOpenPayment(r)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs"
                          title="Dar baixa / Receber"
                        >
                          Baixar
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Quitado</span>
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

      {/* MODAL BAIXAR PARCELA */}
      <Modal
        isOpen={Boolean(selectedReceivable)}
        onClose={() => setSelectedReceivable(null)}
        title="Baixa de Conta a Receber"
        subtitle={`Documento: ${selectedReceivable?.documentNumber} - Cliente: ${selectedReceivable?.customerName}`}
        maxWidth="sm"
      >
        {selectedReceivable && (
          <form onSubmit={handleConfirmPayment} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Total:</span>
                <span className="font-mono font-bold">{formatCurrency(selectedReceivable.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Atual:</span>
                <span className="font-mono font-bold text-rose-600">{formatCurrency(selectedReceivable.balance)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Valor do Pagamento a Receber (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                max={selectedReceivable.balance}
                value={payAmountInput}
                onChange={(e) => setPayAmountInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-base font-mono font-bold dark:bg-slate-800"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReceivable(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Confirmar Recebimento
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL NOVO TÍTULO */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Novo Título a Receber"
        subtitle="Lançamento manual de conta a receber de cliente"
        maxWidth="md"
      >
        <form onSubmit={handleCreateReceivable} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cliente *
            </label>
            <select
              value={newCustId}
              onChange={(e) => setNewCustId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Documento
              </label>
              <input
                type="text"
                placeholder="Ex: BOL-2026-01"
                value={newDoc}
                onChange={(e) => setNewDoc(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vencimento *
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
              Valor do Título (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono font-bold dark:bg-slate-800"
            />
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
              Salvar Título
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

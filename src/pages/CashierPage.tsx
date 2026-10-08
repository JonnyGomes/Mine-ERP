import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import {
  CircleDollarSign,
  PlusCircle,
  MinusCircle,
  Lock,
  Unlock,
  Printer,
  History,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const CashierPage: React.FC = () => {
  const { cashRegister, openCashier, closeCashier, addCashMovement, auditLogs, openPrintModal } = useApp();
  const { currentUser } = useAuth();

  // Modals
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'SANGRIA' | 'SUPRIMENTO'>('SANGRIA');

  // Form states
  const [initialAmountInput, setInitialAmountInput] = useState('200.00');
  const [openNotes, setOpenNotes] = useState('');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [countedTotalInput, setCountedTotalInput] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  const isCashierOpen = cashRegister?.status === 'ABERTO';

  // Difference in cash closing preview
  const counted = parseFloat(countedTotalInput.replace(',', '.')) || 0;
  const expected = cashRegister?.expectedTotal || 0;
  const diff = counted - expected;

  const handleOpenCashierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(initialAmountInput.replace(',', '.')) || 0;
    openCashier(amount, openNotes);
    setIsOpenModalOpen(false);
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movementAmount.replace(',', '.')) || 0;
    if (amount <= 0 || !movementReason.trim()) return;

    addCashMovement(movementType, amount, movementReason);
    setIsMovementModalOpen(false);
    setMovementAmount('');
    setMovementReason('');
  };

  const handleCloseCashierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashier(counted, closeNotes);
    setIsCloseModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Controle de Caixa
          </h1>
          <p className="text-xs text-slate-500">
            Abertura, suprimentos, sangrias, conferência de turno e fechamento cego
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!isCashierOpen ? (
            <button
              onClick={() => setIsOpenModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Unlock className="w-4 h-4" />
              <span>Abrir Caixa</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setMovementType('SUPRIMENTO');
                  setIsMovementModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 rounded-lg text-xs font-semibold transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Suprimento</span>
              </button>
              <button
                onClick={() => {
                  setMovementType('SANGRIA');
                  setIsMovementModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 rounded-lg text-xs font-semibold transition-colors"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>Sangria</span>
              </button>
              <button
                onClick={() => {
                  setCountedTotalInput(expected.toFixed(2));
                  setIsCloseModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Fechar Caixa</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Caixa Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                isCashierOpen
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
              }`}
            >
              <CircleDollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Status: {isCashierOpen ? 'Caixa Aberto' : 'Caixa Fechado'}
                </h2>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    isCashierOpen
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60'
                  }`}
                >
                  {isCashierOpen ? 'EM OPERAÇÃO' : 'ENCERRADO'}
                </span>
              </div>
              {cashRegister && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Aberto por <strong>{cashRegister.openedByUserName}</strong> em {formatDateBR(cashRegister.openingDate)} às {cashRegister.openingTime}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Saldo em Dinheiro no Caixa
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {formatCurrency(cashRegister?.expectedTotal || 0)}
            </span>
          </div>
        </div>

        {/* Resumo Financeiro do Turno */}
        {cashRegister && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Fundo Inicial</span>
              <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200 tabular-nums">
                {formatCurrency(cashRegister.initialAmount)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Vendas Dinheiro</span>
              <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatCurrency(cashRegister.cashSales)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Vendas PIX</span>
              <span className="font-mono font-bold text-sm text-teal-600 dark:text-teal-400 tabular-nums">
                {formatCurrency(cashRegister.pixSales)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Cartões (D/C)</span>
              <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 tabular-nums">
                {formatCurrency(cashRegister.debitSales + cashRegister.creditSales)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Sangrias (Retiradas)</span>
              <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                -{formatCurrency(cashRegister.bleedAmount)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Suprimentos</span>
              <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400 tabular-nums">
                +{formatCurrency(cashRegister.supplyAmount)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Relatório / Histórico de Fechamento do Caixa */}
      {cashRegister?.status === 'FECHADO' && (
        <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Resumo do Último Fechamento de Caixa
            </span>
            <span className="text-xs text-slate-500">
              Fechado em {formatDateBR(cashRegister.closingDate)} às {cashRegister.closingTime} por {cashRegister.closedByUserName}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
              <span className="text-slate-500 text-[10px]">Total Esperado:</span>
              <div className="font-mono font-bold text-base">{formatCurrency(cashRegister.expectedTotal)}</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
              <span className="text-slate-500 text-[10px]">Total Contado pelo Operador:</span>
              <div className="font-mono font-bold text-base text-blue-600">{formatCurrency(cashRegister.countedTotal)}</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
              <span className="text-slate-500 text-[10px]">Diferença (Sobra / Falta):</span>
              <div
                className={`font-mono font-bold text-base ${
                  (cashRegister.difference || 0) === 0
                    ? 'text-emerald-600'
                    : (cashRegister.difference || 0) > 0
                    ? 'text-blue-600'
                    : 'text-rose-600'
                }`}
              >
                {formatCurrency(cashRegister.difference || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ABRIR CAIXA */}
      <Modal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        title="Abertura de Caixa"
        subtitle="Informe o valor inicial em dinheiro (troco) para iniciar as operações"
        maxWidth="sm"
      >
        <form onSubmit={handleOpenCashierSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Fundo Inicial em Dinheiro (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={initialAmountInput}
              onChange={(e) => setInitialAmountInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-mono font-bold dark:bg-slate-800"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observações
            </label>
            <textarea
              value={openNotes}
              onChange={(e) => setOpenNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Turno da manhã, troco em notas miúdas..."
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsOpenModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Confirmar Abertura
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: SANGRIA / SUPRIMENTO */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title={movementType === 'SANGRIA' ? 'Registrar Sangria (Retirada)' : 'Registrar Suprimento (Aporte)'}
        subtitle={
          movementType === 'SANGRIA'
            ? 'Retirada de dinheiro do caixa para depósito ou despesas'
            : 'Entrada avulsa de dinheiro para reforço de troco'
        }
        maxWidth="sm"
      >
        <form onSubmit={handleMovementSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Valor da {movementType} (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={movementAmount}
              onChange={(e) => setMovementAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-mono font-bold dark:bg-slate-800"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Motivo / Justificativa *
            </label>
            <input
              type="text"
              required
              placeholder={movementType === 'SANGRIA' ? 'Ex: Recolhimento para cofre' : 'Ex: Reforço de moedas'}
              value={movementReason}
              onChange={(e) => setMovementReason(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsMovementModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg text-xs font-semibold shadow-xs ${
                movementType === 'SANGRIA' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Confirmar {movementType}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: FECHAR CAIXA */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Fechamento de Caixa"
        subtitle="Conferência de valores e encerramento do turno"
        maxWidth="md"
      >
        <form onSubmit={handleCloseCashierSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Saldo em Dinheiro Esperado:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(expected)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vendas em Cartão / PIX:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency((cashRegister?.pixSales || 0) + (cashRegister?.debitSales || 0) + (cashRegister?.creditSales || 0))}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Valor em Dinheiro Contado na Gaveta (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={countedTotalInput}
              onChange={(e) => setCountedTotalInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-mono font-bold dark:bg-slate-800"
            />
          </div>

          <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Apuração da Diferença:</span>
            <span
              className={`font-mono font-bold text-sm ${
                diff === 0 ? 'text-emerald-600' : diff > 0 ? 'text-blue-600' : 'text-rose-600'
              }`}
            >
              {diff === 0 ? 'Exato (Sem diferença)' : diff > 0 ? `+${formatCurrency(diff)} (Sobra)` : `${formatCurrency(diff)} (Falta)`}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observações do Fechamento
            </label>
            <textarea
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              rows={2}
              placeholder="Justificativa para eventual diferença ou observação do turno..."
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCloseModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Encerrar e Fechar Caixa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

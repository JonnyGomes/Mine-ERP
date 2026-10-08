import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StockMovementType } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import {
  ArrowLeftRight,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const StockPage: React.FC = () => {
  const { products, stockMovements, recordStockMovement } = useApp();

  const [activeTab, setActiveTab] = useState<'SALDOS' | 'MOVIMENTACOES'>('SALDOS');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modal manual movement
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movProductId, setMovProductId] = useState(products[0]?.id || '');
  const [movType, setMovType] = useState<StockMovementType>('ENTRADA');
  const [movQuantity, setMovQuantity] = useState(1);
  const [movReason, setMovReason] = useState('');
  const [movDoc, setMovDoc] = useState('');

  const handleManualMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (movQuantity <= 0 || !movReason.trim()) return;

    recordStockMovement(movProductId, movQuantity, movType, movReason, movDoc);
    setIsMovementModalOpen(false);
    setMovReason('');
    setMovDoc('');
    setMovQuantity(1);
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q);
  });

  const filteredMovements = stockMovements.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.productName.toLowerCase().includes(q) ||
      (m.documentNumber && m.documentNumber.toLowerCase().includes(q)) ||
      m.userName.toLowerCase().includes(q);
    const matchType = filterType === 'ALL' || m.type === filterType;
    return matchSearch && matchType;
  });

  const getMovementBadge = (type: StockMovementType) => {
    const styles: Record<StockMovementType, string> = {
      ENTRADA: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      SAIDA: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
      VENDA: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
      AJUSTE: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
      CANCELAMENTO: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400',
      DEVOLUCAO: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${styles[type]}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Controle de Estoque & Movimentações
          </h1>
          <p className="text-xs text-slate-500">
            Acompanhamento de posições de estoque, entradas manuais, perdas e auditoria de fluxo
          </p>
        </div>
        <button
          onClick={() => setIsMovementModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Movimentação</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('SALDOS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'SALDOS'
                ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Posição Atual dos Produtos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MOVIMENTACOES')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'MOVIMENTACOES'
                ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Histórico de Movimentações ({stockMovements.length})
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar produto ou documento..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          {activeTab === 'MOVIMENTACOES' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="VENDA">Vendas</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SAIDA">Saídas</option>
              <option value="AJUSTE">Ajustes</option>
              <option value="CANCELAMENTO">Cancelamentos</option>
            </select>
          )}
        </div>
      </div>

      {/* Content based on Tab */}
      {activeTab === 'SALDOS' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Cód</th>
                  <th className="py-2.5 px-3">Produto</th>
                  <th className="py-2.5 px-3">Grupo</th>
                  <th className="py-2.5 px-3 text-right">Estoque Mínimo</th>
                  <th className="py-2.5 px-3 text-right">Estoque Atual</th>
                  <th className="py-2.5 px-3 text-right">Preço Venda</th>
                  <th className="py-2.5 px-3 text-center">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold">{p.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {p.groupName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                        {p.minStock} {p.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                        <span className={isLow ? 'text-rose-600' : 'text-slate-900 dark:text-white'}>
                          {p.currentStock} {p.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {formatCurrency(p.salePrice)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            <span>REPOSIÇÃO</span>
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            NORMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Produto</th>
                  <th className="py-2.5 px-3 text-right">Quantidade</th>
                  <th className="py-2.5 px-3">Documento</th>
                  <th className="py-2.5 px-3">Motivo</th>
                  <th className="py-2.5 px-3">Usuário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {formatDateBR(m.date)} {m.time}
                    </td>
                    <td className="py-2.5 px-3">{getMovementBadge(m.type)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {m.productName}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                      {m.type === 'SAIDA' || m.type === 'VENDA' ? (
                        <span className="text-rose-600">-{m.quantity}</span>
                      ) : (
                        <span className="text-emerald-600">+{m.quantity}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {m.documentNumber || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {m.reason}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {m.userName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR MOVIMENTAÇÃO */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Lançamento Manual de Estoque"
        subtitle="Entrada de compras, avarias, perdas ou ajustes de balanço"
        maxWidth="md"
      >
        <form onSubmit={handleManualMovementSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Produto *
            </label>
            <select
              value={movProductId}
              onChange={(e) => setMovProductId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} (Atual: {p.currentStock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Movimentação *
              </label>
              <select
                value={movType}
                onChange={(e) => setMovType(e.target.value as StockMovementType)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              >
                <option value="ENTRADA">Entrada (+)</option>
                <option value="SAIDA">Saída (-)</option>
                <option value="AJUSTE">Ajuste de Balanço (=)</option>
                <option value="DEVOLUCAO">Devolução (+)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantidade *
              </label>
              <input
                type="number"
                min="1"
                required
                value={movQuantity}
                onChange={(e) => setMovQuantity(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Documento de Referência
            </label>
            <input
              type="text"
              placeholder="Ex: NF-12345, Inventário 01"
              value={movDoc}
              onChange={(e) => setMovDoc(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Motivo / Justificativa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Entrada por nota fiscal de compra, Avaria em estoque..."
              value={movReason}
              onChange={(e) => setMovReason(e.target.value)}
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Confirmar Movimentação
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

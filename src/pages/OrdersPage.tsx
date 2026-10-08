import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, SaleItem } from '../types';
import { formatCurrency, formatDateBR, formatCpfCnpj } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Eye,
  ShoppingCart,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, customers, products, createOrder, updateOrderStatus, convertOrderToSale, openPrintModal } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // New Order Form
  const [orderCustomerId, setOrderCustomerId] = useState<string>(customers[0]?.id || '');
  const [orderItems, setOrderItems] = useState<SaleItem[]>([]);
  const [orderPaymentExpected, setOrderPaymentExpected] = useState<string>('PIX');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [orderDiscount, setOrderDiscount] = useState<number>(0);

  // Product selector inside order
  const [selectedProdId, setSelectedProdId] = useState<string>(products[0]?.id || '');
  const [selectedProdQty, setSelectedProdQty] = useState<number>(1);

  const handleAddItemToOrder = () => {
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    const newItem: SaleItem = {
      id: 'ord_it_' + Date.now(),
      productId: prod.id,
      code: prod.code,
      barcode: prod.barcode,
      name: prod.name,
      unit: prod.unit,
      quantity: selectedProdQty,
      unitPrice: prod.salePrice,
      discount: 0,
      total: prod.salePrice * selectedProdQty,
    };

    setOrderItems((prev) => [...prev, newItem]);
    setSelectedProdQty(1);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) return;

    const cust = customers.find((c) => c.id === orderCustomerId) || customers[0];

    createOrder({
      customerId: cust.id,
      customerName: cust.name,
      customerDocument: cust.document,
      items: orderItems,
      discount: orderDiscount,
      addition: 0,
      paymentMethodExpected: orderPaymentExpected,
      notes: orderNotes,
      status: 'ABERTO',
    });

    setIsNewOrderModalOpen(false);
    setOrderItems([]);
    setOrderDiscount(0);
    setOrderNotes('');
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      o.number.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.sellerName && o.sellerName.toLowerCase().includes(q));
    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      RASCUNHO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      ABERTO: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
      EM_PROCESSAMENTO: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      SEPARACAO: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
      FINALIZADO: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      CANCELADO: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pedidos de Venda
          </h1>
          <p className="text-xs text-slate-500">
            Controle de pedidos comerciais, orçamentos, separação e conversão em venda
          </p>
        </div>
        <button
          onClick={() => {
            setOrderItems([]);
            setIsNewOrderModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Pedido</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número do pedido, cliente ou vendedor..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
        >
          <option value="ALL">Todos os Status</option>
          <option value="ABERTO">Aberto</option>
          <option value="SEPARACAO">Separação</option>
          <option value="EM_PROCESSAMENTO">Em Processamento</option>
          <option value="FINALIZADO">Finalizado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Nº Pedido</th>
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Vendedor</th>
                <th className="py-2.5 px-3 text-right">Itens</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      #{o.number}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      <div>{formatDateBR(o.date)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{o.time}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {o.customerName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {o.sellerName}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                      {o.items.length} un.
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">{getStatusBadge(o.status)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Imprimir */}
                        <button
                          onClick={() => openPrintModal(o, 'order')}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded"
                          title="Imprimir Pedido (A4 / Térmico)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Visualizar / Detalhes */}
                        <button
                          onClick={() => setViewingOrder(o)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded"
                          title="Detalhes do Pedido"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Faturar / Converter em Venda se não finalizado */}
                        {o.status !== 'FINALIZADO' && o.status !== 'CANCELADO' && (
                          <button
                            onClick={() => convertOrderToSale(o.id)}
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            title="Faturar e Converter em Venda"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Faturar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALHES DO PEDIDO */}
      <Modal
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        title={`Pedido de Venda nº ${viewingOrder?.number}`}
        subtitle={`Cliente: ${viewingOrder?.customerName} &bull; Emissão: ${formatDateBR(viewingOrder?.date)} ${viewingOrder?.time}`}
        maxWidth="3xl"
      >
        {viewingOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Situação Atual:</span>
                <div className="mt-0.5">{getStatusBadge(viewingOrder.status)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Alterar Status:</span>
                <select
                  value={viewingOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(viewingOrder.id, e.target.value as OrderStatus);
                    setViewingOrder({ ...viewingOrder, status: e.target.value as OrderStatus });
                  }}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                >
                  <option value="ABERTO">Aberto</option>
                  <option value="SEPARACAO">Separação</option>
                  <option value="EM_PROCESSAMENTO">Em Processamento</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Itens do Pedido ({viewingOrder.items.length})
              </span>
              <table className="w-full text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="py-1.5 px-2 text-left">Produto</th>
                    <th className="py-1.5 px-2 text-right">Qtd</th>
                    <th className="py-1.5 px-2 text-right">Unitário</th>
                    <th className="py-1.5 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {viewingOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-2 font-medium">{it.name}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{it.quantity} {it.unit}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold">{formatCurrency(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500">
                Pagamento previsto: <strong className="text-slate-800 dark:text-white">{viewingOrder.paymentMethodExpected}</strong>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">TOTAL: </span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {formatCurrency(viewingOrder.total)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => openPrintModal(viewingOrder, 'order')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir (A4 / 80mm / 58mm)</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL NOVO PEDIDO */}
      <Modal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        title="Novo Pedido de Venda"
        subtitle="Adicione produtos e defina o cliente do pedido"
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveOrder} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cliente *
              </label>
              <select
                value={orderCustomerId}
                onChange={(e) => setOrderCustomerId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.document ? `(${formatCpfCnpj(c.document)})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Forma de Pagamento Prevista
              </label>
              <select
                value={orderPaymentExpected}
                onChange={(e) => setOrderPaymentExpected(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              >
                <option value="DINHEIRO">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="BOLETO">Boleto Bancário</option>
              </select>
            </div>
          </div>

          {/* Adicionar Produto ao Pedido */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Adicionar Produto ao Pedido
            </span>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] text-slate-500 mb-1">Produto</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatCurrency(p.salePrice)} (Estoque: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-[11px] text-slate-500 mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={selectedProdQty}
                  onChange={(e) => setSelectedProdQty(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono dark:bg-slate-800"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItemToOrder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                + Adicionar Item
              </button>
            </div>
          </div>

          {/* Tabela de Itens Adicionados */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Itens do Pedido ({orderItems.length})
            </span>
            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-1.5 px-3 text-left">Item</th>
                    <th className="py-1.5 px-3 text-right">Qtd</th>
                    <th className="py-1.5 px-3 text-right">Unitário</th>
                    <th className="py-1.5 px-3 text-right">Total</th>
                    <th className="py-1.5 px-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orderItems.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 font-semibold">{it.name}</td>
                      <td className="py-1.5 px-3 text-right font-mono">{it.quantity}</td>
                      <td className="py-1.5 px-3 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold">{formatCurrency(it.total)}</td>
                      <td className="py-1.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewOrderModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={orderItems.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
            >
              Gerar Pedido
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

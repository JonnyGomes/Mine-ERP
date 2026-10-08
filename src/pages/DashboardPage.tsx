import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { formatCurrency } from '../utils/formatters';
import {
  DollarSign,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  CreditCard,
  Receipt,
  AlertTriangle,
  Users,
  ShoppingCart,
  UserPlus,
  PackagePlus,
  FilePlus,
  CircleDollarSign,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (module: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { sales, orders, products, customers, receivables, payables, cashRegister } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const todaySales = sales.filter((s) => s.status === 'FINALIZADA' && s.date === todayStr);
  const totalSalesToday = todaySales.reduce((acc, s) => acc + s.total, 0);

  const monthSales = sales.filter((s) => s.status === 'FINALIZADA');
  const totalSalesMonth = monthSales.reduce((acc, s) => acc + s.total, 0);

  const todayOrders = orders.filter((o) => o.date === todayStr);
  const averageTicket = monthSales.length > 0 ? totalSalesMonth / monthSales.length : 0;

  const totalReceivablesPending = receivables
    .filter((r) => r.status === 'PENDENTE' || r.status === 'PARCIAL' || r.status === 'VENCIDO')
    .reduce((acc, r) => acc + r.balance, 0);

  const totalPayablesPending = payables
    .filter((p) => p.status === 'PENDENTE' || p.status === 'PARCIAL' || p.status === 'VENCIDO')
    .reduce((acc, p) => acc + p.balance, 0);

  const lowStockProducts = products.filter((p) => p.active && p.currentStock <= p.minStock);
  const activeCustomers = customers.filter((c) => c.status === 'ATIVO' && c.id !== 'cust_consumer');

  // Breakdown of sales by payment method
  const paymentsByMethod: Record<string, number> = {};
  sales.forEach((s) => {
    if (s.status === 'FINALIZADA') {
      s.payments.forEach((p) => {
        paymentsByMethod[p.method] = (paymentsByMethod[p.method] || 0) + p.amount;
      });
    }
  });

  // Top products
  const productQuantities: Record<string, { name: string; qty: number; revenue: number }> = {};
  sales.forEach((s) => {
    if (s.status === 'FINALIZADA') {
      s.items.forEach((it) => {
        if (!productQuantities[it.productId]) {
          productQuantities[it.productId] = { name: it.name, qty: 0, revenue: 0 };
        }
        productQuantities[it.productId].qty += it.quantity;
        productQuantities[it.productId].revenue += it.total;
      });
    }
  });
  const topProducts = Object.values(productQuantities).sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Painel Gerencial
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visão consolidada de vendas, faturamento, financeiro e estoque
          </p>
        </div>

        {/* Quick Shortcut Buttons (Requirement 4) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('pdv')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Nova Venda (PDV)</span>
          </button>
          <button
            onClick={() => onNavigate('pedidos')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Novo Pedido</span>
          </button>
          <button
            onClick={() => onNavigate('clientes')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Novo Cliente</span>
          </button>
          <button
            onClick={() => onNavigate('caixa')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <CircleDollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>{cashRegister?.status === 'ABERTO' ? 'Fechar Caixa' : 'Abrir Caixa'}</span>
          </button>
        </div>
      </div>

      {/* Grid de Indicadores (Requirement 4) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Vendas do Dia"
          value={formatCurrency(totalSalesToday)}
          subtitle={`${todaySales.length} venda(s) hoje`}
          icon={DollarSign}
          variant="success"
          onClick={() => onNavigate('relatorios')}
        />
        <StatCard
          title="Vendas do Mês"
          value={formatCurrency(totalSalesMonth)}
          subtitle={`${monthSales.length} vendas finalizadas`}
          icon={Calendar}
          variant="info"
          onClick={() => onNavigate('relatorios')}
        />
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(averageTicket)}
          subtitle="Média por cupom emitido"
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Pedidos do Dia"
          value={todayOrders.length}
          subtitle="Orçamentos e pedidos"
          icon={FileSpreadsheet}
          variant="default"
          onClick={() => onNavigate('pedidos')}
        />
        <StatCard
          title="Contas a Receber"
          value={formatCurrency(totalReceivablesPending)}
          subtitle="Previsão de recebíveis"
          icon={CreditCard}
          variant="info"
          onClick={() => onNavigate('contas_receber')}
        />
        <StatCard
          title="Contas a Pagar"
          value={formatCurrency(totalPayablesPending)}
          subtitle="Compromissos pendentes"
          icon={Receipt}
          variant="warning"
          onClick={() => onNavigate('contas_pagar')}
        />
        <StatCard
          title="Estoque Baixo"
          value={lowStockProducts.length}
          subtitle="Abaixo do limite mínimo"
          icon={AlertTriangle}
          variant={lowStockProducts.length > 0 ? 'danger' : 'default'}
          onClick={() => onNavigate('estoque')}
        />
        <StatCard
          title="Clientes Ativos"
          value={activeCustomers.length}
          subtitle="Base cadastrada"
          icon={Users}
          variant="default"
          onClick={() => onNavigate('clientes')}
        />
      </div>

      {/* Gráficos e Tabelas Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico 1: Produtos Mais Vendidos */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ranking: Produtos Mais Vendidos
              </h2>
              <p className="text-xs text-slate-500">Classificação por volume de saída</p>
            </div>
            <button
              onClick={() => onNavigate('produtos')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Ver catálogo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhuma venda registrada ainda.</p>
            ) : (
              topProducts.map((p, idx) => {
                const maxQty = topProducts[0]?.qty || 1;
                const percent = Math.round((p.qty / maxQty) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {idx + 1}. {p.name}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {p.qty} un. ({formatCurrency(p.revenue)})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gráfico 2: Vendas por Forma de Pagamento */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Vendas por Pagamento
            </h2>
            <p className="text-xs text-slate-500">Distribuição financeira</p>
          </div>

          <div className="space-y-3">
            {Object.entries(paymentsByMethod).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhum pagamento registrado.</p>
            ) : (
              Object.entries(paymentsByMethod).map(([method, amount], idx) => {
                const totalAll = Object.values(paymentsByMethod).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((amount / totalAll) * 100);
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{method}</span>
                      <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Participação</span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Alerta de Produtos com Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Alerta de Reposição de Estoque ({lowStockProducts.length} itens)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigate('estoque')}
                className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-rose-200 dark:border-rose-900/60 text-xs flex justify-between items-center cursor-pointer hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Cód: {p.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-600 font-mono tabular-nums">
                    {p.currentStock} {p.unit}
                  </div>
                  <div className="text-[10px] text-slate-400">Mín: {p.minStock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

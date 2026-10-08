import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { sales, products, receivables, payables } = useApp();

  const [activeReport, setActiveReport] = useState<'VENDAS' | 'PRODUTOS' | 'ESTOQUE' | 'FINANCEIRO'>('VENDAS');
  const [filterStartDate, setFilterStartDate] = useState('2026-10-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-10-31');

  // Filtered sales
  const filteredSales = sales.filter(
    (s) => s.status === 'FINALIZADA' && s.date >= filterStartDate && s.date <= filterEndDate
  );

  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalSalesDiscount = filteredSales.reduce((acc, s) => acc + s.discount, 0);
  const averageTicket = filteredSales.length > 0 ? totalSalesRevenue / filteredSales.length : 0;

  // Products report
  const productSalesMap: Record<string, { code: string; name: string; qty: number; revenue: number }> = {};
  filteredSales.forEach((s) => {
    s.items.forEach((it) => {
      if (!productSalesMap[it.productId]) {
        productSalesMap[it.productId] = { code: it.code, name: it.name, qty: 0, revenue: 0 };
      }
      productSalesMap[it.productId].qty += it.quantity;
      productSalesMap[it.productId].revenue += it.total;
    });
  });
  const productsReport = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);

  // Financial summary
  const totalReceivables = receivables.reduce((acc, r) => acc + r.paidAmount, 0);
  const totalPendingReceivables = receivables
    .filter((r) => r.status === 'PENDENTE' || r.status === 'VENCIDO')
    .reduce((acc, r) => acc + r.balance, 0);
  const totalPayables = payables.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalPendingPayables = payables
    .filter((p) => p.status === 'PENDENTE' || p.status === 'VENCIDO')
    .reduce((acc, p) => acc + p.balance, 0);

  // CSV Export helper
  const exportToCSV = () => {
    let rows: string[][] = [];
    let filename = `relatorio_${activeReport.toLowerCase()}_${filterStartDate}_a_${filterEndDate}.csv`;

    if (activeReport === 'VENDAS') {
      rows.push(['Numero', 'Data', 'Hora', 'Cliente', 'Operador', 'Subtotal', 'Desconto', 'Total']);
      filteredSales.forEach((s) => {
        rows.push([s.number, s.date, s.time, s.customerName, s.sellerName, s.subtotal.toFixed(2), s.discount.toFixed(2), s.total.toFixed(2)]);
      });
    } else if (activeReport === 'PRODUTOS') {
      rows.push(['Codigo', 'Produto', 'Quantidade Vendida', 'Receita Total']);
      productsReport.forEach((p) => {
        rows.push([p.code, p.name, String(p.qty), p.revenue.toFixed(2)]);
      });
    } else if (activeReport === 'ESTOQUE') {
      rows.push(['Codigo', 'Produto', 'Grupo', 'Estoque Atual', 'Estoque Minimo', 'Preco Venda', 'Situacao']);
      products.forEach((p) => {
        rows.push([p.code, p.name, p.groupName, String(p.currentStock), String(p.minStock), p.salePrice.toFixed(2), p.currentStock <= p.minStock ? 'Baixo' : 'Normal']);
      });
    } else {
      rows.push(['Tipo', 'Descricao', 'Valor']);
      rows.push(['Receitas Realizadas', 'Vendas e Recebimentos', totalSalesRevenue.toFixed(2)]);
      rows.push(['Contas a Receber Pendentes', 'Títulos em aberto', totalPendingReceivables.toFixed(2)]);
      rows.push(['Despesas Pagas', 'Contas pagas', totalPayables.toFixed(2)]);
      rows.push(['Contas a Pagar Pendentes', 'Compromissos', totalPendingPayables.toFixed(2)]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Relatórios Gerenciais
          </h1>
          <p className="text-xs text-slate-500">
            Análise detalhada de faturamento, vendas por produto, curva de estoque e fluxo financeiro
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs and Date Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {[
            { id: 'VENDAS', label: 'Vendas' },
            { id: 'PRODUTOS', label: 'Produtos Vendidos' },
            { id: 'ESTOQUE', label: 'Posição Estoque' },
            { id: 'FINANCEIRO', label: 'DRE / Financeiro' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeReport === tab.id
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Período:</span>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          />
          <span className="text-slate-400">até</span>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* REPORT 1: VENDAS */}
      {activeReport === 'VENDAS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-slate-500 text-[10px] font-bold uppercase">Volume de Vendas</span>
              <div className="text-xl font-bold font-mono mt-1 text-slate-900 dark:text-white">
                {filteredSales.length} cupom(ns)
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-slate-500 text-[10px] font-bold uppercase">Faturamento Bruto</span>
              <div className="text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(totalSalesRevenue)}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-slate-500 text-[10px] font-bold uppercase">Total em Descontos</span>
              <div className="text-xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400 tabular-nums">
                {formatCurrency(totalSalesDiscount)}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-slate-500 text-[10px] font-bold uppercase">Ticket Médio</span>
              <div className="text-xl font-bold font-mono mt-1 text-blue-600 dark:text-blue-400 tabular-nums">
                {formatCurrency(averageTicket)}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Cupom</th>
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Operador</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">Desconto</th>
                  <th className="py-2.5 px-3 text-right">Total Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono font-bold text-blue-600">#{s.number}</td>
                    <td className="py-2 px-3 font-mono">{formatDateBR(s.date)} {s.time}</td>
                    <td className="py-2 px-3 font-semibold">{s.customerName}</td>
                    <td className="py-2 px-3">{s.sellerName}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(s.subtotal)}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-600">
                      {s.discount > 0 ? `-${formatCurrency(s.discount)}` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{formatCurrency(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: PRODUTOS */}
      {activeReport === 'PRODUTOS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Cód</th>
                <th className="py-2.5 px-3">Produto</th>
                <th className="py-2.5 px-3 text-right">Quantidade Vendida</th>
                <th className="py-2.5 px-3 text-right">Faturamento Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {productsReport.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Nenhuma venda registrada no período selecionado.
                  </td>
                </tr>
              ) : (
                productsReport.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono font-bold">{p.code}</td>
                    <td className="py-2 px-3 font-semibold">{p.name}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{p.qty} un.</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                      {formatCurrency(p.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 3: ESTOQUE */}
      {activeReport === 'ESTOQUE' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Cód</th>
                <th className="py-2.5 px-3">Produto</th>
                <th className="py-2.5 px-3">Grupo</th>
                <th className="py-2.5 px-3 text-right">Estoque Mínimo</th>
                <th className="py-2.5 px-3 text-right">Estoque Atual</th>
                <th className="py-2.5 px-3 text-right">Preço Venda</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((p) => {
                const isLow = p.currentStock <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono font-bold">{p.code}</td>
                    <td className="py-2 px-3 font-semibold">{p.name}</td>
                    <td className="py-2 px-3">{p.groupName}</td>
                    <td className="py-2 px-3 text-right font-mono">{p.minStock} {p.unit}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      <span className={isLow ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}>
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(p.salePrice)}</td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isLow ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isLow ? 'REPOSIÇÃO' : 'ADEQUADO'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 4: FINANCEIRO / DRE */}
      {activeReport === 'FINANCEIRO' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Demonstrativo Financeiro Simplificado (DRE)
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">(+) Receitas de Vendas Realizadas:</span>
              <span className="font-mono font-bold text-emerald-600">{formatCurrency(totalSalesRevenue)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">(+) Títulos a Receber Pendentes:</span>
              <span className="font-mono font-bold text-blue-600">{formatCurrency(totalPendingReceivables)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">(-) Despesas e Contas Pagas:</span>
              <span className="font-mono font-bold text-rose-600">-{formatCurrency(totalPayables)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">(-) Contas a Pagar Pendentes:</span>
              <span className="font-mono font-bold text-rose-600">-{formatCurrency(totalPendingPayables)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-black dark:border-white text-sm font-bold">
              <span>(=) SALDO OPERACIONAL PREVISTO:</span>
              <span className="font-mono text-base text-emerald-600">
                {formatCurrency(totalSalesRevenue + totalPendingReceivables - totalPayables - totalPendingPayables)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

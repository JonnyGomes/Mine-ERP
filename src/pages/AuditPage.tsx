import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateBR } from '../utils/formatters';
import {
  History,
  Search,
  ShieldCheck,
  Calendar,
  User,
  Filter,
} from 'lucide-react';

export const AuditPage: React.FC = () => {
  const { auditLogs } = useApp();

  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filtered = auditLogs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      (l.entity && l.entity.toLowerCase().includes(q));
    const matchAction = filterAction === 'ALL' || l.action.includes(filterAction);
    return matchSearch && matchAction;
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Auditoria & Registro de Operações
          </h1>
          <p className="text-xs text-slate-500">
            Trilha de auditoria em tempo real para conformidade, segurança e controle gerencial
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por operador, ação ou detalhes do evento..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
        >
          <option value="ALL">Todas as Ações</option>
          <option value="VENDA">Vendas</option>
          <option value="CAIXA">Caixa (Abertura/Fechamento)</option>
          <option value="PREÇO">Alteração de Preço</option>
          <option value="CANCELAMENTO">Cancelamentos</option>
          <option value="PRODUTO">Produtos</option>
          <option value="CLIENTE">Clientes</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Usuário</th>
                <th className="py-2.5 px-3">Ação Realizada</th>
                <th className="py-2.5 px-3">Entidade</th>
                <th className="py-2.5 px-3">Detalhes da Operação</th>
                <th className="py-2.5 px-3">Valores (Antes &rarr; Depois)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatDateBR(l.date)} {l.time}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {l.userName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {l.entity}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {l.details}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {l.oldValue && l.newValue ? (
                        <span>
                          <span className="line-through text-rose-500 mr-1">{l.oldValue}</span>
                          &rarr;
                          <span className="text-emerald-600 font-bold ml-1">{l.newValue}</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

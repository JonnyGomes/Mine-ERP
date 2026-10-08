import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole, PermissionKey } from '../types';
import { Modal } from '../components/common/Modal';
import {
  ShieldCheck,
  UserPlus,
  Key,
  CheckCircle2,
  XCircle,
  User as UserIcon,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, currentUser, switchUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const ALL_PERMISSIONS: { key: PermissionKey; label: string }[] = [
    { key: 'view_product', label: 'Visualizar Produtos' },
    { key: 'edit_product', label: 'Criar e Editar Produtos' },
    { key: 'delete_product', label: 'Excluir Produtos' },
    { key: 'change_price', label: 'Alterar Preço no PDV' },
    { key: 'give_discount', label: 'Conceder Desconto na Venda' },
    { key: 'cancel_sale', label: 'Cancelar Venda Finalizada' },
    { key: 'open_cashier', label: 'Abrir Caixa' },
    { key: 'close_cashier', label: 'Fechar Caixa' },
    { key: 'view_finance', label: 'Consultar Financeiro e Relatórios' },
    { key: 'delete_order', label: 'Excluir Pedidos' },
    { key: 'manage_users', label: 'Gerenciar Usuários e Permissões' },
    { key: 'manage_stock', label: 'Lançar Ajustes Manuais de Estoque' },
  ];

  const getRoleBadge = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      ADMINISTRADOR: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
      GERENTE: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
      VENDEDOR: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
      CAIXA: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      ESTOQUISTA: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${colors[role]}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Usuários & Permissões
          </h1>
          <p className="text-xs text-slate-500">
            Controle de acesso baseado em funções (RBAC), operadores e privilégios do sistema
          </p>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map((u) => {
          const isCurrent = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                    {u.name.charAt(0)}
                  </div>
                  {getRoleBadge(u.role)}
                </div>

                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {u.name}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Login: @{u.login}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {u.email}
                </div>

                {/* Status and Permissions Summary */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <span>Permissões: </span>
                  <strong className="text-slate-700 dark:text-slate-300">
                    {u.role === 'ADMINISTRADOR' ? 'Acesso Total (Root)' : `${u.permissions.length} módulos`}
                  </strong>
                </div>
              </div>

              <div className="mt-4 pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(u)}
                  className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Permissões
                </button>
                <button
                  type="button"
                  onClick={() => switchUser(u.id)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCurrent ? 'Ativo' : 'Alternar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DETALHE DE PERMISSÕES */}
      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={`Permissões de ${selectedUser?.name}`}
        subtitle={`Perfil: ${selectedUser?.role} - Visualização dos privilégios`}
        maxWidth="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ALL_PERMISSIONS.map((p) => {
                const hasPerm =
                  selectedUser.role === 'ADMINISTRADOR' ||
                  selectedUser.permissions.includes(p.key);

                return (
                  <div
                    key={p.key}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      hasPerm
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-850 dark:border-slate-800'
                    }`}
                  >
                    <span className="font-medium">{p.label}</span>
                    {hasPerm ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  FileSpreadsheet,
  Users,
  Package,
  Layers,
  Truck,
  ArrowLeftRight,
  TrendingUp,
  Receipt,
  CircleDollarSign,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Building2,
  Settings,
  History,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onNavigate: (module: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    comercial: true,
    estoque: true,
    financeiro: true,
    relatorios: false,
    administracao: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNav = (mod: string) => {
    onNavigate(mod);
    if (onCloseMobile) onCloseMobile();
  };

  const navItemClass = (id: string) =>
    `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      currentModule === id
        ? 'bg-blue-600 text-white font-semibold shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
    }`;

  const sectionHeaderClass =
    'flex items-center justify-between w-full px-3 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Area */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              JG
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                JG_IERP
              </div>
              <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                Mini IERP Gerencial & PDV
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Dashboard */}
          <div>
            <button
              onClick={() => handleNav('dashboard')}
              className={navItemClass('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>DASHBOARD</span>
            </button>
          </div>

          {/* COMERCIAL */}
          <div className="space-y-1">
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('comercial')}
            >
              <span>COMERCIAL</span>
              {openSections.comercial ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
            {openSections.comercial && (
              <div className="space-y-0.5 pl-1">
                <button
                  onClick={() => handleNav('pdv')}
                  className={`${navItemClass('pdv')} ${
                    currentModule === 'pdv' ? '' : 'text-blue-600 dark:text-blue-400 font-semibold'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>PDV (Ponto de Venda)</span>
                </button>
                <button
                  onClick={() => handleNav('pedidos')}
                  className={navItemClass('pedidos')}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Pedidos de Venda</span>
                </button>
                <button
                  onClick={() => handleNav('clientes')}
                  className={navItemClass('clientes')}
                >
                  <Users className="w-4 h-4" />
                  <span>Clientes</span>
                </button>
              </div>
            )}
          </div>

          {/* ESTOQUE */}
          <div className="space-y-1">
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('estoque')}
            >
              <span>ESTOQUE</span>
              {openSections.estoque ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
            {openSections.estoque && (
              <div className="space-y-0.5 pl-1">
                <button
                  onClick={() => handleNav('produtos')}
                  className={navItemClass('produtos')}
                >
                  <Package className="w-4 h-4" />
                  <span>Produtos (Itens)</span>
                </button>
                <button
                  onClick={() => handleNav('grupos')}
                  className={navItemClass('grupos')}
                >
                  <Layers className="w-4 h-4" />
                  <span>Grupos & Subgrupos</span>
                </button>
                <button
                  onClick={() => handleNav('fornecedores')}
                  className={navItemClass('fornecedores')}
                >
                  <Truck className="w-4 h-4" />
                  <span>Fornecedores</span>
                </button>
                <button
                  onClick={() => handleNav('estoque')}
                  className={navItemClass('estoque')}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Controle & Movimentações</span>
                </button>
              </div>
            )}
          </div>

          {/* FINANCEIRO */}
          <div className="space-y-1">
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('financeiro')}
            >
              <span>FINANCEIRO</span>
              {openSections.financeiro ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
            {openSections.financeiro && (
              <div className="space-y-0.5 pl-1">
                <button
                  onClick={() => handleNav('caixa')}
                  className={navItemClass('caixa')}
                >
                  <CircleDollarSign className="w-4 h-4" />
                  <span>Controle de Caixa</span>
                </button>
                <button
                  onClick={() => handleNav('contas_receber')}
                  className={navItemClass('contas_receber')}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Contas a Receber</span>
                </button>
                <button
                  onClick={() => handleNav('contas_pagar')}
                  className={navItemClass('contas_pagar')}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Contas a Pagar</span>
                </button>
              </div>
            )}
          </div>

          {/* RELATÓRIOS */}
          <div className="space-y-1">
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('relatorios')}
            >
              <span>RELATÓRIOS</span>
              {openSections.relatorios ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
            {openSections.relatorios && (
              <div className="space-y-0.5 pl-1">
                <button
                  onClick={() => handleNav('relatorios')}
                  className={navItemClass('relatorios')}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Relatórios Gerenciais</span>
                </button>
              </div>
            )}
          </div>

          {/* ADMINISTRAÇÃO */}
          <div className="space-y-1">
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('administracao')}
            >
              <span>ADMINISTRAÇÃO</span>
              {openSections.administracao ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
            {openSections.administracao && (
              <div className="space-y-0.5 pl-1">
                <button
                  onClick={() => handleNav('usuarios')}
                  className={navItemClass('usuarios')}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Usuários & Permissões</span>
                </button>
                <button
                  onClick={() => handleNav('auditoria')}
                  className={navItemClass('auditoria')}
                >
                  <History className="w-4 h-4" />
                  <span>Auditoria & Logs</span>
                </button>
                <button
                  onClick={() => handleNav('configuracoes')}
                  className={navItemClass('configuracoes')}
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações & Empresa</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Versão 1.0</span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
            ESTÁVEL
          </span>
        </div>
      </aside>
    </>
  );
};

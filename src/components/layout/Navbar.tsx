import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  Moon,
  ShoppingCart,
  CircleDollarSign,
  UserCheck,
  Maximize2,
  Minimize2,
  Menu,
  LogOut,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface NavbarProps {
  currentModule: string;
  onNavigate: (module: string) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  onNavigate,
  onToggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { cashRegister } = useApp();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const isCashierOpen = cashRegister?.status === 'ABERTO';

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between gap-4 z-30 shrink-0 no-print">
      {/* Zone 1: Brand & Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-900 dark:text-white tracking-tight">
            JG_IERP
          </span>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {currentModule.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Zone 2: Status & Quick Action (Cash Register & PDV shortcut) */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Cash Register Indicator */}
        <button
          onClick={() => onNavigate('caixa')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            isCashierOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
          }`}
          title="Clique para gerenciar o caixa"
        >
          <CircleDollarSign className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Caixa:</span>
          <span className="font-bold">{isCashierOpen ? 'Aberto' : 'Fechado'}</span>
          {isCashierOpen && (
            <span className="font-mono tabular-nums ml-1 hidden md:inline">
              ({formatCurrency(cashRegister?.expectedTotal || 0)})
            </span>
          )}
        </button>

        {/* PDV Primary CTA button if not already in PDV */}
        {currentModule !== 'pdv' && (
          <button
            onClick={() => onNavigate('pdv')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Abrir PDV (F2)</span>
          </button>
        )}
      </div>

      {/* Zone 3: User Badge & Theme & Logout */}
      <div className="flex items-center gap-2">
        {/* User Info Badge */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
            {user?.name || 'Administrador'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
            (@{user?.username || 'admin'})
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
          title="Tela Cheia"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Botão Sair (Logout) */}
        <button
          onClick={() => logout()}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer"
          title="Sair do sistema (Logout)"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};

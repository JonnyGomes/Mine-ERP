import React from 'react';
import { LoginForm } from './LoginForm';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Package,
  CircleDollarSign,
  BarChart3,
  Sun,
  Moon,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 select-none overflow-x-hidden">
      {/* Botão de Alternância de Tema Flutuante (Canto Superior Direito) */}
      <div className="absolute top-4 right-4 z-30">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-xs transition-all hover:scale-105 active:scale-95"
          title={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
          aria-label="Alternar tema de cores"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>
      </div>

      {/* ========================================================
          LADO ESQUERDO: ÁREA INSTITUCIONAL DO SISTEMA
          (Visível em Desktop/Notebook, reduzida em Tablet, oculta em Celular)
          ======================================================== */}
      <section className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 xl:p-14 flex-col justify-between overflow-hidden">
        {/* Elementos Gráficos Discretos no Fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(37,99,235,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Topo Institucional: Marca e Subtítulo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white leading-none block">
                Mini IERP
              </span>
              <span className="text-[11px] font-medium text-blue-300 tracking-wider uppercase block mt-0.5">
                Gestão empresarial inteligente
              </span>
            </div>
          </div>
        </div>

        {/* Centro Institucional: Proposta de Valor e Ilustração Abstrata de ERP */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-xl">
          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Gestão ágil para acelerar o crescimento do seu negócio.
            </h1>
            <p className="text-sm xl:text-base text-slate-300/90 leading-relaxed font-normal">
              Controle suas vendas, estoque, financeiro e sua operação em um único sistema.
            </p>
          </div>

          {/* Indicadores Visuais de Recursos */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: 'PDV rápido', icon: TrendingUp },
              { label: 'Controle de estoque', icon: Package },
              { label: 'Gestão financeira', icon: CircleDollarSign },
              { label: 'Relatórios gerenciais', icon: BarChart3 },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 hover:bg-white/[0.09] transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Ilustração Abstrata Exclusiva de ERP / Dashboards / Gráficos */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-tr from-slate-900/90 to-blue-950/60 border border-white/10 shadow-2xl backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Operação em Tempo Real
              </span>
              <span className="text-[10px] font-mono text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">
                Sincronizado
              </span>
            </div>

            {/* Mock gráfico abstrato vetorial */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Vendas Hoje</span>
                <div className="text-base font-bold font-mono text-emerald-400">R$ 4.850</div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-3/4 rounded-full" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Itens no PDV</span>
                <div className="text-base font-bold font-mono text-blue-300">128 un.</div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 w-5/6 rounded-full" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Disponibilidade</span>
                <div className="text-base font-bold font-mono text-indigo-300">99.9%</div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Institucional */}
        <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-slate-400/80">
          <span>Segurança bancária e criptografia de ponta a ponta</span>
          <span className="font-mono text-[11px]">Plataforma Segura</span>
        </div>
      </section>

      {/* ========================================================
          LADO DIREITO: CARD CENTRAL DE AUTENTICAÇÃO
          ======================================================== */}
      <main className="w-full lg:w-1/2 xl:w-5/12 flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Topo Mobile: Marca quando em tela menor */}
        <div className="flex items-center justify-between lg:hidden pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 dark:text-white leading-tight block">
                Mini IERP Gerencial
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                Gestão empresarial inteligente
              </span>
            </div>
          </div>
        </div>

        {/* Card Central */}
        <div className="my-auto w-full max-w-md mx-auto py-4">
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-3">
            {/* Cabeçalho do Card */}
            <div className="text-center sm:text-left mb-6 space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 mb-1">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Bem-vindo de volta!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Entre com suas credenciais para acessar o sistema.
              </p>
            </div>

            {/* Formulário de Login */}
            <LoginForm onSuccess={onSuccess} />
          </div>
        </div>

        {/* Rodapé Oficial (Item 12 do Briefing) */}
        <footer className="pt-6 text-center text-xs text-slate-500 dark:text-slate-400 select-none space-y-1">
          <div className="font-semibold text-slate-700 dark:text-slate-300">
            Mini IERP Gerencial
          </div>
          <div>
            &copy; 2026 &mdash; Todos os direitos reservados
          </div>
          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-0.5">
            Versão 1.0.0
          </div>
        </footer>
      </main>
    </div>
  );
};

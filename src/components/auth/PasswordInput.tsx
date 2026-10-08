import React, { forwardRef, useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = 'Senha', error, id = 'password-input', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full space-y-1.5">
        <label
          htmlFor={id}
          className="block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 select-none"
        >
          {label}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Lock className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-xl border transition-all duration-150 outline-hidden ${
              error
                ? 'border-rose-400 dark:border-rose-500 focus:ring-2 focus:ring-rose-400/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15'
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-hidden"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {error && (
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 pl-1 animate-in fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

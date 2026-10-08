import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

interface LoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  isLoading = false,
  disabled,
  children = 'ENTRAR',
  className = '',
  ...props
}) => {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`relative w-full py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 dark:disabled:bg-blue-900/60 disabled:cursor-not-allowed shadow-md shadow-blue-600/15 transition-all duration-150 flex items-center justify-center gap-2 select-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
          <span>ENTRANDO...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </>
      )}
    </button>
  );
};

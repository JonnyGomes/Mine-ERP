import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginInput } from './LoginInput';
import { PasswordInput } from './PasswordInput';
import { LoginButton } from './LoginButton';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { AlertCircle, Sparkles, Check } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, isLoading, error, clearError, rememberedUser } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Field validation errors
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Forgot Password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);

  // Auto-focus no campo Usuário e pré-carregar usuário lembrado
  useEffect(() => {
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRememberMe(true);
    }
    usernameRef.current?.focus();
  }, [rememberedUser]);

  const validate = (): boolean => {
    let isValid = true;
    setUsernameError(null);
    setPasswordError(null);
    clearError();

    if (!username.trim()) {
      setUsernameError('Informe o usuário.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Informe a senha.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const success = await login({ username: username.trim(), password }, rememberMe);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  // Preenchimento rápido para demonstração
  const handleFillDemoCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setUsernameError(null);
    setPasswordError(null);
    clearError();
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-4 w-full">
        {/* Alerta de erro elegante */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50/90 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-semibold animate-in fade-in duration-200 shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Campo Usuário */}
        <LoginInput
          ref={usernameRef}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (usernameError) setUsernameError(null);
            if (error) clearError();
          }}
          error={usernameError || undefined}
          disabled={isLoading}
        />

        {/* Campo Senha */}
        <PasswordInput
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError(null);
            if (error) clearError();
          }}
          error={passwordError || undefined}
          disabled={isLoading}
        />

        {/* Lembrar acesso & Esqueci minha senha */}
        <div className="flex items-center justify-between pt-0.5 text-xs select-none">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
            />
            <span>Lembrar meu acesso</span>
          </label>

          <button
            type="button"
            onClick={() => setIsForgotModalOpen(true)}
            disabled={isLoading}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors focus:outline-hidden"
          >
            Esqueci minha senha
          </button>
        </div>

        {/* Botão Entrar */}
        <div className="pt-2">
          <LoginButton isLoading={isLoading} disabled={isLoading} />
        </div>

        {/* Card discreto com credenciais de demonstração */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Acesso de Demonstração:
              </span>
              <span>Usuário: <code className="font-mono text-blue-600 dark:text-blue-400 font-bold">admin</code> &bull; Senha: <code className="font-mono text-blue-600 dark:text-blue-400 font-bold">admin123</code></span>
            </div>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Preencher campos com credenciais padrão"
            >
              Preencher
            </button>
          </div>
        </div>
      </form>

      {/* Modal Esqueci minha senha */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </>
  );
};

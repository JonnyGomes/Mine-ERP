/**
 * AuthService - Camada isolada de autenticação para o Mini IERP Gerencial.
 * Preparada para substituir facilmente esta simulação por chamadas REST / GraphQL reais.
 */

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface SessionData {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: SessionData;
}

const STORAGE_KEYS = {
  SESSION: 'mini_ierp_session',
  REMEMBERED_USER: 'mini_ierp_remembered_user',
};

// Credenciais de demonstração especificadas no briefing:
// Usuário: admin
// Senha:   admin123
const DEMO_USERS: Record<string, { passHash: string; user: AuthUser }> = {
  admin: {
    passHash: 'admin123',
    user: {
      id: 'usr_admin_01',
      name: 'Administrador do Sistema',
      username: 'admin',
      email: 'admin@miniierp.com.br',
      role: 'Administrador Geral',
    },
  },
  gerente: {
    passHash: 'gerente123',
    user: {
      id: 'usr_gerente_02',
      name: 'Carlos Mendes',
      username: 'gerente',
      email: 'gerente@miniierp.com.br',
      role: 'Gerente Comercial',
    },
  },
};

export const AuthService = {
  /**
   * Executa a autenticação das credenciais informadas.
   */
  async login(credentials: AuthCredentials, rememberMe = false): Promise<AuthResponse> {
    // Simula latência de rede realista (400ms a 700ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanUsername = credentials.username.trim().toLowerCase();
    const demo = DEMO_USERS[cleanUsername];

    // Validação de credenciais
    if (!demo || demo.passHash !== credentials.password) {
      return {
        success: false,
        message: 'Usuário ou senha inválidos.',
      };
    }

    // Criar token de sessão simulado
    const sessionData: SessionData = {
      token: 'jwt_mock_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
      user: demo.user,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 horas
    };

    // Armazenar sessão
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

      // Trata a opção "Lembrar meu acesso"
      // NUNCA armazenar a senha em texto puro: apenas o identificador de login!
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_USER, cleanUsername);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_USER);
      }
    } catch (e) {
      console.warn('Erro ao salvar dados de sessão no localStorage:', e);
    }

    return {
      success: true,
      data: sessionData,
    };
  },

  /**
   * Encerra a sessão atual e limpa os dados armazenados.
   */
  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (e) {
      console.warn('Erro ao remover sessão:', e);
    }
  },

  /**
   * Obtém a sessão ativa caso ainda seja válida.
   */
  getSession(): SessionData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!stored) return null;

      const session: SessionData = JSON.parse(stored);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  /**
   * Retorna o identificador de usuário lembrado caso a opção tenha sido marcada.
   */
  getRememberedUser(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.REMEMBERED_USER) || '';
    } catch {
      return '';
    }
  },

  /**
   * Simula a solicitação de redefinição de senha para integração futura.
   */
  async requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!identifier.trim()) {
      return { success: false, message: 'Informe seu e-mail ou nome de usuário cadastrado.' };
    }
    return {
      success: true,
      message: 'Se este usuário estiver cadastrado, as instruções de recuperação serão enviadas ao e-mail correspondente.',
    };
  },
};

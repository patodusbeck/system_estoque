/* ========================================
   GAAK Suplementos - SISTEMA DE AUTENTICAÇÃO
   ======================================== */

// ========== CONFIGURAÇÃO ==========
const AUTH_CONFIG = {
    sessionKey: 'comercialMatos_session',
    sessionDuration: 8 * 60 * 60 * 1000, // 8 horas em milissegundos
    inactivityTimeout: 30 * 60 * 1000 // 30 minutos de inatividade
};

// ========== CLASSE DE AUTENTICAÇÃO ==========
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.inactivityTimer = null;
        this.init();
    }

    /**
     * Inicializa o sistema de autenticação
     */
    init() {
        this.checkSession();
        this.setupActivityListeners();
    }

    /**
     * Realiza o login do usuário
     * @param {string} username - Nome de usuário
     * @param {string} password - Senha
     * @param {boolean} remember - Lembrar sessão
     * @returns {Promise<object>} Resultado do login
     */
    async login(username, password, remember = false) {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!data.success) {
                return { success: false, message: data.message || 'Erro ao realizar login' };
            }

            // Cria sessão
            const session = {
                user: data.user,
                loginTime: Date.now(),
                expiresAt: Date.now() + AUTH_CONFIG.sessionDuration,
                remember: remember
            };

            // Salva sessão
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(session));

            this.currentUser = session.user;
            this.resetInactivityTimer();

            return { success: true, user: session.user };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, message: 'Erro de conexão com o servidor' };
        }
    }

    /**
     * Realiza o logout do usuário
     */
    logout() {
        localStorage.removeItem(AUTH_CONFIG.sessionKey);
        sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
        this.currentUser = null;
        this.clearInactivityTimer();
        window.location.href = 'login.html';
    }

    /**
     * Verifica se há sessão ativa
     * @returns {boolean}
     */
    checkSession() {
        let sessionData = localStorage.getItem(AUTH_CONFIG.sessionKey) ||
            sessionStorage.getItem(AUTH_CONFIG.sessionKey);

        if (!sessionData) {
            this.currentUser = null;
            return false;
        }

        try {
            const session = JSON.parse(sessionData);

            if (Date.now() > session.expiresAt) {
                this.logout();
                return false;
            }

            this.currentUser = session.user;
            this.resetInactivityTimer();
            return true;
        } catch (e) {
            this.logout();
            return false;
        }
    }

    /**
     * Retorna o usuário atual
     * @returns {object|null}
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.checkSession();
    }

    /**
     * Verifica se o usuário tem determinada role
     * @param {string|array} roles - Role(s) permitida(s)
     * @returns {boolean}
     */
    hasRole(roles) {
        if (!this.currentUser) return false;

        if (Array.isArray(roles)) {
            return roles.includes(this.currentUser.role);
        }
        return this.currentUser.role === roles;
    }

    /**
     * Protege uma página (redireciona se não autenticado)
     * @param {string|array} allowedRoles - Roles permitidas (opcional)
     */
    protectPage(allowedRoles = null) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }

        if (allowedRoles && !this.hasRole(allowedRoles)) {
            alert('Você não tem permissão para acessar esta página.');
            window.location.href = 'dashboard.html';
            return false;
        }

        return true;
    }

    /**
     * Configura listeners de atividade do usuário
     */
    setupActivityListeners() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.currentUser) {
                    this.resetInactivityTimer();
                }
            }, { passive: true });
        });
    }

    /**
     * Reseta o timer de inatividade
     */
    resetInactivityTimer() {
        this.clearInactivityTimer();

        this.inactivityTimer = setTimeout(() => {
            if (this.currentUser) {
                alert('Sua sessão expirou por inatividade. Faça login novamente.');
                this.logout();
            }
        }, AUTH_CONFIG.inactivityTimeout);
    }

    /**
     * Limpa o timer de inatividade
     */
    clearInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    }

    /**
     * Atualiza a sessão (estende o tempo)
     */
    refreshSession() {
        if (!this.currentUser) return;

        const sessionData = localStorage.getItem(AUTH_CONFIG.sessionKey) ||
            sessionStorage.getItem(AUTH_CONFIG.sessionKey);

        if (sessionData) {
            const session = JSON.parse(sessionData);
            session.expiresAt = Date.now() + AUTH_CONFIG.sessionDuration;

            const storage = session.remember ? localStorage : sessionStorage;
            storage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(session));
        }
    }
}

// ========== INSTÂNCIA GLOBAL ==========
const auth = new AuthManager();

// ========== FUNÇÕES PARA PÁGINA DE LOGIN ==========

if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const btnLogin = document.getElementById('btnLogin');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Se já está logado, redireciona para dashboard
    if (auth.isAuthenticated()) {
        window.location.href = 'dashboard.html';
    }

    // Toggle de visibilidade da senha
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.innerHTML = type === 'password'
            ? '<i class="fa-solid fa-eye"></i>'
            : '<i class="fa-solid fa-eye-slash"></i>';
    });

    // Submit do formulário
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        // Esconde mensagem de erro anterior
        errorMessage.classList.remove('show');

        // Mostra loading
        btnLogin.classList.add('loading');
        btnLogin.disabled = true;

        // Tenta fazer login
        const result = await auth.login(username, password, remember);

        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            errorText.textContent = result.message;
            errorMessage.classList.add('show');
            btnLogin.classList.remove('loading');
            btnLogin.disabled = false;

            // Shake animation
            loginForm.style.animation = 'shake 0.5s ease';
            setTimeout(() => loginForm.style.animation = '', 500);
        }
    });

    // Adiciona animação de shake
    const style = document.createElement('style');
    style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `;
    document.head.appendChild(style);
}

// ========== EXPORTA PARA USO GLOBAL ==========
window.auth = auth;

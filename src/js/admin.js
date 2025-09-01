// Sistema administrativo principal
import { createAdminDatabase } from './database-nasa.js';
import { AdminView } from './views/AdminView.js';
import { AdminController } from './controllers/AdminController.js';
import { AuthController } from './controllers/AuthController.js';

class AdminApp {
    constructor() {
        this.database = createAdminDatabase(); // Use admin mode with full data
        this.authController = new AuthController(this.database);
        this.updateLoadingStatus('Iniciando dados');
        this.init();
    }

    updateLoadingStatus(message) {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    hideGlobalLoading() {
        const loadingEl = document.getElementById('global-loading');
        if (loadingEl) {
            loadingEl.classList.add('fade-out');
            setTimeout(() => {
                loadingEl.style.display = 'none';
            }, 500);
        }
    }

    async init() {
        try {
            if (!this.authController.checkAuth()) {
                setTimeout(() => {
                    this.hideGlobalLoading();
                    this.showLoginScreen();
                }, 300);
            } else {
                // CRÍTICO: Carregar dados do Supabase ANTES do painel admin
                this.updateLoadingStatus('Carregando dados');
                console.log('🔄 Admin carregando dados do Supabase...');
                
                await this.database.loadData();
                console.log('✅ Dados do Supabase carregados no admin!');
                
                // Small delay for smooth UX
                setTimeout(() => {
                    this.hideGlobalLoading();
                    this.showAdminPanel();
                }, 300);
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar admin:', error);
            this.updateLoadingStatus('Erro ao carregar');
            
            // Retry after 2 seconds
            setTimeout(() => {
                this.init();
            }, 2000);
        }
    }

    showLoginScreen() {
        const app = document.getElementById('admin-app');
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50">
                <div class="max-w-md w-full space-y-8 p-8">
                    <div class="text-center">
                        <div class="mx-auto h-12 w-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            A
                        </div>
                        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
                            Painel Administrativo
                        </h2>
                        <p class="mt-2 text-sm text-gray-600">
                            Digite suas credenciais para acessar
                        </p>
                    </div>
                    <form id="loginForm" class="mt-8 space-y-6">
                        <div class="rounded-md shadow-sm space-y-4">
                            <div>
                                <label for="username" class="block text-sm font-medium text-gray-700">
                                    Usuario
                                </label>
                                <input 
                                    id="username" 
                                    name="username" 
                                    type="text" 
                                    required 
                                    class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="admin"
                                >
                            </div>
                            <div>
                                <label for="password" class="block text-sm font-medium text-gray-700">
                                    Senha
                                </label>
                                <input 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    required 
                                    class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="••••••••"
                                >
                            </div>
                        </div>

                        <div id="errorMessage" class="hidden text-red-600 text-sm text-center"></div>

                        <div>
                            <button 
                                type="submit" 
                                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                Entrar
                            </button>
                        </div>
                        
                        <div class="text-center text-xs text-gray-500">
                            <p>Usuario padrao: admin</p>
                            <p>Senha padrao: admin123</p>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        const submitBtn = document.querySelector('button[type="submit"]');

        // Show loading on button
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Entrando...';
        submitBtn.disabled = true;

        try {
            const loginResult = await this.authController.login(username, password);
            if (loginResult.success) {
                // Show global loading again for data loading
                document.getElementById('global-loading').style.display = 'flex';
                document.getElementById('global-loading').classList.remove('fade-out');
                this.updateLoadingStatus('Carregando dados');
                
                // Load data before showing admin
                await this.database.loadData();
                
                // Remove this line - no need for extra status
                setTimeout(() => {
                    this.hideGlobalLoading();
                    this.showAdminPanel();
                }, 500);
            } else {
                errorMessage.textContent = loginResult.error || 'Usuario ou senha invalidos';
                errorMessage.classList.remove('hidden');
                setTimeout(() => {
                    errorMessage.classList.add('hidden');
                }, 3000);
            }
        } catch (error) {
            console.error('❌ Erro no login:', error);
            errorMessage.textContent = 'Erro ao conectar. Tente novamente.';
            errorMessage.classList.remove('hidden');
        }

        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }

    showAdminPanel() {
        const view = new AdminView(this.database); // ✅ CRITICAL FIX: Pass database for tag display
        const controller = new AdminController(this.database, view);
        
        // Expor controller globalmente para uso na interface
        window.adminController = controller;
        
        view.render();
        controller.init();
        
        // Setup logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.authController.logout();
            this.showLoginScreen();
        });
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new AdminApp();
});
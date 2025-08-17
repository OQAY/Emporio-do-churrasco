// Sistema administrativo principal
import database from './database.js';
import { AdminView } from './views/AdminView.js';
import { AdminController } from './controllers/AdminController.js';
import { AuthController } from './controllers/AuthController.js';

class AdminApp {
    constructor() {
        this.database = database;
        this.authController = new AuthController(this.database);
        this.init();
    }

    init() {
        if (!this.authController.checkAuth()) {
            this.showLoginScreen();
        } else {
            this.showAdminPanel();
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

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        if (this.authController.login(username, password)) {
            this.showAdminPanel();
        } else {
            errorMessage.textContent = 'Usuario ou senha invalidos';
            errorMessage.classList.remove('hidden');
            setTimeout(() => {
                errorMessage.classList.add('hidden');
            }, 3000);
        }
    }

    showAdminPanel() {
        const view = new AdminView();
        const controller = new AdminController(this.database, view);
        
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
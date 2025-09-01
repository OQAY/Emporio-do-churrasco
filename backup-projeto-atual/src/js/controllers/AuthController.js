// Controller de autenticacao
export class AuthController {
    constructor(database) {
        this.database = database;
    }

    checkAuth() {
        console.log('🔍 AuthController.checkAuth() called');
        const result = this.database.isAuthenticated();
        console.log('🔍 AuthController.checkAuth() result:', result);
        return result;
    }

    async login(username, password) {
        console.log('🔐 AuthController.login() called for:', username);
        const result = await this.database.authenticate(username, password);
        console.log('🔐 AuthController.login() result:', result);
        return result;
    }

    logout() {
        this.database.logout();
    }
}
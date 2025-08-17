// Controller de autenticacao
export class AuthController {
    constructor(database) {
        this.database = database;
    }

    checkAuth() {
        return this.database.isAuthenticated();
    }

    login(username, password) {
        return this.database.authenticate(username, password);
    }

    logout() {
        this.database.logout();
    }
}
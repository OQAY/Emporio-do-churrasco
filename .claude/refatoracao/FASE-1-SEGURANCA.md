# 🔒 FASE 1: SEGURANÇA CRÍTICA

## 🎯 OBJETIVO
Eliminar **TODAS** as vulnerabilidades de segurança identificadas e implementar padrões de segurança de nível enterprise (NASA/Google).

**⏰ DURAÇÃO:** 1 semana (5 dias úteis)  
**🎯 PRIORIDADE:** 🔴 **CRÍTICA** - Bloqueia produção

---

## 🚨 VULNERABILIDADES CRÍTICAS IDENTIFICADAS

### **1. XSS (Cross-Site Scripting) - CRÍTICA**
```javascript
// ❌ VULNERÁVEL ATUAL:
app.innerHTML = `<div>${restaurant.name}</div>`; // Unescaped user input

// ✅ CORREÇÃO:
app.innerHTML = `<div>${this.sanitizer.escape(restaurant.name)}</div>`;
```

### **2. Credenciais em Plain Text - CRÍTICA**
```javascript
// ❌ VULNERÁVEL ATUAL:
admin: {
    username: "admin",
    password: "admin123" // Plain text
}

// ✅ CORREÇÃO:
admin: {
    username: "admin",
    passwordHash: "$2b$12$..." // bcrypt hash
}
```

### **3. Falta de Validação Input - ALTA**
```javascript
// ❌ VULNERÁVEL ATUAL:
addProduct(product) {
    const newProduct = { ...product }; // No validation
}

// ✅ CORREÇÃO:
addProduct(product) {
    const validated = this.validator.validateProduct(product);
    if (!validated.isValid) {
        throw new ValidationError(validated.errors);
    }
}
```

---

## 📋 CHECKLIST DETALHADO

### **🛡️ DAY 1: Sanitização XSS**

#### **Task 1.1: Criar Sistema de Sanitização**
```javascript
// 📁 src/js/security/sanitizer.js
class InputSanitizer {
    static escape(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    static sanitizeHTML(input) {
        // Remove ALL HTML tags except whitelisted
        const allowedTags = ['b', 'i', 'em', 'strong'];
        // Implementation using DOMPurify library
    }
}
```

#### **Task 1.2: Aplicar Sanitização Global**
- [ ] Substituir todos `innerHTML` por versão sanitizada
- [ ] Criar helper `safeInnerHTML(element, content)`
- [ ] Aplicar em `app.js` linhas 27-107
- [ ] Aplicar em `MenuView.js`
- [ ] Aplicar em `AdminView.js`

#### **Task 1.3: Instalar DOMPurify**
```bash
npm install dompurify
npm install @types/dompurify
```

#### **✅ Critério de Aceite:**
- [ ] Zero unescaped user input no DOM
- [ ] DOMPurify configurado com whitelist
- [ ] Testes unitários para sanitização

---

### **🔐 DAY 2: Hash de Senhas**

#### **Task 2.1: Instalar bcryptjs**
```bash
npm install bcryptjs
npm install @types/bcryptjs
```

#### **Task 2.2: Criar Password Manager**
```javascript
// 📁 src/js/security/password-manager.js
import bcrypt from 'bcryptjs';

class PasswordManager {
    static async hash(password) {
        const saltRounds = 12; // NASA standard
        return await bcrypt.hash(password, saltRounds);
    }
    
    static async verify(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    
    static validateStrength(password) {
        const minLength = 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);
        
        return {
            isValid: password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial,
            errors: [] // List specific errors
        };
    }
}
```

#### **Task 2.3: Migrar Sistema de Auth**
- [ ] Refatorar `AuthController.js`
- [ ] Hash senha padrão admin
- [ ] Migrar dados existentes
- [ ] Implementar password strength validation

#### **✅ Critério de Aceite:**
- [ ] Zero plain text passwords
- [ ] bcrypt com salt rounds 12+
- [ ] Password strength validation

---

### **✅ DAY 3: Validação de Inputs**

#### **Task 3.1: Criar Sistema de Validação**
```javascript
// 📁 src/js/security/validator.js
import validator from 'validator';

class InputValidator {
    static validateProduct(product) {
        const errors = [];
        
        // Name validation
        if (!product.name || product.name.length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }
        
        if (product.name.length > 100) {
            errors.push('Nome deve ter no máximo 100 caracteres');
        }
        
        // Price validation
        if (!product.price || isNaN(product.price) || product.price < 0) {
            errors.push('Preço deve ser um número positivo');
        }
        
        // Description validation
        if (product.description && product.description.length > 500) {
            errors.push('Descrição deve ter no máximo 500 caracteres');
        }
        
        // Image URL validation
        if (product.image && !validator.isURL(product.image)) {
            errors.push('URL da imagem inválida');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    static validateCategory(category) { /* Similar validation */ }
    static validateRestaurant(restaurant) { /* Similar validation */ }
}
```

#### **Task 3.2: Aplicar Validação em Controllers**
- [ ] `ProductController.js` - validate antes de save
- [ ] `AdminController.js` - validate todos inputs
- [ ] `AuthController.js` - validate credentials

#### **✅ Critério de Aceite:**
- [ ] 100% inputs validados
- [ ] Error messages user-friendly
- [ ] SQL injection prevention

---

### **🛡️ DAY 4: Rate Limiting & Security Headers**

#### **Task 4.1: Implementar Rate Limiting**
```javascript
// 📁 src/js/security/rate-limiter.js
class RateLimiter {
    constructor() {
        this.attempts = new Map();
        this.maxAttempts = 5;
        this.windowMs = 15 * 60 * 1000; // 15 minutes
    }
    
    isAllowed(identifier) {
        const now = Date.now();
        const userAttempts = this.attempts.get(identifier) || [];
        
        // Remove old attempts
        const validAttempts = userAttempts.filter(
            attempt => now - attempt < this.windowMs
        );
        
        if (validAttempts.length >= this.maxAttempts) {
            return false;
        }
        
        validAttempts.push(now);
        this.attempts.set(identifier, validAttempts);
        return true;
    }
}
```

#### **Task 4.2: Security Headers (se usando servidor)**
```javascript
// Para quando migrar para Node.js
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    next();
});
```

#### **✅ Critério de Aceite:**
- [ ] Login rate limiting (5 attempts/15min)
- [ ] API rate limiting (100 req/min)
- [ ] Security headers configurados

---

### **🔒 DAY 5: HTTPS & Auditoria Final**

#### **Task 5.1: HTTPS Enforcement**
```javascript
// 📁 src/js/security/https-enforcer.js
class HTTPSEnforcer {
    static enforce() {
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            location.replace(`https:${location.href.substring(location.protocol.length)}`);
        }
    }
    
    static checkMixedContent() {
        // Verificar se há recursos HTTP em página HTTPS
        const insecureResources = [];
        document.querySelectorAll('img, script, link').forEach(element => {
            const src = element.src || element.href;
            if (src && src.startsWith('http://')) {
                insecureResources.push(src);
            }
        });
        
        if (insecureResources.length > 0) {
            console.warn('Mixed content detected:', insecureResources);
        }
    }
}
```

#### **Task 5.2: Security Audit Checklist**
- [ ] **XSS Prevention:** ✅ DOMPurify implementado
- [ ] **Password Security:** ✅ bcrypt hash + strength validation
- [ ] **Input Validation:** ✅ Validator em 100% inputs
- [ ] **Rate Limiting:** ✅ Login + API protection
- [ ] **HTTPS:** ✅ Redirection + mixed content check
- [ ] **Error Handling:** ✅ Não vaza informações técnicas

#### **Task 5.3: Penetration Testing**
```bash
# Testes automatizados
npm install --save-dev owasp-zap
npm run security:test
```

#### **✅ Critério de Aceite:**
- [ ] OWASP ZAP scan 100% clean
- [ ] Manual penetration test aprovado
- [ ] Security checklist 100% completo

---

## 🧪 TESTES DE SEGURANÇA

### **Unit Tests**
```javascript
// 📁 tests/security/sanitizer.test.js
describe('InputSanitizer', () => {
    test('should escape XSS attempts', () => {
        const malicious = '<script>alert("xss")</script>';
        const safe = InputSanitizer.escape(malicious);
        expect(safe).not.toContain('<script>');
        expect(safe).toContain('&lt;script&gt;');
    });
});
```

### **Integration Tests**
```javascript
// 📁 tests/security/auth.test.js
describe('Authentication Security', () => {
    test('should rate limit login attempts', async () => {
        for (let i = 0; i < 6; i++) {
            await request(app).post('/login').send({ username: 'admin', password: 'wrong' });
        }
        
        const response = await request(app).post('/login');
        expect(response.status).toBe(429); // Too Many Requests
    });
});
```

---

## 📊 MÉTRICAS DE SUCESSO

### **KPIs de Segurança:**
- [ ] **Vulnerabilidades Críticas:** 0
- [ ] **OWASP Top 10 Compliance:** 100%
- [ ] **Password Strength:** Mínimo 8 chars + complexidade
- [ ] **XSS Prevention:** 100% inputs sanitizados
- [ ] **Rate Limiting:** <5 attempts/15min

### **Ferramentas de Verificação:**
- **OWASP ZAP:** Automated security testing
- **npm audit:** Dependency vulnerabilities
- **SonarQube:** Code security analysis
- **Manual Review:** Peer code review

---

## ⚠️ RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Breaking changes** | Média | Alto | Feature flags + gradual rollout |
| **Performance impact** | Baixa | Médio | Benchmark antes/depois |
| **User experience** | Baixa | Médio | Validation messages claras |

---

## 🚀 ENTREGÁVEIS FINAIS

### **Código:**
- [ ] `src/js/security/` - Módulos de segurança
- [ ] Refatoração de todos controllers
- [ ] Tests de segurança (>90% coverage)

### **Documentação:**
- [ ] Security audit report
- [ ] Penetration test results
- [ ] Deployment security checklist

### **CI/CD:**
- [ ] Security tests no pipeline
- [ ] Automated vulnerability scanning
- [ ] Security gates (fail build se vulnerabilidade)

---

**🎯 PRÓXIMO PASSO:** Ao finalizar, iniciar **FASE 2: ERROR HANDLING**

**⚠️ BLOQUEADORES:** Nenhum deploy até security audit 100% aprovado
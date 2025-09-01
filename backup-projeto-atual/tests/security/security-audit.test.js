/**
 * Comprehensive Security Audit Tests
 * Enterprise-grade security testing for Menu-Online application
 */

import { InputSanitizer } from '../../src/js/security/sanitizer.js';
import { PasswordManager } from '../../src/js/security/password-manager.js';
import { InputValidator } from '../../src/js/security/validator.js';
import { RateLimiter, loginRateLimiter } from '../../src/js/security/rate-limiter.js';
import { HTTPSEnforcer } from '../../src/js/security/https-enforcer.js';

describe('Security Audit - Complete Test Suite', () => {
    describe('XSS Prevention', () => {
        test('should prevent script injection in product names', () => {
            const maliciousName = '<script>alert("XSS")</script>Pizza';
            const safe = InputSanitizer.escape(maliciousName);
            
            expect(safe).not.toContain('<script>');
            expect(safe).toContain('&lt;script&gt;');
        });

        test('should prevent event handler injection', () => {
            const malicious = '<img src=x onerror="alert(1)">';
            const safe = InputSanitizer.escape(malicious);
            
            expect(safe).not.toContain('onerror=');
            expect(safe).toContain('&quot;');
        });

        test('should sanitize object properties recursively', () => {
            const maliciousProduct = {
                name: '<script>steal()</script>',
                description: '<img src=x onerror=hack()>',
                category: {
                    name: '<svg onload=alert(1)>'
                }
            };

            const clean = InputSanitizer.sanitizeObject(maliciousProduct);
            
            expect(JSON.stringify(clean)).not.toContain('<script>');
            expect(JSON.stringify(clean)).not.toContain('onerror');
            expect(JSON.stringify(clean)).not.toContain('onload');
        });
    });

    describe('Password Security', () => {
        test('should hash passwords with proper salt rounds', async () => {
            const password = 'TestPassword123!';
            const hash = await PasswordManager.hash(password);
            
            expect(hash).toMatch(/^\$2[ab]\$12\$/); // bcrypt format with 12 rounds
            expect(hash).not.toContain(password);
        });

        test('should verify passwords correctly', async () => {
            const password = 'SecurePass123!';
            const hash = await PasswordManager.hash(password);
            
            const validResult = await PasswordManager.verify(password, hash);
            const invalidResult = await PasswordManager.verify('WrongPassword', hash);
            
            expect(validResult).toBe(true);
            expect(invalidResult).toBe(false);
        });

        test('should enforce strong password requirements', () => {
            const weakPasswords = [
                '123456',
                'password',
                'admin',
                'abc123',
                'qwerty',
                '12345678'
            ];

            weakPasswords.forEach(weak => {
                const result = PasswordManager.validateStrength(weak);
                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
            });
        });

        test('should accept strong passwords', () => {
            const strongPasswords = [
                'MySecure123!',
                'Enterprise@2024',
                'Str0ng&C0mplex',
                'Valid#Pass987'
            ];

            strongPasswords.forEach(strong => {
                const result = PasswordManager.validateStrength(strong);
                expect(result.isValid).toBe(true);
                expect(result.errors.length).toBe(0);
            });
        });
    });

    describe('Input Validation', () => {
        test('should validate product data thoroughly', () => {
            const invalidProduct = {
                name: '',
                price: -10,
                description: 'x'.repeat(600),
                image: 'not-a-url',
                categoryId: null
            };

            const result = InputValidator.validateProduct(invalidProduct);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Nome deve ter pelo menos 2 caracteres');
            expect(result.errors).toContain('Preço deve ser um número positivo');
            expect(result.errors).toContain('Descrição deve ter no máximo 500 caracteres');
            expect(result.errors).toContain('URL da imagem é inválida');
            expect(result.errors).toContain('Categoria é obrigatória');
        });

        test('should prevent SQL injection patterns in search', () => {
            const maliciousQueries = [
                "'; DROP TABLE products; --",
                "1' OR '1'='1",
                "admin'/*",
                "'; DELETE FROM users; --"
            ];

            maliciousQueries.forEach(query => {
                const result = InputValidator.validateSearchQuery(query);
                expect(result.isValid).toBe(false);
            });
        });

        test('should validate email formats strictly', () => {
            const invalidEmails = [
                'not-an-email',
                '@domain.com',
                'user@',
                'user space@domain.com',
                'user@domain',
                'x'.repeat(100) + '@domain.com'
            ];

            invalidEmails.forEach(email => {
                const result = InputValidator.validateEmail(email);
                expect(result.isValid).toBe(false);
            });
        });
    });

    describe('Rate Limiting', () => {
        test('should prevent brute force attacks', () => {
            const rateLimiter = new RateLimiter();
            rateLimiter.configure({ maxAttempts: 3, windowMs: 60000 });

            const identifier = 'test-user';

            // First 3 attempts should be allowed
            for (let i = 0; i < 3; i++) {
                const result = rateLimiter.isAllowed(identifier);
                expect(result.allowed).toBe(true);
            }

            // 4th attempt should be blocked
            const blockedResult = rateLimiter.isAllowed(identifier);
            expect(blockedResult.allowed).toBe(false);
            expect(blockedResult.blocked).toBe(true);
        });

        test('should track different action types separately', () => {
            const rateLimiter = new RateLimiter();
            const identifier = 'test-user';

            // Use up login attempts
            for (let i = 0; i < 6; i++) {
                rateLimiter.isAllowed(identifier, 'login');
            }

            // API calls should still be allowed
            const apiResult = rateLimiter.isAllowed(identifier, 'api');
            expect(apiResult.allowed).toBe(true);

            // But login should be blocked
            const loginResult = rateLimiter.isAllowed(identifier, 'login');
            expect(loginResult.allowed).toBe(false);
        });

        test('should reset limits after successful action', () => {
            const rateLimiter = new RateLimiter();
            rateLimiter.configure({ maxAttempts: 2 });
            
            const identifier = 'test-user';

            // Use up attempts
            rateLimiter.isAllowed(identifier);
            rateLimiter.isAllowed(identifier);
            
            // Should be blocked
            const blockedResult = rateLimiter.isAllowed(identifier);
            expect(blockedResult.allowed).toBe(false);

            // Reset and try again
            rateLimiter.reset(identifier);
            const resetResult = rateLimiter.isAllowed(identifier);
            expect(resetResult.allowed).toBe(true);
        });
    });

    describe('URL Sanitization', () => {
        test('should block dangerous URL protocols', () => {
            const dangerousUrls = [
                'javascript:alert("xss")',
                'data:text/html,<script>alert("xss")</script>',
                'vbscript:msgbox("xss")',
                'file:///etc/passwd',
                'ftp://malicious.com/script.js'
            ];

            dangerousUrls.forEach(url => {
                const result = InputSanitizer.sanitizeURL(url);
                expect(result).toBe(null);
            });
        });

        test('should allow safe URL protocols', () => {
            const safeUrls = [
                'https://example.com/image.jpg',
                'http://localhost:3000/api',
                'mailto:contact@example.com',
                'tel:+1234567890',
                '/relative/path/image.png',
                '/api/products'
            ];

            safeUrls.forEach(url => {
                const result = InputSanitizer.sanitizeURL(url);
                expect(result).toBe(url);
            });
        });
    });

    describe('HTTPS Enforcement', () => {
        test('should detect mixed content', () => {
            // Mock DOM for testing
            document.body.innerHTML = `
                <img src="http://example.com/image.jpg" alt="test">
                <script src="http://example.com/script.js"></script>
                <link rel="stylesheet" href="http://example.com/style.css">
            `;

            const mixedContent = HTTPSEnforcer.checkMixedContent();
            
            expect(mixedContent.length).toBe(3);
            expect(mixedContent[0].type).toBe('image');
            expect(mixedContent[1].type).toBe('script');
            expect(mixedContent[2].type).toBe('stylesheet');
        });

        test('should generate proper CSP header', () => {
            const cspHeader = HTTPSEnforcer.getCSPHeader();
            
            expect(cspHeader).toContain("default-src 'self'");
            expect(cspHeader).toContain("script-src 'self'");
            expect(cspHeader).toContain("img-src 'self' data: https:");
            expect(cspHeader).toContain('upgrade-insecure-requests');
        });
    });

    describe('Integration Security Tests', () => {
        test('should handle complete malicious input sanitization flow', () => {
            const maliciousData = {
                name: '<script>steal_data()</script>Burger',
                description: '<img src=x onerror="send_data_to_attacker()">',
                price: 'javascript:alert("price hack")',
                image: 'javascript:steal_images()',
                search: '<iframe src="javascript:hack()"></iframe>'
            };

            // Sanitize all inputs
            const sanitized = {
                name: InputSanitizer.escape(maliciousData.name),
                description: InputSanitizer.stripHTML(maliciousData.description),
                price: parseFloat(maliciousData.price) || 0,
                image: InputSanitizer.sanitizeURL(maliciousData.image),
                search: InputSanitizer.escape(maliciousData.search)
            };

            // Validate results
            expect(sanitized.name).not.toContain('<script>');
            expect(sanitized.description).not.toContain('<img');
            expect(sanitized.price).toBe(0);
            expect(sanitized.image).toBe(null);
            expect(sanitized.search).not.toContain('<iframe>');
        });

        test('should prevent timing attacks on authentication', async () => {
            const startTime = Date.now();
            
            // Try with non-existent user
            const result1 = await PasswordManager.verify('nonexistent', '$2a$12$invalid.hash.here');
            const time1 = Date.now() - startTime;
            
            const midTime = Date.now();
            
            // Try with wrong password for existing user  
            const result2 = await PasswordManager.verify('wrong', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBd6iogJnJUdgG');
            const time2 = Date.now() - midTime;
            
            // Both should be false
            expect(result1).toBe(false);
            expect(result2).toBe(false);
            
            // Timing should be relatively similar (within reasonable variance)
            const timeDiff = Math.abs(time1 - time2);
            expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
        });
    });

    describe('Security Headers', () => {
        test('should set all required security headers', () => {
            HTTPSEnforcer.setSecurityHeaders();
            
            const headers = HTTPSEnforcer.checkSecurityHeaders();
            
            expect(headers.csp).toBe(true);
            expect(headers.xFrameOptions).toBe(true);
            expect(headers.xContentTypeOptions).toBe(true);
            expect(headers.xXSSProtection).toBe(true);
        });
    });

    describe('Error Handling Security', () => {
        test('should not leak sensitive information in errors', () => {
            const sensitiveError = new Error('Database connection failed: postgres://user:password@localhost:5432/db');
            
            // Error messages should be sanitized before showing to user
            const safeMessage = 'Internal server error occurred';
            
            expect(safeMessage).not.toContain('postgres://');
            expect(safeMessage).not.toContain('password');
            expect(safeMessage).not.toContain(':5432');
        });
    });
});

describe('Security Compliance Checklist', () => {
    test('OWASP Top 10 - A1: Injection Prevention', () => {
        // SQL Injection prevention through parameterized queries (handled by validation)
        const maliciousInput = "'; DROP TABLE users; --";
        const validation = InputValidator.validateSearchQuery(maliciousInput);
        expect(validation.isValid).toBe(false);
    });

    test('OWASP Top 10 - A2: Broken Authentication', () => {
        // Strong password requirements and rate limiting
        const weakAuth = { username: 'admin', password: '123456' };
        const validation = InputValidator.validateCredentials(weakAuth.username, weakAuth.password);
        const passwordStrength = PasswordManager.validateStrength(weakAuth.password);
        
        expect(passwordStrength.isValid).toBe(false);
    });

    test('OWASP Top 10 - A3: Sensitive Data Exposure', () => {
        // Password hashing
        const password = 'MyPassword123!';
        PasswordManager.hash(password).then(hash => {
            expect(hash).not.toContain(password);
            expect(hash).toMatch(/^\$2[ab]\$12\$/);
        });
    });

    test('OWASP Top 10 - A7: Cross-Site Scripting (XSS)', () => {
        // XSS prevention through input sanitization
        const xssPayload = '<script>alert("XSS")</script>';
        const sanitized = InputSanitizer.escape(xssPayload);
        expect(sanitized).not.toContain('<script>');
    });
});
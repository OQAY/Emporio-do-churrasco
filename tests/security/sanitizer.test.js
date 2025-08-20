/**
 * Security Tests for Input Sanitizer
 * Testing XSS prevention and input sanitization
 */

import { InputSanitizer } from '../../src/js/security/sanitizer.js';

describe('InputSanitizer', () => {
    describe('escape()', () => {
        test('should escape basic HTML characters', () => {
            const malicious = '<script>alert("xss")</script>';
            const safe = InputSanitizer.escape(malicious);
            
            expect(safe).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
            expect(safe).not.toContain('<script>');
        });

        test('should escape all dangerous characters', () => {
            const input = `<>"'&/`;
            const result = InputSanitizer.escape(input);
            
            expect(result).toBe('&lt;&gt;&quot;&#x27;&amp;&#x2F;');
        });

        test('should handle non-string inputs safely', () => {
            expect(InputSanitizer.escape(null)).toBe(null);
            expect(InputSanitizer.escape(undefined)).toBe(undefined);
            expect(InputSanitizer.escape(123)).toBe(123);
        });
    });

    describe('sanitizeURL()', () => {
        test('should allow safe URLs', () => {
            const safeUrls = [
                'https://example.com',
                'http://example.com',
                'mailto:test@example.com',
                'tel:+1234567890',
                '/relative/path',
                '/image.jpg'
            ];

            safeUrls.forEach(url => {
                expect(InputSanitizer.sanitizeURL(url)).toBe(url);
            });
        });

        test('should block dangerous protocols', () => {
            const dangerousUrls = [
                'javascript:alert("xss")',
                'data:text/html,<script>alert("xss")</script>',
                'vbscript:alert("xss")',
                'file:///etc/passwd'
            ];

            dangerousUrls.forEach(url => {
                expect(InputSanitizer.sanitizeURL(url)).toBe(null);
            });
        });

        test('should handle case insensitive protocols', () => {
            expect(InputSanitizer.sanitizeURL('JAVASCRIPT:alert("xss")')).toBe(null);
            expect(InputSanitizer.sanitizeURL('JavaScript:alert("xss")')).toBe(null);
        });
    });

    describe('stripHTML()', () => {
        test('should remove all HTML tags', () => {
            const html = '<div>Hello <strong>World</strong></div>';
            const result = InputSanitizer.stripHTML(html);
            
            expect(result).toBe('Hello World');
        });

        test('should handle malicious HTML', () => {
            const malicious = '<script>alert("xss")</script><div>Content</div>';
            const result = InputSanitizer.stripHTML(malicious);
            
            expect(result).toBe('alert("xss")Content');
            expect(result).not.toContain('<script>');
        });
    });

    describe('sanitizeObject()', () => {
        test('should sanitize object properties recursively', () => {
            const dirty = {
                name: '<script>alert("xss")</script>',
                description: 'Safe content',
                nested: {
                    value: '<img src=x onerror=alert("xss")>'
                },
                array: ['<b>bold</b>', 'normal text']
            };

            const clean = InputSanitizer.sanitizeObject(dirty);

            expect(clean.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
            expect(clean.description).toBe('Safe content');
            expect(clean.nested.value).toBe('&lt;img src=x onerror=alert(&quot;xss&quot;)&gt;');
            expect(clean.array[0]).toBe('&lt;b&gt;bold&lt;&#x2F;b&gt;');
            expect(clean.array[1]).toBe('normal text');
        });
    });

    describe('DOM manipulation methods', () => {
        beforeEach(() => {
            // Setup DOM
            document.body.innerHTML = '<div id="test"></div>';
        });

        test('safeInnerHTML should prevent XSS', () => {
            const element = document.getElementById('test');
            const malicious = '<script>alert("xss")</script>Hello';
            
            InputSanitizer.safeInnerHTML(element, malicious);
            
            expect(element.innerHTML).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;Hello');
        });

        test('safeTextContent should work safely', () => {
            const element = document.getElementById('test');
            const content = '<script>alert("xss")</script>Hello';
            
            InputSanitizer.safeTextContent(element, content);
            
            expect(element.textContent).toBe('<script>alert("xss")</script>Hello');
            expect(element.innerHTML).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;Hello');
        });
    });
});
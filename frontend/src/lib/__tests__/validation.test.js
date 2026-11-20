import { describe, it, expect } from 'vitest';
import { loginSchema } from '../validation';

describe('loginSchema', () => {
    it('accepts a valid email/password pair', () => {
        const result = loginSchema.safeParse({ email: 'client@test.com', password: 'Client@123' });
        expect(result.success).toBe(true);
    });

    it('rejects an invalid email', () => {
        const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Client@123' });
        expect(result.success).toBe(false);
    });

    it('rejects a password shorter than 6 characters', () => {
        const result = loginSchema.safeParse({ email: 'client@test.com', password: '123' });
        expect(result.success).toBe(false);
    });
});

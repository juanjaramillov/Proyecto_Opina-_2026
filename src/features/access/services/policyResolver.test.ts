import { describe, it, expect } from 'vitest';
import { resolveAccessPolicy } from './policyResolver';
import { AccessState } from '../types/policy';

describe('policyResolver', () => {
    const baseState: AccessState = {
        isAuthenticated: false,
        isLoading: false,
        isProfileComplete: false,
        hasAccessGateToken: false,
        role: 'user',
        userId: 'test-id',
        verificationLevel: 'none'
    };

    it('allows access to public routes unconditionally', () => {
        expect(resolveAccessPolicy('public', baseState).allowed).toBe(true);
    });

    it('allows access if still loading session to prevent premature redirects', () => {
        expect(resolveAccessPolicy('signals', { ...baseState, isLoading: true }).allowed).toBe(true);
    });

    describe('Signals Route', () => {
        it('denies access if unauthenticated', () => {
            const result = resolveAccessPolicy('signals', baseState);
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('unauthenticated');
            expect(result.redirectTo).toBe('/login');
        });

        it('denies access if authenticated but profile is incomplete for regular users', () => {
            const result = resolveAccessPolicy('signals', { ...baseState, isAuthenticated: true, isProfileComplete: false });
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('incomplete_profile');
            expect(result.redirectTo).toBe('/complete-profile');
        });

        it('denies access if missing invite token for regular users', () => {
            const result = resolveAccessPolicy('signals', { 
                ...baseState, 
                isAuthenticated: true, 
                isProfileComplete: true, 
                hasAccessGateToken: false 
            });
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('missing_invite');
            expect(result.redirectTo).toBe('/access');
        });

        it('allows access if authenticated, profile complete, and has invite token', () => {
            const result = resolveAccessPolicy('signals', { 
                ...baseState, 
                isAuthenticated: true, 
                isProfileComplete: true, 
                hasAccessGateToken: true 
            });
            expect(result.allowed).toBe(true);
        });

        it('allows admins to bypass profile and invite token checks', () => {
            const result = resolveAccessPolicy('signals', { 
                ...baseState, 
                isAuthenticated: true, 
                isProfileComplete: false, 
                hasAccessGateToken: false,
                role: 'admin'
            });
            expect(result.allowed).toBe(true);
        });
    });

    describe('Admin Route', () => {
        it('denies access if unauthenticated', () => {
            const result = resolveAccessPolicy('admin', baseState);
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('unauthenticated');
        });

        it('denies access if authenticated but not admin', () => {
            const result = resolveAccessPolicy('admin', { ...baseState, isAuthenticated: true, role: 'user' });
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('insufficient_role');
            expect(result.redirectTo).toBe('/');
        });

        it('allows access if authenticated as admin', () => {
            const result = resolveAccessPolicy('admin', { ...baseState, isAuthenticated: true, role: 'admin' });
            expect(result.allowed).toBe(true);
        });
    });

    describe('B2B Dashboard', () => {
        it('denies access to non-b2b users', () => {
            const result = resolveAccessPolicy('b2b_dashboard', { ...baseState, isAuthenticated: true, role: 'user' });
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('insufficient_role');
            expect(result.redirectTo).toBe('/');
        });

        it('allows access to b2b users', () => {
            const result = resolveAccessPolicy('b2b_dashboard', { ...baseState, isAuthenticated: true, role: 'b2b' });
            expect(result.allowed).toBe(true);
        });

        it('allows access to admin users', () => {
            const result = resolveAccessPolicy('b2b_dashboard', { ...baseState, isAuthenticated: true, role: 'admin' });
            expect(result.allowed).toBe(true);
        });
    });
});

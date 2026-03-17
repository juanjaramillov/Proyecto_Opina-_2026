import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Gate from './Gate';

// 1. Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useLocation: () => ({ pathname: '/test', search: '?q=1' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Navigate: (props: any) => {
        mockNavigate(props.to);
        return <div data-testid="navigate">Redirecting to {props.to}</div>;
    }
}));

// 2. Mock de AuthContext
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockAccessState: any = {};
vi.mock('../../auth/context/AuthContext', () => ({
    useAuthContext: () => ({
        accessState: mockAccessState
    })
}));

// 3. Mock Logger / Toast
vi.mock('../../../lib/logger', () => ({
    logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
}));
vi.mock('react-hot-toast', () => ({
    default: { error: vi.fn(), success: vi.fn() }
}));

describe('Gate Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        mockAccessState = {
            isLoading: false,
            isAuthenticated: false,
            isProfileComplete: false,
            hasAccessGateToken: false,
            role: 'user',
            error: null
        };
    });

    it('renders a loading spinner when resolving session', () => {
        mockAccessState.isLoading = true;
        const { container } = render(
            <Gate module="signals">
                <div data-testid="protected-content">Content</div>
            </Gate>
        );
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        // Spinner should be visible. In our app it's an animate-spin div
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from signals module', () => {
        render(
            <Gate module="signals">
                <div data-testid="protected-content">Content</div>
            </Gate>
        );
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toBeInTheDocument();
        // Redirect destination should encode next URL logic
        expect(mockNavigate).toHaveBeenCalledWith('/login?next=%2Ftest%3Fq%3D1&reason=unauthenticated');
    });

    it('redirects authenticated users without profile from signals module', () => {
        mockAccessState.isAuthenticated = true;
        render(
            <Gate module="signals">
                <div data-testid="protected-content">Content</div>
            </Gate>
        );
        expect(screen.getByTestId('navigate')).toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/complete-profile');
    });

    it('allows access for fully cleared users on signals module', () => {
        mockAccessState.isAuthenticated = true;
        mockAccessState.isProfileComplete = true;
        mockAccessState.hasAccessGateToken = true;

        render(
            <Gate module="signals">
                <div data-testid="protected-content">Secret Signals Content</div>
            </Gate>
        );
        expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('allows access to admin bypass regardless of profile/token state', () => {
        mockAccessState.isAuthenticated = true;
        mockAccessState.role = 'admin';

        render(
            <Gate module="signals">
                <div data-testid="protected-content">Admin Vision</div>
            </Gate>
        );
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('redirects users securely when B2B module is denied', () => {
        mockAccessState.isAuthenticated = true;
        mockAccessState.role = 'user'; // Not B2B

        render(
            <Gate module="b2b_dashboard">
                <div data-testid="protected-content">B2B Content</div>
            </Gate>
        );
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
});

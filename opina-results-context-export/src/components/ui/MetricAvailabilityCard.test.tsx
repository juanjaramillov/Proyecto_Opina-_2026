import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricAvailabilityCard } from './MetricAvailabilityCard';

describe('MetricAvailabilityCard', () => {
    describe('Default Mode (Non-compact)', () => {
        it('renders correctly in available state showing the real value', () => {
            render(
                <MetricAvailabilityCard
                    label="Active Users"
                    status="available"
                    value="1,234"
                    helperText="En las últimas 24h"
                />
            );
            
            // Should show the label
            expect(screen.getByText('Active Users')).toBeInTheDocument();
            // Should show the actual metric value
            expect(screen.getByText('1,234')).toBeInTheDocument();
            // Should show the helper text
            expect(screen.getByText('En las últimas 24h')).toBeInTheDocument();
            
            // It should NOT show honest fallback messages
            expect(screen.queryByText(/En preparación/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Masa crítica insuficiente/i)).not.toBeInTheDocument();
        });

        it('renders honest fallback in pending state, hiding fake metrics', () => {
            render(
                <MetricAvailabilityCard
                    label="Active Users"
                    status="pending"
                    value="1,234" // Even if a value is passed, it should not render it
                    helperText="Cargando nuevo batch"
                />
            );
            
            expect(screen.getByText('Active Users')).toBeInTheDocument();
            expect(screen.getByText('En preparación')).toBeInTheDocument();
            expect(screen.getByText('Cargando nuevo batch')).toBeInTheDocument();
            
            // Value is hidden
            expect(screen.queryByText('1,234')).not.toBeInTheDocument();
        });

        it('renders honest fallback when data is insufficient', () => {
            render(
                <MetricAvailabilityCard
                    label="Active Users"
                    status="insufficient_data"
                />
            );
            
            expect(screen.getByText('Active Users')).toBeInTheDocument();
            expect(screen.getByText('Masa crítica insuficiente')).toBeInTheDocument();
        });
    });

    describe('Compact Mode', () => {
        it('renders available state in compact form', () => {
            render(
                <MetricAvailabilityCard
                    label="Users"
                    status="available"
                    value="42"
                    compact={true}
                />
            );
            // Shows value and label
            expect(screen.getByText('42')).toBeInTheDocument();
            expect(screen.getByText('Users')).toBeInTheDocument();
        });

        it('renders pending state in compact form', () => {
            render(
                <MetricAvailabilityCard
                    label="Users"
                    status="pending"
                    compact={true}
                />
            );
            expect(screen.getByText('En preparación')).toBeInTheDocument();
        });

        it('renders insufficient_data state in compact form', () => {
            render(
                <MetricAvailabilityCard
                    label="Users"
                    status="insufficient_data"
                    compact={true}
                />
            );
            expect(screen.getByText('Sin telemetría consolidada')).toBeInTheDocument();
        });
    });
});

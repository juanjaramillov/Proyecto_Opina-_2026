import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SmokeTestProvider } from './SmokeTestProvider';
import Home from '../../features/home/pages/Home';

describe('Home Runtime Smoke Test', () => {
  it('renders Home layout without crashing', () => {
    render(
      <SmokeTestProvider initialRoute="/">
        <Home />
      </SmokeTestProvider>
    );

    // Comprobamos la existencia del tag "main" que alberga al Home a nivel top-level 
    // en lugar de depender de copies ("¿Qué es Opina+?").
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the navigation bar with PTML branding', () => {
    render(<App />);

    expect(screen.getAllByText('PTML').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getAllByText('Getting Started').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Reference')).toBeInTheDocument();
  });

  it('renders the home page content by default', () => {
    render(<App />);

    expect(screen.getByText('For developers who prototype')).toBeInTheDocument();
    expect(screen.getByText('Build interactive UIs with markup, not code')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(<App />);

    expect(screen.getByText('Built with PTML')).toBeInTheDocument();
  });

  it('navigates to Getting Started when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByText('Getting Started')[0]);

    expect(screen.getByText('Node Categories')).toBeInTheDocument();
    expect(screen.getByText('Your First PTML')).toBeInTheDocument();
  });

  it('navigates to Reference when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Reference'));

    expect(screen.getByText('Language Reference')).toBeInTheDocument();
    expect(screen.getByText('Declaration Nodes')).toBeInTheDocument();
  });

  it('navigates back to Home from another page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Reference'));
    expect(screen.getByText('Language Reference')).toBeInTheDocument();

    await user.click(screen.getByText('Home'));
    expect(screen.getByText('Build interactive UIs with markup, not code')).toBeInTheDocument();
  });

  it('renders the home page feature cards', () => {
    render(<App />);

    expect(screen.getByText('No boilerplate')).toBeInTheDocument();
    expect(screen.getByText('State that just works')).toBeInTheDocument();
    expect(screen.getByText('Real interactivity')).toBeInTheDocument();
    expect(screen.getByText('Reusable templates')).toBeInTheDocument();
  });

  it('renders the code comparison on the home page', () => {
    render(<App />);

    expect(screen.getByText('React (JSX + hooks)')).toBeInTheDocument();
    expect(screen.getByText('The 80/20 trade')).toBeInTheDocument();
  });

  it('renders the Getting Started page with all sections', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByText('Getting Started')[0]);

    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Quick Setup')).toBeInTheDocument();
    expect(screen.getByText('API Reference')).toBeInTheDocument();
    expect(screen.getByText('Node Categories')).toBeInTheDocument();
    expect(screen.getByText('Interactivity')).toBeInTheDocument();
    expect(screen.getByText('Styling')).toBeInTheDocument();
    expect(screen.getByText('Conditionals')).toBeInTheDocument();
  });

  it('renders the Reference page with all major sections', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Reference'));

    expect(screen.getByText('Declaration Nodes')).toBeInTheDocument();
    expect(screen.getByText('Block Nodes')).toBeInTheDocument();
    expect(screen.getByText('Property Nodes')).toBeInTheDocument();
    expect(screen.getByText('Conditional Nodes')).toBeInTheDocument();
    expect(screen.getByText('Action Nodes')).toBeInTheDocument();
  });

  it('renders the Edit PTML button in the footer', () => {
    render(<App />);

    expect(screen.getByText('Edit PTML')).toBeInTheDocument();
  });

  it('toggles the editor tray when Edit PTML is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByText('Edit PTML'));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Close Editor')).toBeInTheDocument();
  });

  it('closes the editor tray when Close Editor is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Edit PTML'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    await user.click(screen.getByText('Close Editor'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Edit PTML')).toBeInTheDocument();
  });
});

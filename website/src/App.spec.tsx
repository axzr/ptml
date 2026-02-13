import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the navigation bar with PTML branding', () => {
    render(<App />);

    expect(screen.getByText('PTML')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();
  });

  it('renders the home page content by default', () => {
    render(<App />);

    expect(screen.getByText('Declarative Markup Language')).toBeInTheDocument();
    expect(screen.getByText('Build web prototypes with simple, readable markup')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(<App />);

    expect(screen.getByText('Built with PTML')).toBeInTheDocument();
  });

  it('navigates to Getting Started when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Getting Started'));

    expect(screen.getByText('Node Categories')).toBeInTheDocument();
    expect(screen.getByText('Your First PTML')).toBeInTheDocument();
  });

  it('navigates to Reference when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Reference'));

    expect(screen.getByText('Language Reference')).toBeInTheDocument();
    expect(screen.getByText('Root Declarations')).toBeInTheDocument();
  });

  it('navigates back to Home from another page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Reference'));
    expect(screen.getByText('Language Reference')).toBeInTheDocument();

    await user.click(screen.getByText('Home'));
    expect(screen.getByText('Build web prototypes with simple, readable markup')).toBeInTheDocument();
  });

  it('renders the home page feature cards', () => {
    render(<App />);

    expect(screen.getByText('Declarative Syntax')).toBeInTheDocument();
    expect(screen.getByText('Built-in State')).toBeInTheDocument();
    expect(screen.getByText('Renders to React')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Responsive Design')).toBeInTheDocument();
    expect(screen.getByText('Expressions')).toBeInTheDocument();
  });

  it('renders the code example on the home page', () => {
    render(<App />);

    expect(screen.getByText('state:')).toBeInTheDocument();
    expect(screen.getByText('- greeting: Hello')).toBeInTheDocument();
    expect(screen.getByText('ptml:')).toBeInTheDocument();
  });

  it('renders the Getting Started page with all sections', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Getting Started'));

    expect(screen.getByText('Node Categories')).toBeInTheDocument();
    expect(screen.getByText('Your First PTML')).toBeInTheDocument();
    expect(screen.getByText('Adding State')).toBeInTheDocument();
    expect(screen.getByText('Interactivity')).toBeInTheDocument();
    expect(screen.getByText('Styling')).toBeInTheDocument();
    expect(screen.getByText('Conditionals')).toBeInTheDocument();
  });

  it('renders the Reference page with all major sections', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Reference'));

    expect(screen.getByText('Root Declarations')).toBeInTheDocument();
    expect(screen.getByText('Block Nodes')).toBeInTheDocument();
    expect(screen.getByText('Property Nodes')).toBeInTheDocument();
    expect(screen.getByText('Conditional Nodes')).toBeInTheDocument();
    expect(screen.getByText('Action Nodes')).toBeInTheDocument();
    expect(screen.getByText('Expressions')).toBeInTheDocument();
    expect(screen.getByText('Import System')).toBeInTheDocument();
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

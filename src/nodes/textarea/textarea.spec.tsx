import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { basicTextarea, textareaWithStyles, textareaWithValue, textareaInForm } from './textarea.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('Textarea (basicTextarea)', () => {
  it('validates basicTextarea', () => {
    const validation = validate(basicTextarea);
    expect(validation.isValid).toBe(true);
  });

  it('parses basicTextarea into textarea node with id', () => {
    const nodes = parse(basicTextarea);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textareaNode = ptmlNode?.children.find((node) => node.type === 'textarea');
    expect(textareaNode).toBeDefined();
    expect(textareaNode?.type).toBe('textarea');
    expect(textareaNode?.children.length).toBeGreaterThan(0);

    const idNode = textareaNode?.children.find((child) => child.type === 'id');
    expect(idNode).toBeDefined();
    expect(idNode?.data).toBe('description');
  });

  it('renders basicTextarea as a textarea element', () => {
    const node = renderPtml(basicTextarea);
    render(<div>{node}</div>);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('id', 'description');
  });
});

describe('Textarea (textareaWithStyles)', () => {
  it('validates textareaWithStyles', () => {
    const validation = validate(textareaWithStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses textareaWithStyles into textarea node with id and styles', () => {
    const nodes = parse(textareaWithStyles);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textareaNode = ptmlNode?.children.find((node) => node.type === 'textarea');
    expect(textareaNode).toBeDefined();
    expect(textareaNode?.type).toBe('textarea');

    const idNode = textareaNode?.children.find((child) => child.type === 'id');
    expect(idNode).toBeDefined();
    expect(idNode?.data).toBe('notes');

    const stylesNode = textareaNode?.children.find((child) => child.type === 'styles');
    expect(stylesNode).toBeDefined();
    expect(stylesNode?.children.length).toBeGreaterThan(0);
  });

  it('renders textareaWithStyles with applied styles', () => {
    const node = renderPtml(textareaWithStyles);
    render(<div>{node}</div>);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveStyle({ width: '100%', padding: '0.5em' });
  });
});

describe('Textarea (textareaWithValue)', () => {
  it('validates textareaWithValue', () => {
    const validation = validate(textareaWithValue);
    expect(validation.isValid).toBe(true);
  });

  it('parses textareaWithValue into state and textarea nodes', () => {
    const nodes = parse(textareaWithValue);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const stateNode = nodes.find((node) => node.type === 'state');
    expect(stateNode).toBeDefined();
    const initialNotesChild = stateNode?.children.find((c) => c.type === 'initialNotes');
    expect(initialNotesChild).toBeDefined();
    expect(initialNotesChild?.data).toBe('Some initial text');

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textareaNode = ptmlNode?.children.find((node) => node.type === 'textarea');
    expect(textareaNode).toBeDefined();

    const valueNode = textareaNode?.children.find((child) => child.type === 'value');
    expect(valueNode).toBeDefined();
    expect(valueNode?.data).toBe('$initialNotes');
  });

  it('renders textareaWithValue with initial value from state', () => {
    const node = renderPtml(textareaWithValue);
    render(<div>{node}</div>);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('Some initial text');
  });

  it('allows modifying textareaWithValue and updates state', async () => {
    const user = userEvent.setup();
    const node = renderPtml(textareaWithValue);
    render(<div>{node}</div>);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Some initial text');
    expect(textarea).not.toBeDisabled();

    await user.clear(textarea);
    await user.type(textarea, 'Modified text');

    expect(textarea.value).toBe('Modified text');
  });
});

describe('Textarea (textareaInForm)', () => {
  it('validates textareaInForm', () => {
    const validation = validate(textareaInForm);
    expect(validation.isValid).toBe(true);
  });

  it('parses textareaInForm into form, textarea, and button nodes', () => {
    const nodes = parse(textareaInForm);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const formNode = ptmlNode?.children.find((node) => node.type === 'form');
    expect(formNode).toBeDefined();

    const textareaNode = formNode?.children.find((node) => node.type === 'textarea');
    expect(textareaNode).toBeDefined();

    const idNode = textareaNode?.children.find((child) => child.type === 'id');
    expect(idNode).toBeDefined();
    expect(idNode?.data).toBe('description');
  });

  it('renders textareaInForm with textarea inside form', () => {
    const node = renderPtml(textareaInForm);
    render(<div>{node}</div>);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('updates form state when textarea value changes', async () => {
    const user = userEvent.setup();
    const node = renderPtml(textareaInForm);
    render(<div>{node}</div>);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');

    await user.type(textarea, 'Test description');

    expect(textarea.value).toBe('Test description');
  });
});

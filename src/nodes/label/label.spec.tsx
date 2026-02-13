import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { labelWithForAndText, labelWrappingCheckbox, labelInFormWithInput, labelWithStyles } from './label.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('Label (labelWithForAndText)', () => {
  it('validates labelWithForAndText', () => {
    const validation = validate(labelWithForAndText);
    expect(validation.isValid).toBe(true);
  });

  it('parses labelWithForAndText into form with label and input', () => {
    const nodes = parse(labelWithForAndText);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const formNode = ptmlNode?.children.find((node) => node.type === 'form');
    expect(formNode).toBeDefined();

    const labelNode = formNode?.children.find((node) => node.type === 'label');
    expect(labelNode).toBeDefined();

    const forNode = labelNode?.children.find((child) => child.type === 'for');
    expect(forNode).toBeDefined();
    expect(forNode?.data).toBe('email');

    const inputNode = formNode?.children.find((node) => node.type === 'input');
    expect(inputNode).toBeDefined();
    const idNode = inputNode?.children.find((child) => child.type === 'id');
    expect(idNode?.data).toBe('email');
  });

  it('renders labelWithForAndText with label element and htmlFor', () => {
    const node = renderPtml(labelWithForAndText);
    render(<div>{node}</div>);

    const label = screen.getByText('Email').closest('label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'email');

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'email');
  });
});

describe('Label (labelWrappingCheckbox)', () => {
  it('validates labelWrappingCheckbox', () => {
    const validation = validate(labelWrappingCheckbox);
    expect(validation.isValid).toBe(true);
  });

  it('parses labelWrappingCheckbox into form with label wrapping text and checkbox', () => {
    const nodes = parse(labelWrappingCheckbox);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const formNode = ptmlNode?.children.find((node) => node.type === 'form');
    expect(formNode).toBeDefined();

    const labelNode = formNode?.children.find((node) => node.type === 'label');
    expect(labelNode).toBeDefined();

    const textChild = labelNode?.children.find((child) => child.type === 'text');
    expect(textChild).toBeDefined();
    expect(textChild?.data).toBe('Accept terms');

    const checkboxChild = labelNode?.children.find((child) => child.type === 'checkbox');
    expect(checkboxChild).toBeDefined();
  });

  it('renders labelWrappingCheckbox with label wrapping text and checkbox', () => {
    const node = renderPtml(labelWrappingCheckbox);
    render(<div>{node}</div>);

    const label = screen.getByText('Accept terms').closest('label');
    expect(label).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(label).toContainElement(checkbox);
  });

  it('clicking label text toggles wrapped checkbox', async () => {
    const user = userEvent.setup();
    const node = renderPtml(labelWrappingCheckbox);
    render(<div>{node}</div>);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox).not.toBeChecked();

    const labelText = screen.getByText('Accept terms');
    await user.click(labelText);

    expect(checkbox).toBeChecked();
  });
});

describe('Label (labelInFormWithInput)', () => {
  it('validates labelInFormWithInput', () => {
    const validation = validate(labelInFormWithInput);
    expect(validation.isValid).toBe(true);
  });

  it('renders labelInFormWithInput with label associated to input via for and id', () => {
    const node = renderPtml(labelInFormWithInput);
    render(<div>{node}</div>);

    const label = screen.getByText('Name').closest('label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'name');

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'name');
  });
});

describe('Label (labelWithStyles)', () => {
  it('validates labelWithStyles', () => {
    const validation = validate(labelWithStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses labelWithStyles into label with for, text, and styles', () => {
    const nodes = parse(labelWithStyles);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const labelNode = ptmlNode?.children.find((node) => node.type === 'label');
    expect(labelNode).toBeDefined();

    const forNode = labelNode?.children.find((child) => child.type === 'for');
    expect(forNode?.data).toBe('q');

    const stylesNode = labelNode?.children.find((child) => child.type === 'styles');
    expect(stylesNode).toBeDefined();
  });

  it('renders labelWithStyles with applied styles', () => {
    const node = renderPtml(labelWithStyles);
    render(<div>{node}</div>);

    const label = screen.getByText('Search').closest('label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'q');
    expect(label).toHaveStyle({
      display: 'block',
      marginBottom: '0.5em',
      fontWeight: 'bold',
    });
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { basicRadio, radioWithSelected, radioInForm, radioWithStyles, multipleGroupsInForm } from './radio.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('Radio (basicRadio)', () => {
  it('validates basicRadio', () => {
    const validation = validate(basicRadio);
    expect(validation.isValid).toBe(true);
  });

  it('parses basicRadio into two radio nodes with name and value', () => {
    const nodes = parse(basicRadio);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const radioNodes = ptmlNode?.children.filter((node) => node.type === 'radio') || [];
    expect(radioNodes.length).toBe(2);

    const firstRadio = radioNodes[0];
    const nameNode1 = firstRadio?.children.find((child) => child.type === 'name');
    expect(nameNode1).toBeDefined();
    expect(nameNode1?.data).toBe('choice');
    const valueNode1 = firstRadio?.children.find((child) => child.type === 'value');
    expect(valueNode1).toBeDefined();
    expect(valueNode1?.data).toBe('a');

    const secondRadio = radioNodes[1];
    const nameNode2 = secondRadio?.children.find((child) => child.type === 'name');
    expect(nameNode2?.data).toBe('choice');
    const valueNode2 = secondRadio?.children.find((child) => child.type === 'value');
    expect(valueNode2?.data).toBe('b');
  });

  it('renders basicRadio as two radio inputs with same name and different values', () => {
    const node = renderPtml(basicRadio);
    render(<div>{node}</div>);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0].tagName).toBe('INPUT');
    expect(radios[0]).toHaveAttribute('name', 'choice');
    expect(radios[0]).toHaveAttribute('value', 'a');
    expect(radios[0]).toHaveAttribute('type', 'radio');
    expect(radios[1]).toHaveAttribute('name', 'choice');
    expect(radios[1]).toHaveAttribute('value', 'b');
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).not.toBeChecked();
  });

  it('selecting one radio updates form state', async () => {
    const user = userEvent.setup();
    const node = renderPtml(basicRadio);
    render(<div>{node}</div>);

    const [radioA, radioB] = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radioA).not.toBeChecked();
    expect(radioB).not.toBeChecked();

    await user.click(radioA);

    expect(radioA).toBeChecked();
    expect(radioB).not.toBeChecked();
  });
});

describe('Radio (radioWithSelected)', () => {
  it('validates radioWithSelected', () => {
    const validation = validate(radioWithSelected);
    expect(validation.isValid).toBe(true);
  });

  it('parses radioWithSelected into state and radio nodes', () => {
    const nodes = parse(radioWithSelected);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const stateNode = nodes.find((node) => node.type === 'state');
    expect(stateNode).toBeDefined();
    const choiceChild = stateNode?.children.find((c) => c.type === 'choice');
    expect(choiceChild).toBeDefined();
    expect(choiceChild?.data).toBe('a');

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const radioNodes = ptmlNode?.children.filter((node) => node.type === 'radio') || [];
    expect(radioNodes.length).toBe(2);

    const selectedNode = radioNodes[0]?.children.find((child) => child.type === 'selected');
    expect(selectedNode).toBeDefined();
    expect(selectedNode?.data).toBe('$choice');
  });

  it('renders radioWithSelected with checked state from state variable', () => {
    const node = renderPtml(radioWithSelected);
    render(<div>{node}</div>);

    const [radioA, radioB] = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radioA).toBeInTheDocument();
    expect(radioA).toBeChecked();
    expect(radioB).not.toBeChecked();
  });

  it('selecting other option updates state', async () => {
    const user = userEvent.setup();
    const node = renderPtml(radioWithSelected);
    render(<div>{node}</div>);

    const [radioA, radioB] = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radioA).toBeChecked();
    expect(radioB).not.toBeChecked();

    await user.click(radioB);

    expect(radioA).not.toBeChecked();
    expect(radioB).toBeChecked();
  });
});

describe('Radio (radioInForm)', () => {
  it('validates radioInForm', () => {
    const validation = validate(radioInForm);
    expect(validation.isValid).toBe(true);
  });

  it('parses radioInForm into form, radios, and button nodes', () => {
    const nodes = parse(radioInForm);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const formNode = ptmlNode?.children.find((node) => node.type === 'form');
    expect(formNode).toBeDefined();

    const radioNodes = formNode?.children.filter((node) => node.type === 'radio') || [];
    expect(radioNodes.length).toBe(2);

    const firstRadio = radioNodes[0];
    const nameNode = firstRadio?.children.find((child) => child.type === 'name');
    expect(nameNode?.data).toBe('size');
    const valueNode = firstRadio?.children.find((child) => child.type === 'value');
    expect(valueNode?.data).toBe('s');
  });

  it('renders radioInForm with radios inside form', () => {
    const node = renderPtml(radioInForm);
    render(<div>{node}</div>);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0].tagName).toBe('INPUT');
    expect(radios[0]).toHaveAttribute('name', 'size');
    expect(radios[0]).toHaveAttribute('value', 's');
  });

  it('selecting radio in form updates form state', async () => {
    const user = userEvent.setup();
    const node = renderPtml(radioInForm);
    render(<div>{node}</div>);

    const [radioS, radioL] = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radioS).not.toBeChecked();
    expect(radioL).not.toBeChecked();

    await user.click(radioL);

    expect(radioS).not.toBeChecked();
    expect(radioL).toBeChecked();
  });
});

describe('Radio (radioWithStyles)', () => {
  it('validates radioWithStyles', () => {
    const validation = validate(radioWithStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses radioWithStyles into radio node with styles', () => {
    const nodes = parse(radioWithStyles);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const radioNode = ptmlNode?.children.find((node) => node.type === 'radio');
    expect(radioNode).toBeDefined();

    const stylesNode = radioNode?.children.find((child) => child.type === 'styles');
    expect(stylesNode).toBeDefined();
    expect(stylesNode?.children.length).toBeGreaterThan(0);
  });

  it('renders radioWithStyles with applied styles', () => {
    const node = renderPtml(radioWithStyles);
    render(<div>{node}</div>);

    const radio = screen.getByRole('radio');
    expect(radio).toBeInTheDocument();
    expect(radio).toHaveStyle({ width: '1.5em', height: '1.5em', margin: '0.5em' });
  });
});

describe('Radio (multipleGroupsInForm)', () => {
  it('validates multipleGroupsInForm', () => {
    const validation = validate(multipleGroupsInForm);
    expect(validation.isValid).toBe(true);
  });

  it('parses multipleGroupsInForm into form with multiple radio groups', () => {
    const nodes = parse(multipleGroupsInForm);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const formNode = ptmlNode?.children.find((node) => node.type === 'form');
    expect(formNode).toBeDefined();

    const radioNodes = formNode?.children.filter((node) => node.type === 'radio') || [];
    expect(radioNodes.length).toBe(4);

    const sizeRadios = radioNodes.filter((node) => {
      const nameNode = node.children.find((child) => child.type === 'name');
      return nameNode?.data === 'size';
    });
    expect(sizeRadios.length).toBe(2);

    const colorRadios = radioNodes.filter((node) => {
      const nameNode = node.children.find((child) => child.type === 'name');
      return nameNode?.data === 'color';
    });
    expect(colorRadios.length).toBe(2);
  });

  it('renders multipleGroupsInForm with all radios', () => {
    const node = renderPtml(multipleGroupsInForm);
    render(<div>{node}</div>);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    expect(radios[0]).toHaveAttribute('name', 'size');
    expect(radios[0]).toHaveAttribute('value', 's');
    expect(radios[1]).toHaveAttribute('name', 'size');
    expect(radios[1]).toHaveAttribute('value', 'l');
    expect(radios[2]).toHaveAttribute('name', 'color');
    expect(radios[2]).toHaveAttribute('value', 'red');
    expect(radios[3]).toHaveAttribute('name', 'color');
    expect(radios[3]).toHaveAttribute('value', 'blue');
  });

  it('selecting one option in each group updates only that form field', async () => {
    const user = userEvent.setup();
    const node = renderPtml(multipleGroupsInForm);
    render(<div>{node}</div>);

    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    const [sizeS, sizeL, colorRed, colorBlue] = radios;

    await user.click(sizeL);
    expect(sizeS).not.toBeChecked();
    expect(sizeL).toBeChecked();
    expect(colorRed).not.toBeChecked();
    expect(colorBlue).not.toBeChecked();

    await user.click(colorBlue);
    expect(sizeL).toBeChecked();
    expect(colorRed).not.toBeChecked();
    expect(colorBlue).toBeChecked();
  });
});

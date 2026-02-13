import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  badIf,
  renderIf,
  ifWithoutElse,
  ifFalse,
  ifWithIsCondition,
  ifWithIsConditionFalse,
  nestedIf,
  nestedIfElseBugCase,
  nestedIfElseSibling,
} from './if.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('If nodes (badIf)', () => {
  it('validates badIf as invalid', () => {
    const validation = validate(badIf);
    expect(validation.isValid).toBe(false);
  });
});

describe('If nodes (renderIf)', () => {
  it('validates renderIf', () => {
    const validation = validate(renderIf);
    expect(validation.isValid).toBe(true);
  });

  it('parses renderIf into state, if, else, and box nodes', () => {
    const nodes = parse(renderIf);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const stateNode = nodes.find((node) => node.type === 'state');
    expect(stateNode).toBeDefined();
    const isActiveChild = stateNode?.children.find((c) => c.type === 'isActive');
    expect(isActiveChild).toBeDefined();
    expect(isActiveChild?.data).toBe('false');

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const ifNode = ptmlNode?.children.find((node) => node.type === 'if');
    expect(ifNode).toBeDefined();
    expect(ifNode?.data).toBe('$isActive');

    const elseNode = ptmlNode?.children.find((node) => node.type === 'else');
    if (!elseNode) {
      const allNodeTypes = ptmlNode?.children.map((n) => n.type).join(', ') || 'none';
      throw new Error(`Expected else node in ptml children. Found node types: ${allNodeTypes}`);
    }
    expect(elseNode.children.length).toBeGreaterThan(0);

    const boxNode = ptmlNode?.children.find((node) => node.type === 'box');
    expect(boxNode).toBeDefined();
  });

  it('renders renderIf with initial false state showing else content', () => {
    const node = renderPtml(renderIf);
    render(<div>{node}</div>);

    expect(screen.getByText('is not active')).toBeInTheDocument();
    expect(screen.queryByText('is active')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'toggle isActive' })).toBeInTheDocument();
  });

  it('toggles between if and else content when button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(renderIf);
    render(<div>{node}</div>);

    expect(screen.getByText('is not active')).toBeInTheDocument();
    expect(screen.queryByText('is active')).not.toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'toggle isActive' });
    await user.click(button);

    expect(screen.getByText('is active')).toBeInTheDocument();
    expect(screen.queryByText('is not active')).not.toBeInTheDocument();

    await user.click(button);

    expect(screen.getByText('is not active')).toBeInTheDocument();
    expect(screen.queryByText('is active')).not.toBeInTheDocument();
  });
});

describe('If nodes without else', () => {
  it('validates if without else', () => {
    const validation = validate(ifWithoutElse);
    expect(validation.isValid).toBe(true);
  });

  it('renders if without else when condition is true', () => {
    const node = renderPtml(ifWithoutElse);
    render(<div>{node}</div>);

    expect(screen.getByText('is active')).toBeInTheDocument();
  });

  it('renders nothing when if condition is false and no else', () => {
    const node = renderPtml(ifFalse);
    const { container } = render(<div>{node}</div>);

    expect(screen.queryByText('is active')).not.toBeInTheDocument();
    expect(container.textContent).toBe('');
  });
});

describe('If nodes with is condition', () => {
  it('validates if with is condition', () => {
    const validation = validate(ifWithIsCondition);
    expect(validation.isValid).toBe(true);
  });

  it('renders if branch when is condition is true', () => {
    const node = renderPtml(ifWithIsCondition);
    render(<div>{node}</div>);

    expect(screen.getByText('Categories match')).toBeInTheDocument();
    expect(screen.queryByText('Categories do not match')).not.toBeInTheDocument();
  });

  it('renders else branch when is condition is false', () => {
    const node = renderPtml(ifWithIsConditionFalse);
    render(<div>{node}</div>);

    expect(screen.getByText('Categories do not match')).toBeInTheDocument();
    expect(screen.queryByText('Categories match')).not.toBeInTheDocument();
  });
});

describe('Nested if nodes', () => {
  it('validates nested if', () => {
    const validation = validate(nestedIf);
    expect(validation.isValid).toBe(true);
  });

  it('renders nested if correctly', () => {
    const node = renderPtml(nestedIf);
    const { container } = render(<div>{node}</div>);

    const textContent = container.textContent || '';
    expect(textContent).toContain('Active');
    expect(textContent).toContain('but not Enabled');
    expect(textContent).not.toContain('and Enabled');
    expect(textContent).not.toContain('Not Active');
  });
});

describe('Nested if/else bug case', () => {
  it('validates nested if/else bug case', () => {
    const validation = validate(nestedIfElseBugCase);
    expect(validation.isValid).toBe(true);
  });

  it('renders nested if/else correctly when outer is true and inner is false', () => {
    const node = renderPtml(nestedIfElseBugCase);
    render(<div>{node}</div>);

    expect(screen.getByText('This should be rendered')).toBeInTheDocument();
  });
});

describe('Nested if/else sibling relationship', () => {
  it('validates nested if/else sibling', () => {
    const validation = validate(nestedIfElseSibling);
    expect(validation.isValid).toBe(true);
  });

  it('renders nested if/else when first is true and second is false', () => {
    const node = renderPtml(nestedIfElseSibling);
    const { container } = render(<div>{node}</div>);

    const textContent = container.textContent || '';
    expect(textContent).toContain('First is true');
    expect(textContent).toContain('Second is false (should render)');
    expect(textContent).not.toContain('Second is true');
  });
});

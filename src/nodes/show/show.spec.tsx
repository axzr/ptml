import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { validate, parse, render as renderPtml } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { TemplateArgumentErrors } from '../../errors/messages';
import {
  showWithLiteralTemplate,
  showWithArguments,
  showWithVariableArguments,
  showWithObjectArgument,
  showWithStyleOverride,
  showAsRoot,
  showWithDynamicTemplate,
  showWithNamedArguments,
  showWithNamedArgumentsReordered,
  showWithOmittedArgument,
  showWithNamedArgumentFromState,
  showWithUnknownArgument,
  showWithMixedArgumentStyles,
  showWithTooManyPositionalArguments,
} from './show.example';

describe('Show Node', () => {
  describe('Validation', () => {
    it('validates showWithLiteralTemplate', () => {
      const result = validate(showWithLiteralTemplate);
      expect(result.isValid).toBe(true);
    });

    it('validates showWithArguments', () => {
      const result = validate(showWithArguments);
      expect(result.isValid).toBe(true);
    });

    it('validates showWithVariableArguments', () => {
      const result = validate(showWithVariableArguments);
      expect(result.isValid).toBe(true);
    });

    it('validates showWithObjectArgument', () => {
      const result = validate(showWithObjectArgument);
      expect(result.isValid).toBe(true);
    });

    it('validates showWithStyleOverride', () => {
      const result = validate(showWithStyleOverride);
      expect(result.isValid).toBe(true);
    });

    it('validates showAsRoot', () => {
      const result = validate(showAsRoot);
      expect(result.isValid).toBe(true);
    });

    it('validates showWithDynamicTemplate', () => {
      const result = validate(showWithDynamicTemplate);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Parsing', () => {
    it('parses show node correctly', () => {
      const nodes = parse(showWithLiteralTemplate);
      const ptmlNode = nodes.find((n) => n.type === 'ptml');
      expect(ptmlNode).toBeDefined();
      const showNode = ptmlNode?.children.find((n) => n.type === 'show');
      expect(showNode).toBeDefined();
      expect(showNode?.data).toBe('home');
    });

    it('parses show node with arguments', () => {
      const nodes = parse(showWithArguments);
      const ptmlNode = nodes.find((n) => n.type === 'ptml');
      expect(ptmlNode).toBeDefined();
      const showNode = ptmlNode?.children.find((n) => n.type === 'show');
      expect(showNode).toBeDefined();
      expect(showNode?.data).toBe('greeting Alice 30');
    });

    it('parses show node as root', () => {
      const nodes = parse(showAsRoot);
      const ptmlNode = nodes.find((n) => n.type === 'ptml');
      expect(ptmlNode).toBeDefined();
      const showNode = ptmlNode?.children.find((n) => n.type === 'show');
      expect(showNode).toBeDefined();
      expect(showNode?.data).toBe('home');
    });
  });

  describe('Rendering', () => {
    it('renders showWithLiteralTemplate', () => {
      const node = renderPtml(showWithLiteralTemplate);
      render(<div>{node}</div>);
      expect(screen.getByText(/Welcome to the home page/)).toBeInTheDocument();
    });

    it('renders showWithArguments', () => {
      const node = renderPtml(showWithArguments);
      render(<div>{node}</div>);
      expect(screen.getByText(/Hello Alice, you are 30 years old/)).toBeInTheDocument();
    });

    it('renders showWithVariableArguments', () => {
      const node = renderPtml(showWithVariableArguments);
      render(<div>{node}</div>);
      expect(screen.getByText(/Hello Bob, you are 25 years old/)).toBeInTheDocument();
    });

    it('renders showWithObjectArgument', () => {
      const node = renderPtml(showWithObjectArgument);
      render(<div>{node}</div>);
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    });

    it('renders showAsRoot', () => {
      const node = renderPtml(showAsRoot);
      render(<div>{node}</div>);
      expect(screen.getByText(/This is the home page/)).toBeInTheDocument();
    });

    it('renders showWithDynamicTemplate', () => {
      const node = renderPtml(showWithDynamicTemplate);
      render(<div>{node}</div>);
      expect(screen.getByText(/Home page content/)).toBeInTheDocument();
    });
  });

  describe('Style Overrides', () => {
    it('applies style overrides from show node', () => {
      const node = renderPtml(showWithStyleOverride);
      render(<div>{node}</div>);
      const textElement = screen.getByText(/this is the styled template/);
      expect(textElement).toBeInTheDocument();
      const style = window.getComputedStyle(textElement);
      expect(style.color).toBe('rgb(0, 0, 255)');
      expect(style.fontSize).toBe('2em');
    });
  });
});

const textOf = (ptml: string): string => render(<div>{renderPtml(ptml)}</div>).container.textContent ?? '';

describe('show with named arguments', () => {
  it('passes a value containing spaces, which positional arguments cannot', () => {
    expect(validate(showWithNamedArguments).isValid).toBe(true);
    expect(textOf(showWithNamedArguments)).toBe('[Back in stock soon] [primary]');
  });

  it('does not care what order the arguments are written in', () => {
    expect(textOf(showWithNamedArgumentsReordered)).toBe('[Back in stock soon] [primary]');
  });

  it('leaves an omitted parameter empty rather than complaining', () => {
    expect(validate(showWithOmittedArgument).isValid).toBe(true);
    expect(textOf(showWithOmittedArgument)).toBe('[Back in stock soon] []');
  });

  it('resolves a named argument given as a state reference', () => {
    expect(textOf(showWithNamedArgumentFromState)).toBe('[Back in stock soon]');
  });

  it('rejects an argument the template has no parameter for', () => {
    const validation = validate(showWithUnknownArgument);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      TemplateArgumentErrors.unknownArgument,
      0,
      'labl',
      'badge',
      'Its parameters are: label',
    );
  });

  it('rejects mixing positional and named arguments in one call', () => {
    const validation = validate(showWithMixedArgumentStyles);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, TemplateArgumentErrors.mixedArgumentStyles, 0);
  });
});

describe('show with positional arguments', () => {
  it('rejects more arguments than the template has parameters, which were silently dropped', () => {
    const validation = validate(showWithTooManyPositionalArguments);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, TemplateArgumentErrors.tooManyArguments, 0, 'badge', 1, 4);
  });

  it('still accepts fewer arguments than parameters, so parameters stay optional', () => {
    const ptml = `template: badge label kind\n> text: [$label] [$kind]\n\nptml:\n> show: badge New\n`;
    expect(validate(ptml).isValid).toBe(true);
    expect(textOf(ptml)).toBe('[New] []');
  });
});

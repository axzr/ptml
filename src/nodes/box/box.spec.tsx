import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  emptyBox,
  simpleTextBox,
  twoTexts,
  twoTextsNoColon,
  nestedBoxesInvalid,
  nestedBoxesValid,
  complexBox,
  boxWithRoleMain,
  boxWithRoleHeader,
  boxWithRoleArticle,
  boxWithInvalidRole,
} from './box.example';
import { render as renderPtml, validate } from '../../index';

describe('Boxes', () => {
  it('validates empty box', () => {
    const validation = validate(emptyBox);
    expect(validation.isValid).toBe(true);
  });

  it('renders empty box', () => {
    const node = renderPtml(emptyBox);
    const { container } = render(<div>{node}</div>);
    const divs = container.querySelectorAll('div');
    const boxDiv = Array.from(divs).find((div) => div.children.length === 0 && div.textContent === '');
    expect(boxDiv).toBeInTheDocument();
    expect(boxDiv?.children.length).toBe(0);
    expect(boxDiv?.textContent).toBe('');
  });

  it('validates simple text box', () => {
    const validation = validate(simpleTextBox);
    expect(validation.isValid).toBe(true);
  });

  it('renders simple text box', () => {
    const node = renderPtml(simpleTextBox);
    render(<div>{node}</div>);
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('validates two texts box', () => {
    const validation = validate(twoTexts);
    expect(validation.isValid).toBe(true);
  });

  it('renders two texts box', () => {
    const node = renderPtml(twoTexts);
    const { container } = render(<div>{node}</div>);
    expect(container.textContent).toContain('hello world');
    expect(container.textContent).toContain('goodbye world');
  });

  it('validates two texts no colon box', () => {
    const validation = validate(twoTextsNoColon);
    expect(validation.isValid).toBe(true);
  });

  it('renders two texts no colon box', () => {
    const node = renderPtml(twoTextsNoColon);
    const { container } = render(<div>{node}</div>);
    expect(container.textContent).toContain('nodes without data');
    expect(container.textContent).toContain('are valid with or without a colon');
    expect(container.textContent).toContain('but there must be nothing else on that line');
  });

  it('rejects nested boxes (invalid format)', () => {
    const validation = validate(nestedBoxesInvalid);
    expect(validation.isValid).toBe(false);
  });

  it('validates nested boxes (valid format)', () => {
    const validation = validate(nestedBoxesValid);
    expect(validation.isValid).toBe(true);
  });

  it('renders nested boxes', () => {
    const node = renderPtml(nestedBoxesValid);
    const { container } = render(<div>{node}</div>);
    expect(container.textContent).toContain('hello world');
    expect(container.textContent).toContain('nested hello world');
  });

  it('validates complex box', () => {
    const validation = validate(complexBox);
    expect(validation.isValid).toBe(true);
  });

  it('renders complex box with all text content', () => {
    const node = renderPtml(complexBox);
    const { container } = render(<div>{node}</div>);
    expect(container.textContent).toContain('hello world');
    expect(container.textContent).toContain('nested hello world');
    expect(container.textContent).toContain('nested nested hello world');
    expect(container.textContent).toContain('nested sibling');
    expect(container.textContent).toContain('nested sibling2');
    expect(container.textContent).toContain('nested nested sibling');
    expect(container.textContent).toContain('nested nested sibling2');
    expect(container.textContent).toContain('check that we drop back');
    expect(container.textContent).toContain('second root level box');
    expect(container.textContent).toContain('second root level nested hello world');
    expect(container.textContent).toContain('second root level nested nested hello world');
    expect(container.textContent).toContain('second root level nested nested nested hello world');
  });

  it('validates box with role main', () => {
    const validation = validate(boxWithRoleMain);
    expect(validation.isValid).toBe(true);
  });

  it('renders box with role main as main element', () => {
    const node = renderPtml(boxWithRoleMain);
    const { container } = render(<div>{node}</div>);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent('Main content');
  });

  it('renders box with role header as header element', () => {
    const node = renderPtml(boxWithRoleHeader);
    const { container } = render(<div>{node}</div>);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Header content');
  });

  it('renders box with role article as article element', () => {
    const node = renderPtml(boxWithRoleArticle);
    const { container } = render(<div>{node}</div>);
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
    expect(article).toHaveTextContent('Article content');
  });

  it('renders box without role as div', () => {
    const node = renderPtml(simpleTextBox);
    const { container } = render(<div>{node}</div>);
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThan(0);
    expect(container.querySelector('main')).not.toBeInTheDocument();
    expect(container.querySelector('header')).not.toBeInTheDocument();
  });

  it('rejects box with invalid role', () => {
    const validation = validate(boxWithInvalidRole);
    expect(validation.isValid).toBe(false);
    if (!validation.isValid) {
      expect(validation.errorMessage).toContain('role');
    }
  });
});

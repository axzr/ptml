import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  basicLink,
  linkWithText,
  linkWithStateBoundHref,
  linkWithTarget,
  linkWithStyles,
  linkWithChild,
  linkWithClick,
} from './link.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('Link (basicLink)', () => {
  it('validates basicLink', () => {
    const validation = validate(basicLink);
    expect(validation.isValid).toBe(true);
  });

  it('parses basicLink into link node with href', () => {
    const nodes = parse(basicLink);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const linkNode = ptmlNode?.children.find((node) => node.type === 'link');
    expect(linkNode).toBeDefined();
    expect(linkNode?.type).toBe('link');

    const hrefNode = linkNode?.children.find((child) => child.type === 'href');
    expect(hrefNode).toBeDefined();
    expect(hrefNode?.data).toBe('https://example.com');
  });

  it('renders basicLink as an anchor element with href', () => {
    const node = renderPtml(basicLink);
    render(<div>{node}</div>);

    const anchor = screen.getByRole('link', { name: '' });
    expect(anchor).toBeInTheDocument();
    expect(anchor.tagName).toBe('A');
    expect(anchor).toHaveAttribute('href', 'https://example.com');
  });
});

describe('Link (linkWithText)', () => {
  it('validates linkWithText', () => {
    const validation = validate(linkWithText);
    expect(validation.isValid).toBe(true);
  });

  it('parses linkWithText into link node with href and text', () => {
    const nodes = parse(linkWithText);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const linkNode = ptmlNode?.children.find((node) => node.type === 'link');
    expect(linkNode).toBeDefined();

    const hrefNode = linkNode?.children.find((child) => child.type === 'href');
    expect(hrefNode?.data).toBe('/about');

    const textNode = linkNode?.children.find((child) => child.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('About');
  });

  it('renders linkWithText with href and text content', () => {
    const node = renderPtml(linkWithText);
    render(<div>{node}</div>);

    const anchor = screen.getByRole('link', { name: 'About' });
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', '/about');
    expect(anchor).toHaveTextContent('About');
  });
});

describe('Link (linkWithStateBoundHref)', () => {
  it('validates linkWithStateBoundHref', () => {
    const validation = validate(linkWithStateBoundHref);
    expect(validation.isValid).toBe(true);
  });

  it('parses linkWithStateBoundHref into state and link nodes', () => {
    const nodes = parse(linkWithStateBoundHref);
    const stateNode = nodes.find((node) => node.type === 'state');
    expect(stateNode).toBeDefined();

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const linkNode = ptmlNode?.children.find((node) => node.type === 'link');
    expect(linkNode).toBeDefined();

    const hrefNode = linkNode?.children.find((child) => child.type === 'href');
    expect(hrefNode?.data).toBe('$url');
  });

  it('renders linkWithStateBoundHref with resolved href from state', () => {
    const node = renderPtml(linkWithStateBoundHref);
    render(<div>{node}</div>);

    const anchor = screen.getByRole('link', { name: 'Dynamic link' });
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', 'https://example.com/dynamic');
  });
});

describe('Link (linkWithTarget)', () => {
  it('validates linkWithTarget', () => {
    const validation = validate(linkWithTarget);
    expect(validation.isValid).toBe(true);
  });

  it('parses linkWithTarget into link node with href, target, and text', () => {
    const nodes = parse(linkWithTarget);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const linkNode = ptmlNode?.children.find((node) => node.type === 'link');
    expect(linkNode).toBeDefined();

    const targetNode = linkNode?.children.find((child) => child.type === 'target');
    expect(targetNode).toBeDefined();
    expect(targetNode?.data).toBe('_blank');
  });

  it('renders linkWithTarget with href and target attributes', () => {
    const node = renderPtml(linkWithTarget);
    render(<div>{node}</div>);

    const anchor = screen.getByRole('link', { name: 'Open in new tab' });
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', 'https://example.com');
    expect(anchor).toHaveAttribute('target', '_blank');
  });
});

describe('Link (linkWithStyles)', () => {
  it('validates linkWithStyles', () => {
    const validation = validate(linkWithStyles);
    expect(validation.isValid).toBe(true);
  });

  it('renders linkWithStyles with applied styles', () => {
    const node = renderPtml(linkWithStyles);
    render(<div>{node}</div>);

    const anchor = screen.getByRole('link', { name: 'Styled link' });
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveStyle({
      color: 'rgb(0, 0, 255)',
      textDecoration: 'underline',
    });
  });
});

describe('Link (linkWithChild)', () => {
  it('validates linkWithChild', () => {
    const validation = validate(linkWithChild);
    expect(validation.isValid).toBe(true);
  });

  it('parses linkWithChild into link node with href and text block child', () => {
    const nodes = parse(linkWithChild);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const linkNode = ptmlNode?.children.find((node) => node.type === 'link');
    expect(linkNode).toBeDefined();

    const textBlock = linkNode?.children.find((child) => child.type === 'text');
    expect(textBlock).toBeDefined();
    expect(textBlock?.data).toBe('Click here');
  });

  it('renders linkWithChild with block child as content', () => {
    const node = renderPtml(linkWithChild);
    render(<div>{node}</div>);

    const anchor = screen.getByRole('link', { name: 'Click here' });
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', 'https://example.com');
    expect(anchor).toHaveTextContent('Click here');
  });
});

describe('Link (linkWithClick)', () => {
  it('validates linkWithClick', () => {
    const validation = validate(linkWithClick);
    expect(validation.isValid, !validation.isValid ? validation.errorMessage : undefined).toBe(true);
  });

  it('parses linkWithClick into link nodes with click handlers', () => {
    const nodes = parse(linkWithClick);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const showNode = ptmlNode?.children.find((node) => node.type === 'show');
    expect(showNode).toBeDefined();
    expect(showNode?.data).toBe('$page');

    const homeTemplate = nodes.find((n) => n.type === 'template' && n.data?.trim().startsWith('home'));
    expect(homeTemplate).toBeDefined();
    const linkNode = homeTemplate?.children.find((node) => node.type === 'link');
    expect(linkNode).toBeDefined();

    const clickNode = linkNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();

    const setNode = clickNode?.children.find((child) => child.type === 'set');
    expect(setNode).toBeDefined();
    expect(setNode?.data).toBe('$page shop');
  });

  it('renders linkWithClick with initial home page and link to shop', () => {
    const node = renderPtml(linkWithClick);
    render(<div>{node}</div>);

    expect(screen.getByText('Home page')).toBeInTheDocument();
    const goToShopLink = screen.getByRole('link', { name: 'Go to shop' });
    expect(goToShopLink).toBeInTheDocument();
    expect(goToShopLink).toHaveAttribute('href', '#');
  });

  it('navigates to shop when Go to shop link is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(linkWithClick);
    render(<div>{node}</div>);

    expect(screen.getByText('Home page')).toBeInTheDocument();
    const goToShopLink = screen.getByRole('link', { name: 'Go to shop' });
    await user.click(goToShopLink);

    expect(screen.getByText('Shop page')).toBeInTheDocument();
    expect(screen.queryByText('Home page')).not.toBeInTheDocument();
  });

  it('navigates back to home when Go to home link is clicked after navigating to shop', async () => {
    const user = userEvent.setup();
    const node = renderPtml(linkWithClick);
    render(<div>{node}</div>);

    await user.click(screen.getByRole('link', { name: 'Go to shop' }));
    expect(screen.getByText('Shop page')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Go to home' }));
    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Shop page')).not.toBeInTheDocument();
  });
});

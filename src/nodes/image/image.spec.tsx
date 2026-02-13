import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  basicImage,
  imageWithAlt,
  imageWithStyles,
  imageWithStateBoundSrc,
  imageWithStateBoundAlt,
} from './image.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('Image (basicImage)', () => {
  it('validates basicImage', () => {
    const validation = validate(basicImage);
    expect(validation.isValid).toBe(true);
  });

  it('parses basicImage into image node with src', () => {
    const nodes = parse(basicImage);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const imageNode = ptmlNode?.children.find((node) => node.type === 'image');
    expect(imageNode).toBeDefined();
    expect(imageNode?.type).toBe('image');

    const srcNode = imageNode?.children.find((child) => child.type === 'src');
    expect(srcNode).toBeDefined();
    expect(srcNode?.data).toBe('https://example.com/photo.jpg');
  });

  it('renders basicImage as an img element with src', () => {
    const node = renderPtml(basicImage);
    render(<div>{node}</div>);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });
});

describe('Image (imageWithAlt)', () => {
  it('validates imageWithAlt', () => {
    const validation = validate(imageWithAlt);
    expect(validation.isValid).toBe(true);
  });

  it('parses imageWithAlt into image node with src and alt', () => {
    const nodes = parse(imageWithAlt);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const imageNode = ptmlNode?.children.find((node) => node.type === 'image');
    expect(imageNode).toBeDefined();

    const srcNode = imageNode?.children.find((child) => child.type === 'src');
    expect(srcNode?.data).toBe('https://example.com/photo.jpg');

    const altNode = imageNode?.children.find((child) => child.type === 'alt');
    expect(altNode).toBeDefined();
    expect(altNode?.data).toBe('A sample photo');
  });

  it('renders imageWithAlt with src and alt attributes', () => {
    const node = renderPtml(imageWithAlt);
    render(<div>{node}</div>);

    const img = screen.getByRole('img', { name: 'A sample photo' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'A sample photo');
  });
});

describe('Image (imageWithStyles)', () => {
  it('validates imageWithStyles', () => {
    const validation = validate(imageWithStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses imageWithStyles into image node with src, alt, and styles', () => {
    const nodes = parse(imageWithStyles);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const imageNode = ptmlNode?.children.find((node) => node.type === 'image');
    expect(imageNode).toBeDefined();

    const stylesNode = imageNode?.children.find((child) => child.type === 'styles');
    expect(stylesNode).toBeDefined();
    expect(stylesNode?.children.length).toBeGreaterThan(0);
  });

  it('renders imageWithStyles with applied styles', () => {
    const node = renderPtml(imageWithStyles);
    render(<div>{node}</div>);

    const img = screen.getByRole('img', { name: 'Styled photo' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveStyle({
      width: '200px',
      height: '150px',
      objectFit: 'cover',
    });
  });
});

describe('Image (imageWithStateBoundSrc)', () => {
  it('validates imageWithStateBoundSrc', () => {
    const validation = validate(imageWithStateBoundSrc);
    expect(validation.isValid).toBe(true);
  });

  it('parses imageWithStateBoundSrc into state and image nodes', () => {
    const nodes = parse(imageWithStateBoundSrc);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const stateNode = nodes.find((node) => node.type === 'state');
    expect(stateNode).toBeDefined();

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const imageNode = ptmlNode?.children.find((node) => node.type === 'image');
    expect(imageNode).toBeDefined();

    const srcNode = imageNode?.children.find((child) => child.type === 'src');
    expect(srcNode?.data).toBe('$imageUrl');
  });

  it('renders imageWithStateBoundSrc with resolved src from state', () => {
    const node = renderPtml(imageWithStateBoundSrc);
    render(<div>{node}</div>);

    const img = screen.getByRole('img', { name: 'Dynamic image' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/dynamic.jpg');
    expect(img).toHaveAttribute('alt', 'Dynamic image');
  });
});

describe('Image (imageWithStateBoundAlt)', () => {
  it('validates imageWithStateBoundAlt', () => {
    const validation = validate(imageWithStateBoundAlt);
    expect(validation.isValid).toBe(true);
  });

  it('renders imageWithStateBoundAlt with resolved alt from state', () => {
    const node = renderPtml(imageWithStateBoundAlt);
    render(<div>{node}</div>);

    const img = screen.getByRole('img', { name: 'Logo for Brand' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
    expect(img).toHaveAttribute('alt', 'Logo for Brand');
  });
});

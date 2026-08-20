import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

import { render as ptmlRender, validate } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { SvgErrors, ChildrenErrors } from '../../errors/messages';
import {
  svgCheckIcon,
  svgDecorative,
  svgEveryShape,
  svgSizedByBreakpoint,
  svgPathFromState,
  svgWithoutViewBox,
  svgPathWithoutD,
  svgRectWithoutHeight,
  svgMistypedAttribute,
  svgShapeOutsideSvg,
} from './svg.example';

const renderSvg = (ptml: string, viewportWidth?: number): SVGSVGElement => {
  const { container } = render(<div>{ptmlRender(ptml, undefined, viewportWidth)}</div>);
  const svg = container.querySelector('svg');
  expect(svg).not.toBeNull();
  return svg as SVGSVGElement;
};

describe('svg', () => {
  it('renders an inline svg element, not an image', () => {
    const svg = renderSvg(svgDecorative);
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
  });

  it('keeps currentColor intact so the icon inherits the surrounding colour', () => {
    const svg = renderSvg(svgCheckIcon);
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    // Inline, so the coloured ancestor is a real DOM parent it can inherit from.
    expect(svg.closest('[style*="color"]')).not.toBeNull();
  });

  it('converts kebab-cased attributes to the correct SVG attribute names', () => {
    const svg = renderSvg(svgCheckIcon);
    expect(svg.getAttribute('stroke-width')).toBe('2');
    expect(svg.getAttribute('stroke-linecap')).toBe('round');
    expect(svg.getAttribute('stroke-linejoin')).toBe('round');
  });

  it('renders without React complaining about any attribute', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderSvg(svgEveryShape);
    renderSvg(svgCheckIcon);
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('renders every shape type with its geometry', () => {
    const svg = renderSvg(svgEveryShape);
    expect(svg.querySelector('path')?.getAttribute('d')).toBe('M3 12h18');
    expect(svg.querySelector('circle')?.getAttribute('r')).toBe('10');
    expect(svg.querySelector('ellipse')?.getAttribute('rx')).toBe('4');
    expect(svg.querySelector('rect')?.getAttribute('height')).toBe('4');
    expect(svg.querySelector('line')?.getAttribute('x2')).toBe('9');
    expect(svg.querySelector('polygon')?.getAttribute('points')).toBe('12 2 22 22 2 22');
  });

  it('renders group as an SVG g element that nests its own shapes', () => {
    const group = renderSvg(svgEveryShape).querySelector('g');
    expect(group).not.toBeNull();
    expect(group?.getAttribute('transform')).toBe('translate(4 4)');
    expect(group?.querySelector('path')?.getAttribute('d')).toBe('M0 0h4');
  });

  it('resolves a $state reference in path data', () => {
    expect(renderSvg(svgPathFromState).querySelector('path')?.getAttribute('d')).toBe('M3 12h18');
  });

  it('participates in named styles and breakpoints like any other block', () => {
    expect(renderSvg(svgSizedByBreakpoint, 375).getAttribute('style')).toContain('width: 16px');
    expect(renderSvg(svgSizedByBreakpoint, 1440).getAttribute('style')).toContain('width: 32px');
  });
});

describe('svg accessibility', () => {
  it('names the icon with a title element when one is given', () => {
    const svg = renderSvg(svgCheckIcon);
    expect(svg.getAttribute('role')).toBe('img');
    // The title must come first to act as the accessible name.
    expect(svg.firstElementChild?.tagName.toLowerCase()).toBe('title');
    expect(svg.querySelector('title')?.textContent).toBe('Done');
  });

  it('marks an untitled icon decorative so screen readers skip it', () => {
    const svg = renderSvg(svgDecorative);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelector('title')).toBeNull();
  });
});

describe('svg validation', () => {
  it('rejects an svg with no viewBox, which would render clipped rather than scaled', () => {
    const validation = validate(svgWithoutViewBox);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, SvgErrors.missingViewBox, 0);
  });

  it('rejects a shape missing the geometry without which it draws nothing', () => {
    const validation = validate(svgPathWithoutD);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, SvgErrors.missingGeometry, 'path', 0, 'd');
  });

  it('names every missing geometry attribute at once', () => {
    const validation = validate(svgRectWithoutHeight);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, SvgErrors.missingGeometry, 'rect', 0, 'height');
  });

  it('rejects a mistyped attribute rather than silently dropping it', () => {
    const validation = validate(svgMistypedAttribute);
    expect(validation.isValid).toBe(false);
    expect(validation.isValid === false && validation.errorMessage).toContain('strokewidth');
  });

  it('rejects a shape used outside an svg', () => {
    const validation = validate(svgShapeOutsideSvg);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ChildrenErrors.wrongChildType,
      'box',
      0,
      'path',
      'blocks or properties or conditionals',
    );
  });
});

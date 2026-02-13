import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { render as ptmlRender } from '../../renderers/render';
import { breakpointRendersWithViewport, breakpointRendersNothingWhenViewportOmitted } from './breakpoint.example';

describe('breakpoint block', () => {
  it('renders children when viewportWidth matches breakpoint condition', () => {
    const node = ptmlRender(breakpointRendersWithViewport, undefined, 500);
    expect(node).not.toBeNull();
    const { container } = render(<div>{node}</div>);
    expect(container.textContent).toContain('narrow');
    expect(container.textContent).not.toContain('wide');
  });

  it('renders large breakpoint content when viewportWidth >= 1024', () => {
    const node = ptmlRender(breakpointRendersWithViewport, undefined, 1200);
    expect(node).not.toBeNull();
    const { container } = render(<div>{node}</div>);
    expect(container.textContent).toContain('wide');
    expect(container.textContent).not.toContain('narrow');
  });

  it('renders nothing from breakpoint blocks when viewportWidth is omitted', () => {
    const node = ptmlRender(breakpointRendersNothingWhenViewportOmitted);
    expect(node).not.toBeNull();
    const { container } = render(<div>{node}</div>);
    expect(container.textContent).not.toContain('narrow');
    expect(container.textContent).not.toContain('wide');
  });
});

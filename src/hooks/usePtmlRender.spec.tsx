import { describe, it, expect, afterEach } from 'vitest';
import { act, render, renderHook } from '@testing-library/react';

import { usePtmlRender } from './usePtmlRender';

const responsivePtml = `
breakpoints:
- mobile: 768
- desktop:

define: hero
- font-size: 45px
> breakpoint: desktop
  - font-size: 80px

ptml:
> box:
  - styles: hero
  > text: Title
  > breakpoint: desktop
    > text: DesktopOnly
`;

const setWindowWidth = (width: number): void => {
  (window as unknown as { innerWidth: number }).innerWidth = width;
  window.dispatchEvent(new Event('resize'));
};

const originalWidth = window.innerWidth;

afterEach(() => {
  (window as unknown as { innerWidth: number }).innerWidth = originalWidth;
});

const renderedHtml = (node: React.ReactNode): string => render(<div>{node}</div>).container.innerHTML;

describe('usePtmlRender viewport width', () => {
  it('resolves breakpoints against the window width when none is supplied', () => {
    (window as unknown as { innerWidth: number }).innerWidth = 1440;
    const { result } = renderHook(() => usePtmlRender(responsivePtml));

    expect(result.current.error).toBeNull();
    const html = renderedHtml(result.current.node);
    expect(html).toContain('font-size: 80px');
    expect(html).toContain('DesktopOnly');
  });

  it('falls back to base styles below the breakpoint, without the desktop-only block', () => {
    (window as unknown as { innerWidth: number }).innerWidth = 375;
    const { result } = renderHook(() => usePtmlRender(responsivePtml));

    const html = renderedHtml(result.current.node);
    expect(html).toContain('font-size: 45px');
    expect(html).not.toContain('DesktopOnly');
  });

  it('re-resolves breakpoints when the window is resized', () => {
    (window as unknown as { innerWidth: number }).innerWidth = 375;
    const { result } = renderHook(() => usePtmlRender(responsivePtml));

    expect(renderedHtml(result.current.node)).not.toContain('DesktopOnly');

    act(() => setWindowWidth(1440));

    expect(renderedHtml(result.current.node)).toContain('DesktopOnly');
  });

  it('prefers an explicitly supplied viewportWidth over the window width', () => {
    (window as unknown as { innerWidth: number }).innerWidth = 1440;
    const { result } = renderHook(() => usePtmlRender(responsivePtml, { viewportWidth: 375 }));

    const html = renderedHtml(result.current.node);
    expect(html).toContain('font-size: 45px');
    expect(html).not.toContain('DesktopOnly');
  });

  it('ignores window resizes while an explicit viewportWidth is supplied', () => {
    (window as unknown as { innerWidth: number }).innerWidth = 375;
    const { result } = renderHook(() => usePtmlRender(responsivePtml, { viewportWidth: 375 }));

    act(() => setWindowWidth(1440));

    expect(renderedHtml(result.current.node)).not.toContain('DesktopOnly');
  });
});

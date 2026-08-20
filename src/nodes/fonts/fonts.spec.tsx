import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

import { render as ptmlRender, validate } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { ChildrenErrors, FontsErrors } from '../../errors/messages';
import { findUnavailableFonts } from './fontLoadCheck';
import {
  fontsSingleFamily,
  fontsWithWeightsAndItalic,
  fontsEmpty,
  fontsDuplicateFamily,
  fontsMissingFamily,
  fontsInvalidWeights,
  fontsFamilyWithColon,
} from './fonts.example';

const renderPtml = (ptml: string, onFontsUnavailable?: (families: string[]) => void): HTMLElement =>
  render(<div>{ptmlRender(ptml, undefined, undefined, undefined, onFontsUnavailable)}</div>).container;

// jsdom implements no CSS Font Loading API at all, so the browser's side of this
// has to be stood up by hand. loadedFamilies is what the "browser" knows about.
const installFontFaceSet = (loadedFamilies: string[]): void => {
  (document as unknown as { fonts: unknown }).fonts = {
    ready: Promise.resolve(),
    load: (font: string) => {
      const family = font.match(/"([^"]+)"/)?.[1] ?? '';
      return Promise.resolve(loadedFamilies.includes(family) ? [{ family }] : []);
    },
  };
};

const removeFontFaceSet = (): void => {
  delete (document as unknown as { fonts?: unknown }).fonts;
};

afterEach(() => {
  removeFontFaceSet();
  vi.restoreAllMocks();
});

describe('fonts declaration', () => {
  it('emits a Google Fonts stylesheet link for the declared families', () => {
    const link = renderPtml(fontsSingleFamily).querySelector('link[rel="stylesheet"]');
    expect(link?.getAttribute('href')).toBe('https://fonts.googleapis.com/css2?family=Inter:wght@400&display=block');
  });

  it('combines several families, weights and italics into one request', () => {
    const link = renderPtml(fontsWithWeightsAndItalic).querySelector('link[rel="stylesheet"]');
    expect(link?.getAttribute('href')).toBe(
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;700' +
        '&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=block',
    );
  });

  it('preconnects to the font file origin so the block period stays short', () => {
    const preconnect = renderPtml(fontsSingleFamily).querySelector('link[rel="preconnect"]');
    expect(preconnect?.getAttribute('href')).toBe('https://fonts.gstatic.com');
    expect(preconnect?.getAttribute('crossorigin')).toBe('anonymous');
  });

  it('still renders the document itself alongside the font links', () => {
    expect(renderPtml(fontsSingleFamily).textContent).toContain('Hello');
  });
});

describe('fonts validation', () => {
  it('accepts a family with no weights, defaulting to 400', () => {
    expect(validate(fontsSingleFamily).isValid).toBe(true);
  });

  it('rejects a fonts declaration with no families', () => {
    const validation = validate(fontsEmpty);
    expect(validation.isValid).toBe(false);
    expect(validation.isValid === false && validation.errorMessage).toBe(
      ChildrenErrors.minimumChildrenRequired('fonts', 1, ['font']),
    );
  });

  it('rejects the same family listed twice, which would silently drop one entry', () => {
    const validation = validate(fontsDuplicateFamily);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, FontsErrors.duplicateFamily, 0, 'Inter', 0);
  });

  it('rejects a font entry with no family name', () => {
    expect(validate(fontsMissingFamily).isValid).toBe(false);
  });

  it('rejects a weight that is not 100 to 900 in hundreds', () => {
    const validation = validate(fontsInvalidWeights);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, FontsErrors.invalidVariants, 0, 'bold');
  });

  it('rejects a family name containing characters that would break the request URL', () => {
    const validation = validate(fontsFamilyWithColon);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, FontsErrors.familyInvalid, 0, 'Inter:400');
  });
});

describe('font load checking', () => {
  it('reports nothing when every declared family loaded', async () => {
    installFontFaceSet(['Inter']);
    expect(await findUnavailableFonts([{ family: 'Inter', weights: [400], italic: false }])).toEqual([]);
  });

  it('reports a family the browser has no loaded face for, whatever the cause', async () => {
    installFontFaceSet([]);
    expect(await findUnavailableFonts([{ family: 'Intre', weights: [400], italic: false }])).toEqual(['Intre']);
  });

  it('reports a family whose load call rejects outright', async () => {
    (document as unknown as { fonts: unknown }).fonts = {
      ready: Promise.resolve(),
      load: () => Promise.reject(new Error('blocked')),
    };
    expect(await findUnavailableFonts([{ family: 'Inter', weights: [400], italic: false }])).toEqual(['Inter']);
  });

  it('stays silent where the browser has no font loading API rather than crying wolf', async () => {
    removeFontFaceSet();
    expect(await findUnavailableFonts([{ family: 'Inter', weights: [400], italic: false }])).toEqual([]);
  });

  it('warns on the console and calls the host callback when a font is missing', async () => {
    installFontFaceSet([]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onFontsUnavailable = vi.fn();

    renderPtml(fontsSingleFamily, onFontsUnavailable);

    await waitFor(() => expect(onFontsUnavailable).toHaveBeenCalledWith(['Inter']));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"Inter"'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('did not load'));
  });

  it('says nothing when the fonts did load', async () => {
    installFontFaceSet(['Inter']);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onFontsUnavailable = vi.fn();

    renderPtml(fontsSingleFamily, onFontsUnavailable);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onFontsUnavailable).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});

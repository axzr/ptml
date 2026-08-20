import React, { useEffect } from 'react';

import type { FontRequest } from './googleFonts';

type FontFaceSetLike = {
  ready: Promise<unknown>;
  load: (font: string, text?: string) => Promise<unknown[]>;
};

const getFontFaceSet = (): FontFaceSetLike | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const fonts = (document as unknown as { fonts?: FontFaceSetLike }).fonts;
  // Absent during server rendering, in jsdom, and in older browsers. No signal
  // is better than a false alarm, so skip the check entirely.
  return fonts && typeof fonts.load === 'function' ? fonts : null;
};

// document.fonts holds faces declared by @font-face rules -- including ones from
// Google's stylesheet -- and NOT locally installed system fonts. So an empty
// result means the webfont genuinely did not load, whatever the cause: a
// misspelled family, a blocked request, an offline machine. Deliberately load()
// rather than check(), because check() can report success by falling back to a
// system font of the same name, which is the exact false negative this is for.
export const findUnavailableFonts = async (requests: FontRequest[]): Promise<string[]> => {
  const fonts = getFontFaceSet();
  if (!fonts || requests.length === 0) {
    return [];
  }
  await fonts.ready;

  const unavailable: string[] = [];
  for (const request of requests) {
    const weight = request.weights[0] ?? 400;
    try {
      const loaded = await fonts.load(`${weight} 1em "${request.family}"`);
      if (loaded.length === 0) {
        unavailable.push(request.family);
      }
    } catch {
      unavailable.push(request.family);
    }
  }
  return unavailable;
};

export const describeUnavailableFonts = (families: string[]): string =>
  `PTML: ${families.length === 1 ? 'font' : 'fonts'} ${families.map((f) => `"${f}"`).join(', ')} did not load. ` +
  `Text using ${families.length === 1 ? 'it' : 'them'} is falling back to another font, so spacing and line breaks ` +
  `will not match the real design. Check the family name is spelled as Google Fonts spells it, and that the page can ` +
  `reach ${'fonts.googleapis.com'}.`;

type FontLoadCheckProps = {
  requests: FontRequest[];
  onFontsUnavailable?: (families: string[]) => void;
};

export const FontLoadCheck: React.FC<FontLoadCheckProps> = ({ requests, onFontsUnavailable }) => {
  const signature = requests.map((r) => `${r.family}:${r.weights.join(',')}`).join('|');

  useEffect(() => {
    let cancelled = false;
    void findUnavailableFonts(requests).then((families) => {
      if (cancelled || families.length === 0) {
        return;
      }
      console.warn(describeUnavailableFonts(families));
      onFontsUnavailable?.(families);
    });
    return () => {
      cancelled = true;
    };
    // requests is rebuilt each render from the parsed document; signature is its
    // stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, onFontsUnavailable]);

  return null;
};

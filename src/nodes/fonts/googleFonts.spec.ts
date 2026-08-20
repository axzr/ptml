import { describe, it, expect } from 'vitest';
import { parseFontVariants, buildGoogleFontsUrl } from './googleFonts';

describe('parseFontVariants', () => {
  it('defaults to weight 400 when none are given', () => {
    expect(parseFontVariants('')).toEqual({ weights: [400], italic: false, invalid: [] });
    expect(parseFontVariants(undefined)).toEqual({ weights: [400], italic: false, invalid: [] });
  });

  it('reads weights and the italic marker', () => {
    expect(parseFontVariants('400 700 italic')).toEqual({ weights: [400, 700], italic: true, invalid: [] });
  });

  it('sorts and deduplicates weights, as the Google API requires ascending values', () => {
    expect(parseFontVariants('700 400 700').weights).toEqual([400, 700]);
  });

  it('accepts italic in any case and any position', () => {
    expect(parseFontVariants('Italic 500')).toEqual({ weights: [500], italic: true, invalid: [] });
  });

  it('collects anything that is neither a weight nor italic', () => {
    expect(parseFontVariants('400 bold 12 oblique').invalid).toEqual(['bold', '12', 'oblique']);
  });

  it('rejects weights outside the 100-900 hundreds', () => {
    expect(parseFontVariants('450').invalid).toEqual(['450']);
    expect(parseFontVariants('1000').invalid).toEqual(['1000']);
    expect(parseFontVariants('0').invalid).toEqual(['0']);
  });
});

describe('buildGoogleFontsUrl', () => {
  it('returns null when nothing is requested', () => {
    expect(buildGoogleFontsUrl([])).toBeNull();
  });

  it('builds a weight-only request', () => {
    expect(buildGoogleFontsUrl([{ family: 'Inter', weights: [400, 700], italic: false }])).toBe(
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=block',
    );
  });

  it('encodes spaces in a family name as plus signs', () => {
    expect(buildGoogleFontsUrl([{ family: 'Playfair Display', weights: [400], italic: false }])).toContain(
      'family=Playfair+Display:wght@400',
    );
  });

  it('emits ital axis tuples, upright before italic, when italics are asked for', () => {
    expect(buildGoogleFontsUrl([{ family: 'Inter', weights: [400, 700], italic: true }])).toBe(
      'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,700;1,400;1,700&display=block',
    );
  });

  it('combines several families into a single request', () => {
    const url = buildGoogleFontsUrl([
      { family: 'Inter', weights: [400], italic: false },
      { family: 'Playfair Display', weights: [700], italic: false },
    ]);
    expect(url).toBe(
      'https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Playfair+Display:wght@700&display=block',
    );
  });

  it('uses font-display block so the first paint has correct metrics', () => {
    expect(buildGoogleFontsUrl([{ family: 'Inter', weights: [400], italic: false }])).toContain('display=block');
  });
});

export type FontRequest = {
  family: string;
  weights: number[];
  italic: boolean;
};

export const GOOGLE_FONTS_CSS_ORIGIN = 'https://fonts.googleapis.com';
export const GOOGLE_FONTS_FILE_ORIGIN = 'https://fonts.gstatic.com';

// Prototypes live or die on layout fidelity, so block briefly rather than paint
// a first frame with fallback metrics and reflow. This is the opposite of the
// usual web default of swap, and deliberately so.
export const FONT_DISPLAY = 'block';

const WEIGHT_PATTERN = /^[1-9]00$/;
const DEFAULT_WEIGHT = 400;

export type ParsedVariants = { weights: number[]; italic: boolean; invalid: string[] };

// "400 700 italic" -> weights [400, 700], italic true. Weights are deduplicated
// and sorted because the Google API expects them ascending.
export const parseFontVariants = (data: string | undefined): ParsedVariants => {
  const tokens = (data ?? '').trim().split(/\s+/).filter(Boolean);
  const weights: number[] = [];
  const invalid: string[] = [];
  let italic = false;

  tokens.forEach((token) => {
    if (token.toLowerCase() === 'italic') {
      italic = true;
      return;
    }
    if (WEIGHT_PATTERN.test(token)) {
      weights.push(Number(token));
      return;
    }
    invalid.push(token);
  });

  const unique = Array.from(new Set(weights)).sort((a, b) => a - b);
  return { weights: unique.length > 0 ? unique : [DEFAULT_WEIGHT], italic, invalid };
};

const encodeFamily = (family: string): string => family.trim().replace(/\s+/g, '+');

// Google's css2 API wants "wght@400;700", or "ital,wght@0,400;1,400" once
// italics are involved -- the axis tuples must be ordered by axis, then value.
const buildFamilyParameter = (request: FontRequest): string => {
  const { family, weights, italic } = request;
  const spec = italic
    ? `ital,wght@${[...weights.map((weight) => `0,${weight}`), ...weights.map((weight) => `1,${weight}`)].join(';')}`
    : `wght@${weights.join(';')}`;
  return `family=${encodeFamily(family)}:${spec}`;
};

export const buildGoogleFontsUrl = (requests: FontRequest[]): string | null => {
  if (requests.length === 0) {
    return null;
  }
  const families = requests.map(buildFamilyParameter).join('&');
  return `${GOOGLE_FONTS_CSS_ORIGIN}/css2?${families}&display=${FONT_DISPLAY}`;
};

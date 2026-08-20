const fontsSingleFamily = `fonts:
- font: Inter

ptml:
> text: Hello
  - styles:
    - font-family: Inter, sans-serif
`;

const fontsWithWeightsAndItalic = `fonts:
- font: Inter
  - weights: 400 700
- font: Playfair Display
  - weights: 400 700 italic

ptml:
> text: Hello
  - styles:
    - font-family: Playfair Display, serif
`;

const fontsEmpty = `fonts:

ptml:
> text: Hello
`;

const fontsDuplicateFamily = `fonts:
- font: Inter
  - weights: 400
- font: Inter
  - weights: 700

ptml:
> text: Hello
`;

const fontsMissingFamily = `fonts:
- font:

ptml:
> text: Hello
`;

const fontsInvalidWeights = `fonts:
- font: Inter
  - weights: 400 bold

ptml:
> text: Hello
`;

const fontsFamilyWithColon = `fonts:
- font: Inter:400

ptml:
> text: Hello
`;

export {
  fontsSingleFamily,
  fontsWithWeightsAndItalic,
  fontsEmpty,
  fontsDuplicateFamily,
  fontsMissingFamily,
  fontsInvalidWeights,
  fontsFamilyWithColon,
};

export const docExample = `
fonts:
- font: Inter
  - weights: 400 700
- font: Playfair Display
  - weights: 400 italic

ptml:
> text: A headline in the real typeface
  - styles:
    - font-family: Playfair Display, serif
    - font-weight: 400
`;

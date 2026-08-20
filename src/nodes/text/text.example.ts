const textWithPipe = `
state:
- count: 0

ptml:
> box:
  > text: Hello, ($count 1 | add)!
`;

const textWithPipes = `
ptml:
> box:
  > text: Hello, ($count 1 | add) | ($count 1 | add)!
`;

const textWithNewline = `
ptml:
> box:
  > text: Hello
    - newline
  > text: World
`;

// One magenta word inside a headline. The space before each run comes from a
// leading space in that run's own text -- see textWhitespace below.
const textWithInlineRuns = `ptml:
> text: Open from
  > text:  9am
    - styles:
      - color: magenta
  > text:  to
  > text:  5pm
    - styles:
      - color: magenta
`;

const textRunsWithEmptyParent = `ptml:
> text:
  > text: One
  > text:  Two
`;

const textRunsNested = `ptml:
> text: A
  > text:  B
    - styles:
      - font-weight: bold
    > text:  C
      - styles:
        - color: red
`;

// Exactly one space after the colon delimits the node from its text; further
// leading spaces are content. Trailing spaces are always stripped.
const textWhitespace = `ptml:
> text:  leading kept
> text: trailing stripped
> text:    three kept
`;

export {
  textWithPipe,
  textWithPipes,
  textWithNewline,
  textWithInlineRuns,
  textRunsWithEmptyParent,
  textRunsNested,
  textWhitespace,
};

export const docExample = `
ptml:
> text: Open from
  > text:  9am
    - styles:
      - color: magenta
  > text:  to 5pm
`;

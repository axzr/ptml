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

export { textWithPipe, textWithPipes, textWithNewline };

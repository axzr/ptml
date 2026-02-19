const cellWithText = `ptml:
> table:
  > row:
    > cell:
      > text: A1
    > cell:
      > text: B1`;

const cellWithBox = `ptml:
> table:
  > row:
    > cell:
      > box:
        > text: Content`;

export { cellWithText, cellWithBox };

export const docExample = `
ptml:
> table:
  > row:
    > cell:
      > text: Name
    > cell:
      > text: Age
  > row:
    > cell:
      > text: Alice
    > cell:
      > text: 30
`;

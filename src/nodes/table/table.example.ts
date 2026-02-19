const tableSimple = `ptml:
> table:
  > row:
    > cell:
      > text: A1
    > cell:
      > text: B1
  > row:
    > cell:
      > text: A2
    > cell:
      > text: B2`;

const tableWithHeader = `ptml:
> table:
  > row:
    - role: header
    > cell:
      > text: Col1
    > cell:
      > text: Col2
  > row:
    > cell:
      > text: R1C1
    > cell:
      > text: R1C2`;

const tableWithHeaderBodyFooter = `ptml:
> table:
  > row:
    - role: header
    > cell:
      > text: H
  > row:
    > cell:
      > text: B
  > row:
    - role: footer
    > cell:
      > text: F`;

export { tableSimple, tableWithHeader, tableWithHeaderBodyFooter };

export const docExample = `
ptml:
> table:
  > row: header
    > cell:
      > text: City
    > cell:
      > text: Population
  > row:
    > cell:
      > text: London
    > cell:
      > text: 9 million
`;

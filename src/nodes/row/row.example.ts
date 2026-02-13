const rowWithCells = `ptml:
> table:
  > row:
    > cell:
      > text: A1
    > cell:
      > text: B1`;

const rowWithHeaderRole = `ptml:
> table:
  > row:
    - role: header
    > cell:
      > text: Name
    > cell:
      > text: Value`;

const rowWithFooterRole = `ptml:
> table:
  > row:
    - role: header
    > cell:
      > text: H1
  > row:
    > cell:
      > text: B1
  > row:
    - role: footer
    > cell:
      > text: F1`;

export { rowWithCells, rowWithHeaderRole, rowWithFooterRole };

const listUnordered = `ptml:
> list:
  > listItem:
    > text: One
  > listItem:
    > text: Two`;

const listOrdered = `ptml:
> list:
  - type: ordered
  > listItem:
    > text: First
  > listItem:
    > text: Second`;

const listLowerAlpha = `ptml:
> list:
  - type: lower-alpha
  > listItem:
    > text: Alpha item
  > listItem:
    > text: Beta item`;

export { listUnordered, listOrdered, listLowerAlpha };

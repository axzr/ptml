export const docExample = `
state:
- scores:
  - 0: 10
  - 1: 20
  - 2: 30

ptml:
> range: $scores as $index
  > text: Score $index
`;

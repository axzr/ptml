export const docExample = `
state:
- search:

ptml:
> input:
  - value: $search
> button:
  > text: Clear
  - click:
    ! clear: $search
> text: Search: $search
`;

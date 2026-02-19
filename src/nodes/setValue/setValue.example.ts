export const docExample = `
valueList: items
- Apple
- Banana

state:
- index: 0

ptml:
> button:
  > text: Replace first item
  - click:
    ! setValue: items $index Cherry
`;

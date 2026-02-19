export const docExample = `
valueList: items
- Apple
- Banana

state:
- index: 0

ptml:
> button:
  > text: Update first item
  - click:
    ! updateValue: items $index Cherry
`;

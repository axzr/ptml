export const docExample = `
valueList: colours
- Red
- Green
- Blue

state:
- index: 1

ptml:
> getValue: colours $index as $colour
  > text: Selected: $colour
`;

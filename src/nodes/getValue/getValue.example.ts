export const docExample = `
valueList: colours
- Red
- Green
- Blue

valueList: indices
- 0
- 1
- 2

ptml:
> each: indices as $i
  ! getValue: colours $i as $colour
  > text: $colour
`;

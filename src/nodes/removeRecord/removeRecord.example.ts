export const docExample = `
recordList: items
- record:
  - name: Apple
- record:
  - name: Banana

ptml:
> each: items as $item
  > text: $item.name
  > button:
    > text: Remove
    - click:
      ! removeRecord: items $item
`;

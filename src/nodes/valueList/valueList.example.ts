const basicValueList = `
valueList: items
- item 1
- item 2
- item 3

ptml:
> box
  > each: items as $item
    > box
      > text: $item
`;

const invalidValueListData = `
valueList: fruits apple banana cherry
ptml:
> text: this is an invalid list
> text: we don't yet support inline lists
> text: we should report a useful error message
`;

const invalidLoopVariable = `
valueList: items
- item 1

state:
- item: 0

ptml:
> box
  > each: items as $item
`;

const valueListWithOddChildren = `
valueList: items
- item 1
> text:
  - item 2
> box:
  > text: item 3
`;

const valueListItemsFromState = `
state:
- todo:
  - title: Todo
- doing:
  - title: Doing
- done:
  - title: Done

valueList: columns
- $todo
- $doing
- $done

ptml:
> each: columns as $column
  > text: this is the title: $column.title
`;

export { basicValueList, invalidValueListData, invalidLoopVariable, valueListWithOddChildren, valueListItemsFromState };

export const docExample = `
valueList: fruits
- Apple
- Banana
- Cherry

ptml:
> each: fruits as $fruit
  > text: $fruit
`;

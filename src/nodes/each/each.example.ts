const simpleList = `
valueList: fruits 
- apple
- banana
- cherry
ptml:
> each: fruits as $fruit
  > box
    > text: this is the fruit: $fruit
`;

const invalidListData = `
valueList: fruits apple banana cherry
ptml:
- text: this is an invalid list
- text: we don't yet support inline lists
- text: we should report a useful error message
`;

const eachWithIndex = `
valueList: fruits
- apple
- banana
- cherry
ptml:
> each: fruits as $fruit, index as $index
  > box
    > text: this is the fruit: $fruit at index $index
`;

const indexOnly = `
valueList: fruits
- apple
- banana
- cherry
- date
ptml:
> each: fruits, index as $index
  > box
    > text: this is the index: $index
`;

const invalidEach = `
valueList: fruits
- apple
- banana
- cherry
ptml:
> each: fruits as fruit
  > box
    > text: this is the fruit: $fruit at index $index

- text: this is an invalid each, as fruit in 'fruits as fruit' is missing the $ prefix
- text: we should report a useful error message
`;

const invalidEachInBox = `
valueList: fruits
- apple
- banana
- cherry
ptml:
> box:
  > each: fruits as fruit
    > box
      > text: this is the fruit: $fruit at index $index

- text: this is an invalid each, as fruit in 'fruits as fruit' is missing the $ prefix
- text: we should report a useful error message
`;

const setToIndex = `
state:
- selectedIndex:
valueList: fruits
- apple
- banana
- cherry

ptml:
> box: 
  > text: the selected index is: $selectedIndex

> each: fruits as $fruit, index as $index
  > button:
    - styles:
      - background-color: #f0f0f0
      - padding: 0.5em
      - border-radius: 0.25em
      - border: 1px solid #ccc
      - cursor: pointer
      - font-size: 1em
      - font-family: Arial, sans-serif
      - color: #333
    > text: select $fruit
    - click:
      ! set: $selectedIndex $index
`;

const invalidEachData = `
valueList: fruits
- apple
- banana
- cherry
ptml:
> each: fruits as $fruit bat
  > box
    > text: this is the fruit: $fruit
`;

const stateGetEach = `
valueList: names
- John
- Jannette
- Jim

valueList: namesLengths

state:
- numNames: $names | length

function: populateNamesLengths
> each: names as $name, index as $i
  ! setValue: namesLengths $i ($name | length)

init:
! call: populateNamesLengths

ptml:
> each: namesLengths as $nameLength, index as $index
  ! getValue: names $index as $name
  > box:
    - styles:
      - color: rgb(0, 0, 0, 0.5)
      - font-size: 1.5em
      - font-weight: bold
    > text: $nameLength characters in $name
`;

export {
  simpleList,
  invalidListData,
  eachWithIndex,
  indexOnly,
  invalidEach,
  invalidEachInBox,
  setToIndex,
  invalidEachData,
  stateGetEach,
};

export const docExample = `
valueList: colours
- Red
- Green
- Blue

ptml:
> list:
  > each: colours as $colour
    > listItem:
      > text: $colour
`;

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

const eachSortedByProperty = `recordList: tasks
- record:
  - title: Wash up
  - priority: 3
- record:
  - title: another job
  - priority: 10
- record:
  - title: Buy milk
  - priority: 2

ptml:
> each: tasks as $task
  - sort: title
  > text: $task.title|
`;

const eachSortedDescending = `recordList: tasks
- record:
  - title: Wash up
- record:
  - title: Buy milk

ptml:
> each: tasks as $task
  - sort: title desc
  > text: $task.title|
`;

// Numbers compare as numbers, so 10 sorts after 3 rather than before it.
const eachSortedNumerically = `recordList: tasks
- record:
  - priority: 3
- record:
  - priority: 10
- record:
  - priority: 2

ptml:
> each: tasks as $task
  - sort: priority
  > text: $task.priority|
`;

// A list of plain values sorts by the values themselves: no property to name.
const eachSortedValues = `valueList: labels
- item 10
- item 9
- item 2

ptml:
> each: labels as $label
  - sort: asc
  > text: $label|
`;

const eachSortedByMissingProperty = `recordList: tasks
- record:
  - title: Wash up

ptml:
> each: tasks as $task
  - sort: titel
  > text: $task.title
`;

const eachSortWithNoSpec = `valueList: labels
- a

ptml:
> each: labels as $label
  - sort:
  > text: $label
`;

const eachSortWithTooManyParts = `valueList: labels
- a

ptml:
> each: labels as $label
  - sort: title desc extra
  > text: $label
`;

// image was one of the node types the old hand-maintained child list excluded.
const eachWithImageChild = `valueList: photos
- one.png

ptml:
> each: photos as $photo
  > image:
    - src: $photo
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
  eachSortedByProperty,
  eachSortedDescending,
  eachSortedNumerically,
  eachSortedValues,
  eachSortedByMissingProperty,
  eachSortWithNoSpec,
  eachSortWithTooManyParts,
  eachWithImageChild,
};

export const docExample = `
recordList: tasks
- record:
  - title: Wash up
  - priority: 3
- record:
  - title: Buy milk
  - priority: 1

ptml:
> each: tasks as $task
  - sort: priority
  > text: $task.title
    - newline:
`;

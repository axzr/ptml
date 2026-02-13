const invalidBoxWithPrecedingSpaces = `   box: with precending spaces`;

const invalidNodeWithPrecedingSpaces = `   nodename: with precending spaces`;

const invalidLineWithoutDashPrefix = `ptml:
> box:
  text: this line has indentation but no prefix
`;

const invalidBoxWithOddIndent = `ptml:
> box:
 > text: this has odd indent (1 space)
`;

const invalidChildIndentTooDeep = `ptml:
> box:
  > text: hello
      > text: this child has indent 4 but parent is at indent 0, should be indent 2
`;

const unknownPropertiesAreInvalid = `ptml:
> box:
  > text: hello
  - unknown: this property is unknown and should be invalid
`;

const unknownPropertyInStyles = `define: test
- color: black
ptml:
> text: hello
  - styles: test
    - unknown: this is allowed
`;

const boxInStylesIf = `define: test
- color: black
state:
- someVar:
ptml:
> text: hello
  - styles: test
    ? if: $someVar
      > box:
        > text: hello
`;

const cssPropertiesInStylesIf = `define: test
- color: black
state:
- someVar:
ptml:
> text: hello
  - styles: test
    ? if: $someVar
      - color: red
      - background-color: blue
`;

const setInNonClickNode = `state:
- var:
valueList: items
ptml:
> each: items
  ! set: $var value
`;

const setInClickNode = `state:
- var:
ptml:
> button:
  > text: Click me
  - click:
    ! set: $var value
`;

const boxInEachIf = `state:
- items: [item1, item2]
ptml:
> box:
  > each: items as $item
    ? if: $item
      > box:
        > text: hello
`;

const cssPropertiesInEachIf = `state:
- items: [item1, item2]
ptml:
> box:
  > each: items as $item
    ? if: $item
      - color: red
`;

const unknownRootNode = 'unknown: test';

const addValueAsDirectChildOfEach = `valueList: names
ptml:
> each: names
  ! addValue: names x
`;

const callAsDirectChildOfEach = `function: myFn
valueList: items
ptml:
> each: items
  ! call: myFn
`;

const rangeAsDirectChildOfBox = `ptml:
> box:
  > range: 1 3
`;

const addValueUnderClick = `valueList: names
ptml:
> button:
  > text: Add
  - click:
    ! addValue: names x
`;

const callUnderInit = `function: myFn
init:
! call: myFn
`;

const addValueUnderInit = `valueList: names
init:
! addValue: names x
`;

const setUnderInit = `state:
- x:
init:
! set: $x 1
`;

export {
  invalidBoxWithPrecedingSpaces,
  invalidNodeWithPrecedingSpaces,
  invalidBoxWithOddIndent,
  invalidLineWithoutDashPrefix,
  invalidChildIndentTooDeep,
  unknownPropertiesAreInvalid,
  unknownPropertyInStyles,
  boxInStylesIf,
  cssPropertiesInStylesIf,
  setInNonClickNode,
  setInClickNode,
  boxInEachIf,
  cssPropertiesInEachIf,
  unknownRootNode,
  addValueAsDirectChildOfEach,
  callAsDirectChildOfEach,
  rangeAsDirectChildOfBox,
  addValueUnderClick,
  callUnderInit,
  addValueUnderInit,
  setUnderInit,
};

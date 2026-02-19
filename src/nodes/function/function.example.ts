const invalidFunctionNoName = `
function:
`;

const invalidFunctionWithRepeatedParams = `
function: add value other value
`;

const invalidFunctionWithDollarSignOnName = `
function: $add value other
`;

const invalidFunctionWithDollarSignOnParameter = `
function: add $value other
`;

const functionThatUpdatesState = `
state:
- value: 0

function: increment
! set: $value ($value 1 | add)

ptml:
> button:
  > text: increment
  - click:
    ! call: increment
> box:
  > text: value is $value
`;

const copyVar = `
state:
- count: 0
- newValue: ten

function: setCountToNewValue
! set: $count $newValue

ptml:
> text: count is $count
> button:
  > text: set count to newValue ($newValue)
  - click:
    ! call: setCountToNewValue
`;

const namedFunction = `
state:
- display: 0
function: addDigit digit
! set: $display ($display $digit | add)
ptml:
> box:
  > text: display is $display
  > button:
    > text: add 1
    - click:
      ! call: addDigit 1
`;

const functionVariable = `
state:
- value: 0

valueList: functions
- increment
- decrement

state:
- currentFunction: increment

function: increment
! set: $value ($value 1 | add)

function: decrement
! set: $value ($value 1 | subtract)

function: setFunction newFunction
! set: $currentFunction $newFunction

define: button-styles
- padding: 1em
- margin: 1em
- border-radius: 5px
- border: 1px solid #000
- cursor: pointer
- font-size: 16px
- font-weight: bold

ptml:
> box:
  > text: value is $value
  > box:
    > each: functions as $function
      > button:
        > text: set currentFunction to $function
        - styles: button-styles
        - click:
          ! call: setFunction $function
  > box:
    > button:
      - styles: button-styles
      > text: $currentFunction
      - click:
        ! call: $currentFunction
`;

const addDigit = `
state:
- display: 1

function: addDigit digit
! set: $display ($display 10 | multiply) $digit | add

ptml:
> box:
  - styles:
    - color: white
  > text: display is $display
> button:
  > text: add 9
  - styles:
    - background-color: #95a5a6
    - color: white
    - font-weight: bold
  - click:
    ! call: addDigit 9
`;

const clearInput = `
state:
- input: hello world

function: clearInput
! clear: $input

ptml:
> box:
  - styles:
    - color: white
  > text: input is $input
  > button:
    > text: clear input
    - click:
      ! call: clearInput
`;

export {
  invalidFunctionNoName,
  invalidFunctionWithRepeatedParams,
  invalidFunctionWithDollarSignOnName,
  invalidFunctionWithDollarSignOnParameter,
  functionThatUpdatesState,
  copyVar,
  namedFunction,
  functionVariable,
  addDigit,
  clearInput,
};

export const docExample = `
state:
- count: 0

function: increment
! set: $count $count 1 | add

ptml:
> text: Count: $count
> button:
  > text: Add one
  - click:
    ! call: $increment
`;

const invalidFunctionCall = `
ptml:
> button:
  > text: call currentFunction
  - click:
    ! call: $currentFunction
`;

const invalidFunctionCall2 = `
ptml:
> button:
  > text: call currentFunction
  - click:
    ! call: currentFunction
`;

const invalidFunctionCall3 = `
function: add value1 value2
! set: $value ($value1 $value2 | add)

ptml:
> button:
  > text: add 1 and 2
  - click:
    ! call: add 1
`;

const invalidFunctionCall4 = `
function: add value1 value2
! set: $value ($value1 $value2 | add)

ptml:
> button:
  > text: add 1 and 2
  - click:
    ! call: add 1 2 3
`;

const invalidRunTimeFunctionCall = `
state:
- value: 0

valueList: functions
- increment
- decrement

state:
- currentFunction: increment

function: increment
! set: $value ($value 1 | add)

function: decrement param
! set: $value ($value $param | subtract)

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

export {
  invalidFunctionCall,
  invalidFunctionCall2,
  invalidFunctionCall3,
  invalidFunctionCall4,
  invalidRunTimeFunctionCall,
};

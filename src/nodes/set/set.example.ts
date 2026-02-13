const multiSet = `
state: 
- x: 1
- y: 2
- z: 3

ptml:
> box:
  > text: x is $x
  > text: y is $y
  > text: z is $z
  > button:
    > text: Clear all
    - click:
      ! set: $x 0
      ! set: $y 0
      ! set: $z 0
`;

const multiSetFunction = `
state:
- x: 1
- y: 2
- z: 3

function: clear
! set: $x 0
! set: $y 0
! set: $z 0

ptml:
> box:
  > text: x is $x
  > text: y is $y
  > text: z is $z
  > button:
    > text: Clear all
    - click:
      ! call: clear
`;

const invalidSet = `
state:
- display: 0
function: addDigit digit
! set: display ($display 10 | multiply) $digit | add
`;

export { multiSet, multiSetFunction, invalidSet };

const rangeListSet = `
state:
- gridSize: 10
valueList: grid

function: populateGrid
> range: gridSize as $i
  ! addValue: grid $i

ptml:
> button:
  > text: populate grid
  - click:
    ! call: populateGrid
    
> each: grid as $cell
  > box
    > text: this is the cell: $cell
`;

const rangeListCreateRecord = `
state:
- gridSize: 10
recordList: grid

init:
! call: init

function: init
> range: gridSize as $i
  ! addRecord: grid
    - record:
      - x: $i
      - alive: false

ptml:
> each: grid as $cell
  > box
    > text: this is the cell: $cell.x: $cell.alive
`;

// the below example is invalid because the range variable 'i' in 'gridSize as i'
// doesn't have a dollar prefix
const invalidRange = `
state:
- gridSize: 10
recordList: grid

init:
! call: init

function: init
> range: gridSize as i
  ! addRecord: grid
    - record:
      - x: $i
      - alive: false`;

export { rangeListSet, rangeListCreateRecord, invalidRange };

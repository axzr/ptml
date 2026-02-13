const addPipe = `
state:
- count: 0
ptml:
> button:
  > text: increment
  - click:
    ! set: $count ($count 1 | add)
> box:
  > text: count is $count
`;

const invalidPipe = `
state:
- count: 0
ptml:
> button:
  > text: increment
  - click:
    ! set: $count ($count 1 | unknownPipe)
> box:
  > text: count is $count
`;

export { addPipe, invalidPipe };

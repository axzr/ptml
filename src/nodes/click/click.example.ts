const setStateButton = `
state:
- name: Dave
ptml:
> button
  > text: change name to John
  - click
    ! set: $name John
> box
  > text: Hello, $name!
`;

const incrementButton = `
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

const invalidSetNode = `
state:
- name: Dave
ptml:
> button
  > text: change name to John
  - click
    ! set: name John
> box
  > text: Hello, $name!
`;

const invalidSetStateButton = `
state:
- name: Dave
ptml:
> button
  > text: change name to John
  - click
    ! set: $name $John
> box
  > text: Hello, $name!
`;

export { setStateButton, incrementButton, invalidSetNode, invalidSetStateButton };

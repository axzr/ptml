const basicButton = `
ptml:
> button:
  > text: a non-functional button
  - styles:
    - background-color: #000000
    - color: #ffffff
    - padding: 10px 20px
    - border-radius: 5px
    - cursor: pointer
    - font-size: 16px
    - font-weight: bold
    - text-align: center
`;

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

const buttonTextWithState = `
state:
- divisor: 0
- count: 1

ptml:
> button:
  > text: divisor is $divisor
> button
  > text: count is $count
`;

const disabledButton = `
state:
- divisor: 0
- count: 1

define: button-styles
- background-color: green
- margin: 10px
- padding: 0.5em
- border: 1px solid green
- cursor: pointer
- font-size: 16px
- font-weight: bold
- text-align: center
- color: #ffffff
- border-radius: 5px
- box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
- transition: background-color 0.3s ease

ptml:
> button:
  - styles: button-styles
  > text: divide by $divisor
  - click:
    ! set: $count ($count $divisor | divide)
  - disabled: $divisor is 0
> box:
  > text: count is $count
> box:
  > text: divisor is $divisor
> box:
  > button:
    - styles: button-styles
    > text: increment divisor
    - click:
      ! set: $divisor ($divisor 1 | add)
  > button:
    - styles: button-styles
    > text: decrement divisor
    - click:
      ! set: $divisor ($divisor 1 | subtract)
`;

const toggleStateButton = `
state:
- isActive: false

ptml:
> box:
  > text: isActive is $isActive
> button: 
  > text: toggle the state
  - click
    ! set: $isActive !$isActive
`;

const disabledWithUndefined = `
state:
- nextFunction:
- display: 0

ptml:
> button:
  > text: execute
  - click:
    ! set: display 1
  - disabled: $nextFunction is undefined
> box:
  > text: display is $display
  > button:
    > text: set function
    - click:
      ! set: nextFunction add
  > button:
    > text: clear function
    - click:
      ! set: nextFunction undefined
`;

export {
  basicButton,
  setStateButton,
  incrementButton,
  buttonTextWithState,
  disabledButton,
  toggleStateButton,
  disabledWithUndefined,
};

export const docExample = `
state:
- count: 0

ptml:
> button:
  > text: Clicked $count times
  - click:
    ! set: $count ($count 1 | add)
`;

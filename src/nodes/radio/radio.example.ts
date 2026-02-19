const basicRadio = `ptml:
> radio:
  - name: choice
  - value: a
> radio:
  - name: choice
  - value: b
`;

const radioWithSelected = `state:
- choice: a

ptml:
> radio:
  - name: choice
  - value: a
  - selected: $choice
> radio:
  - name: choice
  - value: b
  - selected: $choice
`;

const radioInForm = `ptml:
> form:
  > text: Size
  > radio:
    - name: size
    - value: s
  > radio:
    - name: size
    - value: l
  > button:
    > text: Submit
    - click:
      ! set: $size form.size
`;

const radioWithStyles = `ptml:
> radio:
  - name: styled
  - value: x
  - styles:
    - width: 1.5em
    - height: 1.5em
    - margin: 0.5em
`;

const multipleGroupsInForm = `ptml:
> form:
  > text: Size
  > radio:
    - name: size
    - value: s
  > radio:
    - name: size
    - value: l
  > text: Color
  > radio:
    - name: color
    - value: red
  > radio:
    - name: color
    - value: blue
  > button:
    > text: Submit
    - click:
      ! set: $size form.size
      ! set: $color form.color
`;

export { basicRadio, radioWithSelected, radioInForm, radioWithStyles, multipleGroupsInForm };

export const docExample = `
state:
- size: medium

ptml:
> radio:
  - value: $size
  - option: small
  - option: medium
  - option: large
`;

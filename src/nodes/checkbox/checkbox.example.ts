const basicCheckbox = `ptml:
> checkbox:
  - id: accept
`;

const checkboxWithValue = `state:
- agreed: false

ptml:
> checkbox:
  - id: terms
  - value: $agreed
`;

const checkboxInForm = `ptml:
> form:
  > text: I agree
  > checkbox:
    - id: agree
  > button:
    > text: Submit
    - click:
      ! set: $agree form.agree
`;

const checkboxWithStyles = `ptml:
> checkbox:
  - id: styled
  - styles:
    - width: 1.5em
    - height: 1.5em
    - margin: 0.5em
`;

const multipleCheckboxesInForm = `ptml:
> form:
  > text: Newsletter
  > checkbox:
    - id: newsletter
  > text: Terms
  > checkbox:
    - id: terms
  > button:
    > text: Submit
    - click:
      ! set: $newsletter form.newsletter
      ! set: $terms form.terms
`;

export { basicCheckbox, checkboxWithValue, checkboxInForm, checkboxWithStyles, multipleCheckboxesInForm };

export const docExample = `
state:
- agreed: false

ptml:
> checkbox:
  - value: $agreed
  - label: I agree to the terms
`;

const basicTextarea = `ptml:
> textarea:
  - id: description
`;

const textareaWithStyles = `ptml:
> textarea:
  - id: notes
  - styles:
    - width: 100%
    - padding: 0.5em
    - border: 1px solid #ccc
    - border-radius: 3px
    - min-height: 100px
`;

const textareaWithValue = `state:
- initialNotes: Some initial text

ptml:
> textarea:
  - id: notes
  - value: $initialNotes
`;

const textareaInForm = `ptml:
> form:
  > text: Description:
  > textarea:
    - id: description
    - styles:
      - width: 100%
      - padding: 0.5em
  > button:
    > text: Submit
    - click:
      ! set: $description form.description
      ! clear: form.description
`;

const textareaWithPlaceholder = `ptml:
> textarea:
  - id: description
  - placeholder: Describe the problem
`;

const textareaWithPlaceholderFromState = `state:
- descriptionHint: What happened, and when?

ptml:
> textarea:
  - id: description
  - placeholder: $descriptionHint
`;

export {
  basicTextarea,
  textareaWithStyles,
  textareaWithValue,
  textareaInForm,
  textareaWithPlaceholder,
  textareaWithPlaceholderFromState,
};

export const docExample = `
state:
- notes:

ptml:
> textarea:
  - value: $notes
  - placeholder: Your notes
> text: You wrote: $notes
`;

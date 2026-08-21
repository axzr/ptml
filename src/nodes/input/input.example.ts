const basicInput = `ptml:
> input:
  - id: name
  - type: text
`;

const inputWithStyles = `ptml:
> input:
  - id: email
  - type: email
  - styles:
    - width: 100%
    - padding: 0.5em
    - border: 1px solid #ccc
    - border-radius: 3px
`;

const inputWithValue = `state:
- userName: John Doe

ptml:
> input:
  - id: name
  - type: text
  - value: $userName
`;

const inputInForm = `ptml:
> form:
  > text: Name:
  > input:
    - id: name
    - type: text
    - styles:
      - width: 100%
      - padding: 0.5em
  > button:
    > text: Submit
    - click:
      ! set: $name $form.name
      ! clear: form.name
`;

const inputDifferentTypes = `ptml:
> form:
  > text: Email:
  > input:
    - id: email
    - type: email
  > text: Password:
  > input:
    - id: password
    - type: password
  > text: Age:
  > input:
    - id: age
    - type: number
  > button:
    > text: Submit
    - click:
      ! set: $email $form.email
      ! set: $age $form.age
      ! clear: form.email
      ! clear: form.password
      ! clear: form.age
`;

const inputWithPlaceholder = `ptml:
> input:
  - id: name
  - type: text
  - placeholder: Your full name
`;

const inputWithPlaceholderFromState = `state:
- nameHint: e.g. Ada Lovelace

ptml:
> input:
  - id: name
  - type: text
  - placeholder: $nameHint
`;

// No id and no $-bound value: renders a field that silently refuses input.
const inputWithNoBinding = `ptml:
> form:
  > input:
    - type: text
`;

const inputBoundByValueOnly = `state:
- name:

ptml:
> input:
  - value: $name
  - type: text
`;

const inputWithoutType = `ptml:
> input:
  - id: name
`;

// Reading a field back out into state: the $ is what makes it a reference
// rather than the literal text "form.name".
const inputSubmittedToState = `state:
- submitted:

ptml:
> form:
  > input:
    - id: name
    - type: text
  > button:
    > text: Submit
    - click:
      ! set: $submitted $form.name
  > text: Submitted: $submitted
`;

const inputSubmittedWithoutDollar = `state:
- submitted:

ptml:
> form:
  > input:
    - id: name
    - type: text
  > button:
    > text: Submit
    - click:
      ! set: $submitted form.name
`;

const inputSubmittedFromUnknownField = `state:
- submitted:

ptml:
> form:
  > input:
    - id: name
    - type: text
  > button:
    > text: Submit
    - click:
      ! set: $submitted $form.nmae
`;

export {
  inputSubmittedToState,
  inputSubmittedWithoutDollar,
  inputSubmittedFromUnknownField,
  inputWithNoBinding,
  inputBoundByValueOnly,
  inputWithoutType,
  basicInput,
  inputWithStyles,
  inputWithValue,
  inputInForm,
  inputDifferentTypes,
  inputWithPlaceholder,
  inputWithPlaceholderFromState,
};

export const docExample = `
state:
- name:

ptml:
> input:
  - value: $name
  - type: text
  - placeholder: Your name
> text: Hello, $name!
`;

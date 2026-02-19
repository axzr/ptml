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
      ! set: $name form.name
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
      ! set: $email form.email
      ! set: $age form.age
      ! clear: form.email
      ! clear: form.password
      ! clear: form.age
`;

export { basicInput, inputWithStyles, inputWithValue, inputInForm, inputDifferentTypes };

export const docExample = `
state:
- name:

ptml:
> input:
  - value: $name
  - type: text
> text: Hello, $name!
`;

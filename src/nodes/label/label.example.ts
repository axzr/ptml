const labelWithForAndText = `ptml:
> form:
  > label:
    - for: email
    - text: Email
  > input:
    - id: email
    - type: email
`;

const labelWrappingCheckbox = `ptml:
> form:
  > label:
    - text: Accept terms
    > checkbox:
      - id: accept
  > button:
    > text: Submit
`;

const labelInFormWithInput = `ptml:
> form:
  > label:
    - for: name
    - text: Name
  > input:
    - id: name
    - type: text
  > button:
    > text: Submit
    - click:
      ! set: $name form.name
`;

const labelWithStyles = `ptml:
> label:
  - for: q
  - text: Search
  - styles:
    - display: block
    - marginBottom: 0.5em
    - fontWeight: bold
`;

export { labelWithForAndText, labelWrappingCheckbox, labelInFormWithInput, labelWithStyles };

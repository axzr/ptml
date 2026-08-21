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
> form:
  > label:
    - for: q
    - text: Search
    - styles:
      - display: block
      - marginBottom: 0.5em
      - fontWeight: bold
  > input:
    - id: q
    - type: search
`;

const labelForUnknownField = `ptml:
> form:
  > label:
    - for: emial
    - text: Email
  > input:
    - id: email
    - type: email
`;

const duplicateFieldIds = `ptml:
> form:
  > input:
    - id: name
    - type: text
  > input:
    - id: name
    - type: text
`;

// Legitimate: only one branch ever renders, so the shared id is not a clash.
const sharedIdAcrossConditionalBranches = `state:
- mode: email

ptml:
> form:
  ? if: $mode is email
    > input:
      - id: contact
      - type: email
  ? if: $mode is phone
    > input:
      - id: contact
      - type: tel
`;

const fixedIdInsideLoop = `valueList: rows
- a
- b

ptml:
> each: rows as $row
  > input:
    - id: rowField
    - type: text
`;

const perItemIdInsideLoop = `recordList: rows
- record:
  - key: first
- record:
  - key: second

ptml:
> each: rows as $row
  > input:
    - id: $row.key
    - type: text
`;

export {
  labelWithForAndText,
  labelWrappingCheckbox,
  labelInFormWithInput,
  labelWithStyles,
  labelForUnknownField,
  duplicateFieldIds,
  sharedIdAcrossConditionalBranches,
  fixedIdInsideLoop,
  perItemIdInsideLoop,
};

export const docExample = `
state:
- email:

ptml:
> label:
  - for: email
  > text: Email Address
> input:
  - id: email
  - value: $email
`;

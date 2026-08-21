const basicSelect = `ptml:
> select:
  - id: country
  > option: United States
    - value: us
  > option: Canada
    - value: ca
  > option: Mexico
    - value: mx
`;

const selectWithStyles = `ptml:
> select:
  - id: country
  - styles:
    - width: 100%
    - padding: 0.5em
    - border: 1px solid #ccc
    - border-radius: 3px
    - font-size: 1em
  > option: United States
    - value: us
  > option: Canada
    - value: ca
  > option: Mexico
    - value: mx
`;

const selectWithValue = `state:
- selectedCountry: ca

ptml:
> select:
  - id: country
  - value: $selectedCountry
  > option: United States
    - value: us
  > option: Canada
    - value: ca
  > option: Mexico
    - value: mx
`;

const selectInForm = `ptml:
> form:
  > text: Country:
  > select:
    - id: country
    - styles:
      - width: 100%
      - padding: 0.5em
    > option: United States
      - value: us
    > option: Canada
      - value: ca
    > option: Mexico
      - value: mx
  > button:
    > text: Submit
    - click:
      ! set: $country $form.country
      ! clear: form.country
`;

const selectWithDynamicOptions = `recordList: countries
- record:
  - code: us
  - name: United States
- record:
  - code: ca
  - name: Canada
- record:
  - code: mx
  - name: Mexico

ptml:
> form:
  > text: Select Country:
  > select:
    - id: country
    > each: countries as $country
      > option: $country.name
        - value: $country.code
  > button:
    > text: Submit
    - click:
      ! set: $selectedCountry $form.country
`;

const selectWithNoBinding = `ptml:
> form:
  > select:
    > option: UK
      - value: uk
`;

const selectBoundByValueOnly = `state:
- country: uk

ptml:
> select:
  - value: $country
  > option: UK
    - value: uk
`;

const selectSortedOptions = `recordList: countries
- record:
  - code: us
  - name: United States
- record:
  - code: ca
  - name: Canada

ptml:
> select:
  - id: country
  > each: countries as $country
    - sort: name
    > option: $country.name
      - value: $country.code
`;

const selectWithConditionalOption = `state:
- advanced: true

ptml:
> select:
  - id: mode
  > option: Basic
    - value: basic
  ? if: $advanced is true
    > option: Advanced
      - value: advanced
`;

const selectWithNoOptions = `ptml:
> select:
  - id: country
`;

// Legitimate: the list may be empty at runtime, but the select can produce
// options, so it is not an empty dropdown by construction.
const selectOverPossiblyEmptyList = `recordList: countries

ptml:
> select:
  - id: country
  > each: countries as $country
    > option: $country.name
      - value: $country.code
`;

const selectWithBoxChild = `ptml:
> select:
  - id: country
  > box:
    > option: UK
      - value: uk
`;

export {
  selectSortedOptions,
  selectWithConditionalOption,
  selectWithNoOptions,
  selectOverPossiblyEmptyList,
  selectWithBoxChild,
  basicSelect,
  selectWithStyles,
  selectWithValue,
  selectInForm,
  selectWithDynamicOptions,
  selectWithNoBinding,
  selectBoundByValueOnly,
};

export const docExample = `
state:
- colour: blue

ptml:
> select:
  - value: $colour
  > option: Red
    - value: red
  > option: Green
    - value: green
  > option: Blue
    - value: blue
> text: You picked: $colour
`;

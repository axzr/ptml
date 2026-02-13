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
      ! set: $country form.country
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
    > each: countries as country
      > option: $country.name
        - value: $country.code
  > button:
    > text: Submit
    - click:
      ! set: $selectedCountry form.country
`;

export { basicSelect, selectWithStyles, selectWithValue, selectInForm, selectWithDynamicOptions };

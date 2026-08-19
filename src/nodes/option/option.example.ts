export const docExample = `
state:
- country: uk

ptml:
> select:
  - value: $country
  > option: United States
    - value: us
  > option: United Kingdom
    - value: uk
  > option: Germany
    - value: de
`;

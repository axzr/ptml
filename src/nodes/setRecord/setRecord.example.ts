export const docExample = `
recordList: users
- record:
  - name: Alice

state:
- index: 0

ptml:
> button:
  > text: Update user
  - click:
    ! setRecord: users $index
      - record:
        - name: Bob
`;

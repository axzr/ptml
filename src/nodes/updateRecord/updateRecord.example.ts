export const docExample = `
recordList: contacts
- record:
  - id: 1
  - name: Alice

state:
- newName: Bob

ptml:
> button:
  > text: Rename to $newName
  - click:
    ! updateRecord: contacts
      - where: id is 1
      - record:
        - name: $newName
`;

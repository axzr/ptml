export const docExample = `
recordList: users
- record:
  - name: Alice
- record:
  - name: Bob

state:
- index: 0

ptml:
> getRecord: users $index as $user
  > text: $user.name
`;

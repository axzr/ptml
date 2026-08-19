export const docExample = `
recordList: users
- record:
  - name: Alice
- record:
  - name: Bob

valueList: indices
- 0
- 1

ptml:
> each: indices as $i
  ! getRecord: users $i as $user
  > text: $user.name
`;

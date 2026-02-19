export const docExample = `
recordList: tasks
- record:
  - id: 1
  - title: Buy milk
- record:
  - id: 2
  - title: Walk dog

ptml:
> button:
  > text: Remove task 1
  - click:
    ! removeRecord: tasks
      - where: id is 1
`;

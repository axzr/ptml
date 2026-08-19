export const docExample = `
recordList: tasks
- record:
  - id: 1
  - title: Buy milk
  - done: false

ptml:
> button:
  > text: Mark task 1 done
  - click:
    ! updateRecord: tasks
      - where: id is 1
      - record:
        - done: true
`;

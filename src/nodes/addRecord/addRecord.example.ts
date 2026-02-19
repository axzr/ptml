export const docExample = `
recordList: tasks
- record:
  - title: Buy milk

ptml:
> each: tasks as $task
  > text: $task.title
> button:
  > text: Add task
  - click:
    ! addRecord: tasks
      - record:
        - title: New task
`;

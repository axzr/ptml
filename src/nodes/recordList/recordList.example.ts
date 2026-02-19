const recordListWithRecords = `
recordList: expenses
- record:
  - description: Groceries
  - category: Food
  - amount: 45.50
- record:
  - description: Bus ticket
  - category: Transport
  - amount: 2.50

ptml:
> box
  > each: expenses as $expense
    > box
      > text: $expense.description
      > text: $expense.category
      > text: $expense.amount
`;

export { recordListWithRecords };

export const docExample = `
recordList: expenses
- record:
  - name: Rent
  - amount: 1200
- record:
  - name: Food
  - amount: 300

ptml:
> each: expenses as $expense
  > text: $expense.name -- $expense.amount
`;

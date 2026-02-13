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

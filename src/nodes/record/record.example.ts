const basicRecord = `
recordList: expenses
- record:
  - description: Groceries
  - category: Food
  - amount: 45.50
`;

const recordWithOptionalData = `
recordList: items
- record:
  - name: Item 1
  - description:
  - price: 10.00
`;

const recordWithMultipleKeys = `
recordList: people
- record:
  - firstName: John
  - lastName: Doe
  - age: 30
  - email: john@example.com
  - city: New York
`;

const invalidRecordWithData = `
recordList: items
- record: some data
  - name: Item 1
`;

const invalidRecordNoChildren = `
recordList: items
- record:
`;

const invalidRecordDuplicateKeys = `
recordList: items
- record:
  - name: Item 1
  - name: Item 2
`;

const invalidRecordEmptyKey = `
recordList: items
- record:
  - : value
`;

export {
  basicRecord,
  recordWithOptionalData,
  recordWithMultipleKeys,
  invalidRecordWithData,
  invalidRecordNoChildren,
  invalidRecordDuplicateKeys,
  invalidRecordEmptyKey,
};

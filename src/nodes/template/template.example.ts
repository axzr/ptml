const basicTemplate = `
template: home
> text: this is the home page and it is displayed
template: shop
> text: this is the shop page and it is not displayed
ptml:
> show: home
`;

const templateWithSimpleParam = `
template: greeting name
> text: Hello $name
ptml:
> show: greeting John
`;

const templateWithObjectParam = `
recordList: expenses
- record:
  - description: Groceries
  - category: Food
  - amount: 45.50
- record:
  - description: Bus ticket
  - category: Transport
  - amount: 2.50

template: expense-item expense
> text: $expense.description - $expense.amount

ptml:
> each: expenses as $expense
  > show: expense-item $expense
`;

const templateWithDynamicName = `
state:
- page: home
template: home
> text: this is the home page
template: shop
> text: this is the shop page
ptml:
> show: $page
`;

const templateInEachLoop = `
recordList: contacts
- record:
  - id: 1
  - name: John Doe
  - email: john@example.com
- record:
  - id: 2
  - name: Jane Smith
  - email: jane@example.com

template: contact-card contact
> box:
  > text: $contact.name
  > text: $contact.email

ptml:
> each: contacts as $contact
  > show: contact-card $contact
`;

const templateWithNestedPropertyAccess = `
recordList: contacts
- record:
  - id: 1
  - name: John Doe
  - email: john@example.com
  - phone: 555-1234
  - address: 123 Main St
  - notes: Important client
- record:
  - id: 2
  - name: Jane Smith
  - email: jane@example.com
  - phone: 555-5678
  - address: 456 Oak Ave

template: contact-card contact
> box:
  > text: $contact.name
  > text: $contact.email
  > text: $contact.phone
  > text: $contact.address
  ? if: $contact.notes is not empty
    > text: Note: $contact.notes

ptml:
> each: contacts as $contact
  > show: contact-card $contact
`;

const templateWithMultipleParams = `
template: greeting name age
- text: Hello $name
ptml:
- show: greeting John 30
`;

const templateParameterNestedPropertyInText = `
template: contact-card contact
- text: $contact.name
- text: $contact.email
ptml:
- show: contact-card $contact
`;

const templateParameterNestedPropertyInIfCondition = `
template: contact-card contact
- if: $contact.notes is not empty
  - text: Note: $contact.notes
ptml:
- show: contact-card $contact
`;

const templateParameterNestedPropertyInIfConditionEmpty = `
template: contact-card contact
- if: $contact.notes is empty
  - text: No notes
ptml:
- show: contact-card $contact
`;

export {
  basicTemplate,
  templateWithSimpleParam,
  templateWithObjectParam,
  templateWithDynamicName,
  templateInEachLoop,
  templateWithNestedPropertyAccess,
  templateWithMultipleParams,
  templateParameterNestedPropertyInText,
  templateParameterNestedPropertyInIfCondition,
  templateParameterNestedPropertyInIfConditionEmpty,
};

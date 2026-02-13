const basicTemplate = `show: home
template: home
- text: this is the home page and it is displayed
template: shop
- text: this is the shop page and it is not displayed`;

const nestedTemplates = `
template: duplicate
- text: this is the duplicated template and it is displayed twice
box:
- show: duplicate
- box:
  - text: this is also shown
  - show: duplicate
`;

const templateWithStyles = `
template: styled
- text: this is the styled template and it is displayed with styles
- styles:
  - color: red
  - font-size: 1.5em
  - font-weight: bold
  - text-align: center
show: styled
`;

const templateStylesOverride = `
template: styled
- text: this is the styled template and it is displayed with styles
- text: the show styles should combine and override the template styles
- styles:
  - color: blue
  - font-size: 1.5em
  - font-weight: bold
show: styled
- styles:
  - color: green
  - font-size: 2em
  - text-align: center
`;

const pageChangingTemplate = `
state:
- page: home
template: home
- text: this is the home page
- button:
  - text: go to shop
  - click:
    - set: page shop
template: shop
- text: this is the shop page
- button:
  - text: go to home
  - click:
    - set: page home
show: $page
`;

const templateWithSimpleParam = `
template: greeting name
- text: Hello $name
show: greeting John
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
- record:
  - description: Movie tickets
  - category: Entertainment
  - amount: 24.00
- record:
  - description: Coffee
  - category: Food
  - amount: 4.50
- record:
  - description: Electricity bill
  - category: Bills
  - amount: 85.00

each: expenses as expense
- show: expense-item $expense

template: expense-item expense
- text: $expense.description - $expense.amount
`;

const eachIfShowTemplate = `
recordList: expenses
- record:
  - description: Groceries
  - category: Food
  - amount: 45.50
- record:
  - description: Bus ticket
  - category: Transport
  - amount: 2.50
- record:
  - description: Movie tickets
  - category: Entertainment
  - amount: 24.00
- record:
  - description: Coffee
  - category: Food
  - amount: 4.50
- record:
  - description: Electricity bill
  - category: Bills
  - amount: 85.00

state:
- selectedCategory: Food

each: expenses as expense
- if: $selectedCategory is $expense.category
  - show: expense-item $expense
  
template: expense-item expense
- text: $expense.description - $expense.amount
`;

export {
  basicTemplate,
  nestedTemplates,
  templateWithStyles,
  templateStylesOverride,
  pageChangingTemplate,
  templateWithSimpleParam,
  templateWithObjectParam,
  eachIfShowTemplate,
};

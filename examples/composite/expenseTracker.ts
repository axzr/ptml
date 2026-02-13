const expenseTracker = `
state:
- selectedCategory:
- totalExpenses: 0

valueList: categories
- Food
- Transport
- Entertainment
- Shopping
- Bills
- Other

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

init: calculateTotal

function: calculateTotal
- set: totalExpenses 0
- each: expenses as expense
  - set: totalExpenses ($totalExpenses $expense.amount | add)

function: addExpense category amount description
- add:
  - recordList: expenses
  - record:
    - description: description
    - category: category
    - amount: amount
- call: calculateTotal

define: app-container
- display: flex
- flex-direction: column
- padding: 2em
- max-width: 1200px
- margin: 0 auto
- font-family: Arial, sans-serif

define: app-title
- font-size: 2em
- font-weight: bold
- margin-bottom: 1em

define: section-container
- display: flex
- flex-direction: row
- gap: 1em
- margin-bottom: 2em
- padding: 1em
- background-color: #f5f5f5
- border-radius: 5px

define: form-container
- display: flex
- flex-direction: row
- gap: 1em
- margin-bottom: 2em
- padding: 1em
- background-color: #fff
- border: 1px solid #ddd
- border-radius: 5px

define: expenses-container
- background-color: #fff
- border: 1px solid #ddd
- border-radius: 5px
- padding: 1em

define: expenses-header
- font-weight: bold
- font-size: 1.2em
- margin-bottom: 1em
- padding-bottom: 0.5em
- border-bottom: 2px solid #ccc

define: category-button
- padding: 0.5em 1em
- background-color: #4ecdc4
- color: white
- border: none
- border-radius: 3px
- cursor: pointer
- if: selectedCategory is category
  - background-color: #2ecc71
- else:
  - background-color: #95a5a6

define: category-buttons-container
- display: flex
- gap: 0.5em
- margin-top: 0.5em
- flex-wrap: wrap

define: total-display
- flex: 1
- text-align: right

define: total-amount
- font-size: 1.5em
- font-weight: bold
- color: #2ecc71

define: form-inputs
- display: flex
- gap: 0.5em
- margin-top: 0.5em
- flex-wrap: wrap

define: text-input
- flex: 1
- min-width: 200px
- padding: 0.5em
- border: 1px solid #ccc
- border-radius: 3px

define: number-input
- width: 100px
- padding: 0.5em
- border: 1px solid #ccc
- border-radius: 3px

define: category-select-buttons
- display: flex
- gap: 0.5em

define: add-expense-button
- padding: 0.5em 1em
- background-color: #3498db
- color: white
- border: none
- border-radius: 3px
- cursor: pointer
- font-size: 0.9em

define: expense-item-container
- display: flex
- justify-content: space-between
- align-items: center
- padding: 0.75em
- margin-bottom: 0.5em
- background-color: #f9f9f9
- border-radius: 3px
- border-left: 4px solid #4ecdc4

define: expense-item-content
- flex: 1

define: remove-button
- padding: 0.25em 0.5em
- background-color: #e74c3c
- color: white
- border: none
- border-radius: 3px
- cursor: pointer

template: expense-item expense
- box:
  - styles: expense-item-container
  - box:
    - styles: expense-item-content
    - text: $expense.description - $expense.amount - $expense.category
  - button:
    - text: Remove
    - styles: remove-button
    - click:
      - remove: expense
      - call: calculateTotal

box:
- define: app-container

- box:
  - styles: app-title
  - text: Expense Tracker

- box:
  - styles: section-container

  - box:
    - styles:
      - flex: 1
    - text: Filter by Category:
    - box:
      - styles: category-buttons-container
      - button:
        - text: All
        - styles: category-button
        - click:
          - clear: selectedCategory
          - call: calculateTotal
      - each: categories as category
        - button:
          - text: $category
          - styles: category-button
          - click:
            - set: selectedCategory $category
            - call: calculateTotal

  - box:
    - styles: total-display
    - text: Total Expenses:
    - box:
      - styles: total-amount
      - text: $ $totalExpenses

- box:
  - styles: form-container

  - text: Add New Expense:
  - form:
    - styles: form-inputs
    - input:
      - id: expenseDescription
      - type: text
      - styles: text-input
    - input:
      - id: expenseAmount
      - type: number
      - styles: number-input
    - box:
      - styles: category-select-buttons
      - each: categories as category
        - button:
          - text: $category
          - styles: add-expense-button
          - click:
            - call: addExpense $category form.expenseAmount form.expenseDescription
            - clear: form.expenseDescription
            - clear: form.expenseAmount

- box:
  - styles: expenses-container

  - box:
    - styles: expenses-header
    - text: Expenses
    - if: $selectedCategory is not All
      - text:  - $selectedCategory

  - each: expenses as expense
    - if: $selectedCategory is All
      - show: expense-item $expense
    - if: $selectedCategory is $expense.category
      - show: expense-item $expense
`;

export { expenseTracker };

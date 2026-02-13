const nameForm = `
state:
- name:

text: Name: $name

form:
- text: Name:
- input:
  - id: name
  - type: text
- button:
  - text: Submit
  - click:
    - set: name form.name
    - clear: form.name
`;

const styledInputForm = `
form:
- styles:
  - display: flex
  - flex-direction: row
  - gap: 0.5em
  - margin-top: 0.5em
- input:
  - id: name
  - type: text
  - styles:
    - flex: 1
    - padding: 0.5em
    - border: 1px solid #ccc
    - border-radius: 3px
`;

const formAddToList = `
form:
- input:
  - id: newTodoText
  - type: text
- button:
  - text: Add
  - click:
    - add:
      - valueList: todoItems
      - value: form.newTodoText
    - clear: form.newTodoText

valueList: todoItems
- item 1
- item 2
- item 3

box:
- each: todoItems as item
  - box:
    - text: $item
    - button:
      - text: Remove
      - click:
        - remove: item
`;

export { nameForm, styledInputForm, formAddToList };

const todo = `
state:
- newTodoText:

valueList: todoItems
- Buy groceries
- Write blog post
- Review PR

valueList: doingItems
- Fix bug in login

valueList: doneItems
- Setup project
- Deploy to production

function: addTodo text
- call: addToList todoItems $text
- set: newTodoText

function: moveTo newList
- add
  - valueList: newList
  - value: $item
- remove: item

box:
- styles:
  - display: flex
  - flex-direction: column
  - padding: 2em
  - max-width: 1200px
  - margin: 0 auto

- box:
  - styles:
    - display: flex
    - flex-direction: row
    - gap: 1em
    - margin-bottom: 2em
    - padding: 1em
    - background-color: #f5f5f5
    - border-radius: 5px

  - box:
    - styles:
      - flex: 1
    - text: New Todo:
    - form:
      - styles:
        - display: flex
        - gap: 0.5em
        - margin-top: 0.5em
      - input:
        - id: newTodoText
        - type: text
        - styles:
          - flex: 1
          - padding: 0.5em
          - border: 1px solid #ccc
          - border-radius: 3px
      - button:
        - text: Add
        - styles:
          - padding: 0.5em 1em
          - background-color: #4ecdc4
          - color: white
          - border: none
          - border-radius: 3px
          - cursor: pointer
        - click:
          - add:
            - list: todoItems
            - value: form.newTodoText
          - clear: form.newTodoText

- box:
  - styles:
    - display: grid
    - grid-template-columns: repeat(3, 1fr)
    - gap: 1em

  - box:
    - styles:
      - background-color: #ebecf0
      - border-radius: 5px
      - padding: 1em
      - min-height: 400px

    - box:
      - styles:
        - font-weight: bold
        - font-size: 1.2em
        - margin-bottom: 1em
        - padding-bottom: 0.5em
        - border-bottom: 2px solid #ccc
      - text: Todo

    - each: todoItems
      - box:
        - styles:
          - background-color: white
          - padding: 0.75em
          - margin-bottom: 0.5em
          - border-radius: 3px
          - box-shadow: 0 1px 0 rgba(9,30,66,.25)
        - text: $item
        - box:
          - styles:
            - display: flex
            - gap: 0.5em
            - margin-top: 0.5em
          - button:
            - text: →
            - styles:
              - padding: 0.25em 0.5em
              - background-color: #4ecdc4
              - color: white
              - border: none
              - border-radius: 3px
              - cursor: pointer
            - click:
              - call: moveTo doingItems 

  - box:
    - styles:
      - background-color: #ebecf0
      - border-radius: 5px
      - padding: 1em
      - min-height: 400px

    - box:
      - styles:
        - font-weight: bold
        - font-size: 1.2em
        - margin-bottom: 1em
        - padding-bottom: 0.5em
        - border-bottom: 2px solid #ccc
      - text: Doing

    - each: doingItems
      - box:
        - styles:
          - background-color: white
          - padding: 0.75em
          - margin-bottom: 0.5em
          - border-radius: 3px
          - box-shadow: 0 1px 0 rgba(9,30,66,.25)
        - text: $item
        - box:
          - styles:
            - display: flex
            - gap: 0.5em
            - margin-top: 0.5em
          - button:
            - text: ←
            - styles:
              - padding: 0.25em 0.5em
              - background-color: #95a5a6
              - color: white
              - border: none
              - border-radius: 3px
              - cursor: pointer
            - click:
              - call: moveTo todoItems 
          - button:
            - text: →
            - styles:
              - padding: 0.25em 0.5em
              - background-color: #2ecc71
              - color: white
              - border: none
              - border-radius: 3px
              - cursor: pointer
            - click:
              - call: moveTo doneItems 

  - box:
    - styles:
      - background-color: #ebecf0
      - border-radius: 5px
      - padding: 1em
      - min-height: 400px

    - box:
      - styles:
        - font-weight: bold
        - font-size: 1.2em
        - margin-bottom: 1em
        - padding-bottom: 0.5em
        - border-bottom: 2px solid #ccc
      - text: Done

    - each: doneItems
      - box:
        - styles:
          - background-color: white
          - padding: 0.75em
          - margin-bottom: 0.5em
          - border-radius: 3px
          - box-shadow: 0 1px 0 rgba(9,30,66,.25)
        - text: $item
        - box:
          - styles:
            - display: flex
            - gap: 0.5em
            - margin-top: 0.5em
          - button:
            - text: ←
            - styles:
              - padding: 0.25em 0.5em
              - background-color: #95a5a6
              - color: white
              - border: none
              - border-radius: 3px
              - cursor: pointer
            - click:
              - call: moveTo doingItems 
`;

export { todo };

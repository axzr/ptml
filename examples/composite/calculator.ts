const calculator = `
state:
- display: 0
- saved: 0
- nextFunction:

function: add
- set: $display ($display $saved | add)
- set: $saved 0

function: subtract
- set: $display ($display $saved | subtract)
- set: $saved 0

function: multiply
- set: $display ($display $saved | multiply)
- set: $saved 0

function: divide
- set: $display ($display $saved | divide)
- set: $saved 0

function: addDigit digit
- set: $display ($display 10 | multiply) $digit | add

box:
- styles:
  - display: flex
  - flex-direction: column
  - align-items: center
  - padding: 2em
  - max-width: 400px
  - margin: 0 auto

- box:
  - styles:
    - width: 100%
    - padding: 1em
    - background-color: #f0f0f0
    - border: 2px solid #333
    - border-radius: 5px
    - margin-bottom: 1em
    - text-align: right
    - font-size: 2em
    - font-weight: bold
  - text: $display

- box:
  - styles:
    - display: grid
    - grid-template-columns: repeat(4, 1fr)
    - gap: 0.5em
    - width: 100%

  - button:
    - text: C
    - styles:
      - background-color: #ff6b6b
      - color: white
      - font-weight: bold
    - click:
      - set: $display 0
      - set: $saved 0
      - set: $nextFunction undefined

  - button:
    - text: ÷
    - styles:
      - background-color: #4ecdc4
      - color: white
      - font-weight: bold
    - click:
      - set: $nextFunction divide
      - set: $saved $display
      - set: $display 0

  - button:
    - text: ×
    - styles:
      - background-color: #4ecdc4
      - color: white
      - font-weight: bold
    - click:
      - set: $nextFunction multiply
      - set: $saved $display
      - set: $display 0

  - button:
    - text: −
    - styles:
      - background-color: #4ecdc4
      - color: white
      - font-weight: bold
    - click:
      - set: $nextFunction subtract
      - set: $saved $display
      - set: $display 0

  - button:
    - text: 7
    - styles:
      - background-color: #95a5a6
      - color: white
      - font-weight: bold
    - click:
      - call: addDigit 7

  - button:
    - text: 8
    - styles:
      - background-color: #95a5a6
      - color: white
      - font-weight: bold
    - click:
      - call: addDigit 8

  - button:
    - text: 9
    - styles:
      - background-color: #95a5a6
      - color: white
      - font-weight: bold
    - click:
      - call: addDigit 9

  - button:
    - text: +
    - styles:
      - background-color: #4ecdc4
      - color: white
      - font-weight: bold
    - click:
      - set: $nextFunction add
      - set: $saved $display
      - set: $display 0

  - button:
    - text: 4
    - styles:
      - background-color: #95a5a6
      - color: white
      - font-weight: bold
    - click:
      - call: addDigit 4

  - button:
    - text: 5
    - styles:
      - background-color: #95a5a6
      - color: white
      - font-weight: bold
    - click:
      - call: addDigit 5

  - button:
    - text: 6
    - styles:
      - background-color: #95a5a6
      - color: white
      - font-weight: bold
    - click:
      - call: addDigit 6

  - button:
    - text: =
    - styles:
      - background-color: #2ecc71
      - color: white
      - font-weight: bold
    - click:
      - call: $nextFunction
    - disabled: $nextFunction is undefined

  - button:
    - text: 1
    - styles:
      - background-color: #95a5a6
      - color: white
      - font-weight: bold
    - click:
      - call: addDigit 1

  - button:
    - text: 2
    - styles:
      - background-color: #95a5a6
      - color: white
      - font-weight: bold
    - click:
      - call: addDigit 2

  - button:
    - text: 3
    - styles:
      - background-color: #95a5a6
      - color: white
      - font-weight: bold
    - click:
      - call: addDigit 3

  - button:
    - text: 0
    - styles:
      - background-color: #95a5a6
      - color: white
      - font-weight: bold
      - grid-column: span 2
    - click:
      - call: addDigit 0
`;

export { calculator };

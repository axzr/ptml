const gameOfLife = `
state:
- gridSize: 30
- generation: 0
- isRunning: false

recordList: grid
recordList: nextGrid

init: initializeGrid

function: initializeGrid
- set: generation 0
- range: gridSize as i
  - range: gridSize as j
    - setRecord: grid i j
      - record:
        - x: i
        - y: j
        - alive: false

function: initializeNextGrid
- range: gridSize as i
  - range: gridSize as j
    - setRecord: nextGrid i j
      - record:
        - x: i
        - y: j
        - alive: false

function: setInitialPattern patternName
- call: initializeGrid
- if: patternName is glider
  - call: setCellAlive 1 0
  - call: setCellAlive 2 1
  - call: setCellAlive 0 2
  - call: setCellAlive 1 2
  - call: setCellAlive 2 2
- if: patternName is blinker
  - call: setCellAlive 10 10
  - call: setCellAlive 11 10
  - call: setCellAlive 12 10
- if: patternName is block
  - call: setCellAlive 10 10
  - call: setCellAlive 11 10
  - call: setCellAlive 10 11
  - call: setCellAlive 11 11
- if: patternName is toad
  - call: setCellAlive 10 10
  - call: setCellAlive 11 10
  - call: setCellAlive 12 10
  - call: setCellAlive 9 11
  - call: setCellAlive 10 11
  - call: setCellAlive 11 11

function: setCellAlive x y
- setRecord: grid x y
  - record:
    - alive: true

function: getCell x y
- each: grid as row
  - each: row as cell
    - if: $cell.x is x
      - if: $cell.y is y
        - return: cell

function: getCellFromNextGrid x y
- each: nextGrid as row
  - each: row as cell
    - if: $cell.x is x
      - if: $cell.y is y
        - return: cell

function: countNeighbors x y
- set: count 0
- set: neighborX ($x 1 | subtract)
- set: neighborY ($y 1 | subtract)
- each: 3 as rowOffset
  - each: 3 as colOffset
    - set: checkX ($neighborX colOffset | add)
    - set: checkY ($neighborY rowOffset | add)
    - if: $checkX is not x
      - if: $checkY is not y
        - call: getCell $checkX $checkY
        - if: $cell.alive is true
          - set: count ($count 1 | add)
    - if: $checkX is x
      - if: $checkY is not y
        - call: getCell $checkX $checkY
        - if: $cell.alive is true
          - set: count ($count 1 | add)
    - if: $checkX is not x
      - if: $checkY is y
        - call: getCell $checkX $checkY
        - if: $cell.alive is true
          - set: count ($count 1 | add)

function: nextGeneration
- set: generation ($generation 1 | add)
- call: initializeNextGrid
- range: gridSize as i
  - range: gridSize as j
    - call: countNeighbors i j
    - call: getCell i j
    - set: nextAlive false
    - if: $cell.alive is true
      - if: $count is 2
        - set: nextAlive true
      - if: $count is 3
        - set: nextAlive true
    - if: $cell.alive is false
      - if: $count is 3
        - set: nextAlive true
    - setRecord: nextGrid i j
      - record:
        - x: i
        - y: j
        - alive: $nextAlive
- range: gridSize as i
  - range: gridSize as j
    - get: nextGrid i j as nextCell
    - setRecord: grid i j
      - record:
        - x: i
        - y: j
        - alive: $nextCell.alive

function: toggleCell x y
- setRecord: grid x y
  - record:
    - alive: not $record.alive

function: clearGrid
- call: initializeGrid

function: toggleRunning
- if: $isRunning is true
  - set: isRunning false
- else:
  - set: isRunning true

define: app-container
- display: flex
- flex-direction: column
- padding: 2em
- max-width: 1400px
- margin: 0 auto
- font-family: Arial, sans-serif
- background-color: #1a1a1a
- min-height: 100vh

define: app-header
- display: flex
- justify-content: space-between
- align-items: center
- margin-bottom: 2em
- padding-bottom: 1em
- border-bottom: 2px solid #333

define: app-title
- font-size: 2.5em
- font-weight: bold
- color: #4ecdc4
- margin: 0

define: generation-display
- font-size: 1.2em
- color: #95a5a6
- font-weight: bold

define: controls-container
- display: flex
- gap: 1em
- margin-bottom: 2em
- padding: 1em
- background-color: #2a2a2a
- border-radius: 5px
- flex-wrap: wrap

define: pattern-buttons
- display: flex
- gap: 0.5em
- flex-wrap: wrap

define: pattern-button
- padding: 0.5em 1em
- background-color: #3498db
- color: white
- border: none
- border-radius: 3px
- cursor: pointer
- font-size: 0.9em

define: control-button
- padding: 0.75em 1.5em
- background-color: #2ecc71
- color: white
- border: none
- border-radius: 5px
- cursor: pointer
- font-size: 1em
- font-weight: bold

define: clear-button
- padding: 0.75em 1.5em
- background-color: #e74c3c
- color: white
- border: none
- border-radius: 5px
- cursor: pointer
- font-size: 1em
- font-weight: bold

define: stop-button
- padding: 0.75em 1.5em
- background-color: #f39c12
- color: white
- border: none
- border-radius: 5px
- cursor: pointer
- font-size: 1em
- font-weight: bold

define: grid-container
- display: flex
- justify-content: center
- align-items: center
- padding: 1em
- background-color: #2a2a2a
- border-radius: 5px
- overflow-x: auto

define: grid-wrapper
- display: inline-block

define: grid-row
- display: flex

define: grid-cell
- width: 15px
- height: 15px
- border: 1px solid #333
- background-color: #1a1a1a
- cursor: pointer
- transition: background-color 0.1s
- if: $cell.alive is true
  - background-color: #4ecdc4
- else:
  - background-color: #1a1a1a

define: grid-cell-hover
- background-color: #555

define: info-panel
- margin-top: 2em
- padding: 1em
- background-color: #2a2a2a
- border-radius: 5px
- color: #95a5a6
- font-size: 0.9em

define: info-title
- font-weight: bold
- color: #4ecdc4
- margin-bottom: 0.5em

define: info-text
- margin-bottom: 0.25em
- line-height: 1.5

template: grid-cell-template cell
- button:
  - styles: grid-cell
  - click:
    - call: toggleCell $cell.x $cell.y

ptml:
- box:
  - styles: app-container

  - box:
  - styles: app-header
  - box:
    - styles: app-title
    - text: Conway's Game of Life
  - box:
    - styles: generation-display
    - text: Generation: $generation

- box:
  - styles: controls-container
  - box:
    - styles: pattern-buttons
    - text: Patterns:
    - button:
      - text: Glider
      - styles: pattern-button
      - click:
        - call: setInitialPattern glider
    - button:
      - text: Blinker
      - styles: pattern-button
      - click:
        - call: setInitialPattern blinker
    - button:
      - text: Block
      - styles: pattern-button
      - click:
        - call: setInitialPattern block
    - button:
      - text: Toad
      - styles: pattern-button
      - click:
        - call: setInitialPattern toad
  - box:
    - styles:
      - display: flex
      - gap: 1em
      - margin-left: auto
    - button:
      - text: Next Generation
      - styles: control-button
      - click:
        - call: nextGeneration
    - button:
      - text: Clear
      - styles: clear-button
      - click:
        - call: clearGrid
    - if: $isRunning is true
      - button:
        - text: Stop
        - styles: stop-button
        - click:
          - call: toggleRunning
    - if: $isRunning is false
      - button:
        - text: Start
        - styles: control-button
        - click:
          - call: toggleRunning

- box:
  - styles: grid-container
  - box:
    - styles: grid-wrapper
    - each: grid as row
      - box:
        - styles: grid-row
        - each: row as cell
          - show: grid-cell-template $cell

- box:
  - styles: info-panel
  - box:
    - styles: info-title
    - text: Rules of Conway's Game of Life
  - box:
    - styles: info-text
    - text: 1. Any live cell with fewer than two live neighbors dies (underpopulation)
  - box:
    - styles: info-text
    - text: 2. Any live cell with two or three live neighbors survives
  - box:
    - styles: info-text
    - text: 3. Any live cell with more than three live neighbors dies (overpopulation)
  - box:
    - styles: info-text
    - text: 4. Any dead cell with exactly three live neighbors becomes alive (reproduction)
  - box:
    - styles: info-text
    - text: Click cells to toggle them on/off. Click "Next Generation" to advance the simulation.
`;

export { gameOfLife };

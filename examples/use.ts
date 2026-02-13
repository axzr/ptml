const boxStyles = `
define: box-styles
- background-color: red
- color: white
`;

const basicTemplate = `
template: basic-template
- box:
  - text: Hello World
  - styles:
    - background-color: blue
    - color: yellow
`;

const useBasic = `
use: boxStyles

box:
- styles: box-styles
- text: Hello World
- text: This is a box with styles imported from boxStyles.ts
- text: The styles are:
- text: background-color: red
- text: color: white
`;

const useTemplate = `
use: basicTemplate

show: basic-template

box:
- show: basic-template
`;

export { boxStyles, basicTemplate, useBasic, useTemplate };

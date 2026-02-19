const compileBasic = `
state:
- source: > text: Hello from compiled PTML

ptml:
> compile: $source
`;

const compileWithParentState = `
state:
- name: World
- source: > text: Hello, $name!

ptml:
> compile: $source
`;

const compileEmptySource = `
state:
- source:

ptml:
> compile: $source
`;

const compileWithStyles = `
state:
- source: > text: Styled compiled content

ptml:
> compile: $source
  - styles:
    - border: 1px solid #ccc
    - padding: 1rem
`;

const compileWithDefinedStyles = `
state:
- source: > text: Styled text\\n  - styles: compiled-style

define: compiled-style
- color: blue

ptml:
> compile: $source
`;

const compileInvalidSyntax = `
state:
- source: >>>invalid ptml<<<

ptml:
> compile: $source
`;

const compileMissingVariable = `
ptml:
> compile: $nonexistent
`;

const compileWithButtonElement = `
state:
- source: > button: Click me

ptml:
> compile: $source
`;

const compileWithoutDollarPrefix = `
ptml:
> compile: notAVariable
`;

const compileWithNoData = `
ptml:
> compile:
`;

const compileWithFileReference = `
state:
- pageSource: file(page.ptml)

ptml:
> compile: $pageSource
`;

const compileWithFileAndImport = `
import: styles.ptml

state:
- pageSource: file(page.ptml)

ptml:
> compile: $pageSource
`;

const compileWithMissingFileReference = `
state:
- pageSource: file(nonexistent.ptml)

ptml:
> compile: $pageSource
`;

export {
  compileBasic,
  compileWithParentState,
  compileEmptySource,
  compileWithStyles,
  compileWithDefinedStyles,
  compileInvalidSyntax,
  compileMissingVariable,
  compileWithButtonElement,
  compileWithoutDollarPrefix,
  compileWithNoData,
  compileWithFileReference,
  compileWithFileAndImport,
  compileWithMissingFileReference,
};

export const docExample = `
state:
- source: > text: Hello from compiled PTML!

ptml:
> compile: $source
`;

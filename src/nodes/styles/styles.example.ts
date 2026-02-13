const textWithStyles = `ptml:
> text: this is text with children styles
  - styles
    - font-family: Arial, sans-serif
    - font-size: 16px`;

const textWithStylesWithColon = `ptml:
> text: this is text with children styles with colon
  - styles:
    - font-family: Arial, sans-serif
    - font-size: 16px`;

const boxWithStyles = `ptml:
> box:
  - styles:
    - color: red
    - background-color: blue
    - font-weight: bold
  > text: this is text with styles
    - styles:
      - color: green
      - font-size: 36px`;

const rootStylesWithNoData = `
define:
- color: red
- background-color: blue
- font-weight: bold
`;

const namedStyles = `
define: named-styles
- color: red
- background-color: blue
- font-weight: bold

ptml:
> text: text with named styles
  - styles: named-styles`;

const namedStylesWithOverride = `
define: named-styles
- color: red
- background-color: blue
- font-weight: bold

ptml:
> text: text with named styles - it should be green with a blue background
  - styles: named-styles
    - color: green`;

const invalidIfCondition = `
ptml:
> text: the if below is invalid, as it is missing the $ prefix on isActive
  - styles:
    ? if: isActive
      - color: green
    ? else:
      - color: blue
`;

const conditionalStyles = `
state:
- isActive: false

ptml:
> text: this text indicates if the state is active (it should never be red)
  - styles:
    - font-weight: bold
    - color: red
    ? if: $isActive
      - color: green
    ? else:
      - color: blue
> box:
> button: 
  > text: toggle the state
  - click
    ! set: $isActive !$isActive
`;

const namedConditionalStyles = `
state:
- isActive: false

define: active-styles
- color: red
? if: $isActive
  - color: green
? else:
  - color: blue

ptml:
> text: this text indicates if the state is active (it should never be red)
  - styles: active-styles
    - font-weight: bold
> box:
> button: 
  > text: toggle the state
  - click
    ! set: $isActive !$isActive
`;

const invalidComparison = `
ptml:
> text: the if below is invalid, as it is missing the $ prefix on isActive
  - styles:
    ? if: isActive is $index
      - color: green
    ? else:
      - color: blue
`;

const invalidComparison2 = `
ptml:
> text: the if below is invalid, as $isActive isn't a defined state value
  - styles:
    ? if: $isActive is $index
      - color: green
    ? else:
      - color: blue
`;

const invalidComparison3 = `
state:
- isActive: false

ptml:
> text: the if below is invalid, as $index isn't a defined state value
  - styles:
    ? if: $isActive is $index
      - color: green
    ? else:
      - color: blue
`;

const invalidComparison4 = `
state:
- activeItem: 0

define: active-item
- color: red
? if: $activeItem is $index
  - color: green
? else:
  - color: blue
`;

const namedStylesInspectLoopsForVariables = `
state:
- activeItem: 0
valueList: items
- item 1
- item 2
- item 3

define: active-item
- color: red
? if: $activeItem is $index
  - color: green
? else:
  - color: blue

ptml:
> box:
  > each: items as $item, index as $index
    > box:
      - styles: active-item
      > text: $item
`;

const conditionInList = `
valueList: items
- item 1
- item 2
- item 3

state:
- activeItem: 0

define: active-item
- color: red
? if: $activeItem is $index
  - color: green
? else:
  - color: blue

ptml:
> box:
  > each: items as $item, index as $index
    > box:
      - styles:
        - padding: 1em
        - background-color: #f5f5f5
        - border-radius: 5px
        - display: flex
        - justify-content: space-between
      > text: $item
        - styles: active-item
      > button:
        > text: Select
        - click:
          ! set: $activeItem $index
`;

const inlineStylesWithBreakpoint = `
breakpoints:
- small: 768
- large:

ptml:
> box:
  - styles
    - breakpoint: small
      - display: flex
`;

const stylesWithStateInterpolation = `
state:
- themeColor: #e6007e
- fontSize: 20px

ptml:
> text: styled from state
  - styles:
    - color: $themeColor
    - font-size: $fontSize
`;

export {
  textWithStyles,
  textWithStylesWithColon,
  boxWithStyles,
  rootStylesWithNoData,
  namedStyles,
  namedStylesWithOverride,
  invalidIfCondition,
  conditionalStyles,
  namedConditionalStyles,
  invalidComparison,
  invalidComparison2,
  invalidComparison3,
  invalidComparison4,
  namedStylesInspectLoopsForVariables,
  conditionInList,
  inlineStylesWithBreakpoint,
  stylesWithStateInterpolation,
};

const breakpointRendersWithViewport = `
breakpoints:
- small: 768
- medium: 1024
- large:

ptml:
> box:
  > breakpoint: small
    > text: narrow
  > breakpoint: large
    > text: wide
`;

const breakpointRendersNothingWhenViewportOmitted = `
breakpoints:
- small: 768
- large:

ptml:
> box:
  > breakpoint: small
    > text: narrow
  > breakpoint: large
    > text: wide
`;

const breakpointExample = `
breakpoints:
- small: 768
- medium: 1024
- large:

ptml:
> box:
  > breakpoint: small
    > text: Viewport is less than 768px
  > breakpoint: medium
    > text: Viewport is between 768 and 1024px
  > breakpoint: large
    > text: Viewport is 1024px or more
  > breakpoint: medium or less
    > text: Viewport is less than 1024px
`;

const breakpointOrLessRendersBelowUpperBound = `
breakpoints:
- small: 768
- medium: 1024
- large:

ptml:
> box:
  > breakpoint: medium or less
    > text: narrowish
  > breakpoint: medium or more
    > text: widish
`;

const breakpointUnknownLabel = `
breakpoints:
- small: 768
- large:

ptml:
> box:
  > breakpoint: totalNonsenseLabel
    > text: never shown
`;

// The natural workaround people reach for when "small or less" is rejected --
// it parses as a single label, so it has to be caught as an unknown one.
const breakpointHyphenatedWorkaround = `
breakpoints:
- small: 768
- large:

ptml:
> box:
  > breakpoint: small-or-less
    > text: never shown
`;

const breakpointUnknownLabelInDefine = `
breakpoints:
- small: 768
- large:

define: card
- width: 100%
> breakpoint: nonsense or more
  - width: 50%

ptml:
> box:
  - styles: card
  > text: Responsive card
`;

const breakpointWithoutBreakpointsDeclaration = `
ptml:
> box:
  > breakpoint: small
    > text: never shown
`;

const breakpointMalformedModifier = `
breakpoints:
- small: 768
- large:

ptml:
> box:
  > breakpoint: small or
    > text: never shown
`;

export {
  breakpointRendersWithViewport,
  breakpointRendersNothingWhenViewportOmitted,
  breakpointExample,
  breakpointOrLessRendersBelowUpperBound,
  breakpointUnknownLabel,
  breakpointHyphenatedWorkaround,
  breakpointUnknownLabelInDefine,
  breakpointWithoutBreakpointsDeclaration,
  breakpointMalformedModifier,
};

// Mobile-first: the base width stands on its own and is what renders when no
// viewport is known, and the breakpoint block widens it from large upwards.
// Putting every width inside a breakpoint block instead would leave the card
// with no width at all wherever no viewport is supplied.
export const docExample = `
breakpoints:
- small: 768
- large:

define: card
- width: 100%
> breakpoint: large or more
  - width: 50%

ptml:
> box:
  - styles: card
  > text: Responsive card
`;

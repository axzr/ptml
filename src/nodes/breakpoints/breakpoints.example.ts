const breakpointsValid = `
breakpoints:
- small: 768
- medium: 1024
- large:

ptml:
> box:
  > text: hello
`;

const breakpointsLastHasWidth = `
breakpoints:
- small: 768
- medium: 1024
- large: 1200

ptml:
> box:
  > text: hello
`;

const breakpointsNotAscending = `
breakpoints:
- small: 1024
- medium: 768
- large:

ptml:
> box:
  > text: hello
`;

const breakpointsInvalidWidth = `
breakpoints:
- small: abc
- medium: 1024
- large:

ptml:
> box:
  > text: hello
`;

const breakpointsExample = `
breakpoints:
- small: 768
- medium: 1024
- large:

define: card
> breakpoint: small
  - display: flex
  - flex-direction: column
> breakpoint: medium or more
  - display: block

ptml:
> box:
  > breakpoint: small
     > text: Narrow view
  > breakpoint: large
     > text: Wide view
`;

export {
  breakpointsValid,
  breakpointsLastHasWidth,
  breakpointsNotAscending,
  breakpointsInvalidWidth,
  breakpointsExample,
};

export const docExample = `
breakpoints:
- small: 768
- medium: 1024
- large:
`;

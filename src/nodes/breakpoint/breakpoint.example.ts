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

export { breakpointRendersWithViewport, breakpointRendersNothingWhenViewportOmitted, breakpointExample };

export const docExample = `
breakpoints:
- small: 768
- large:

define: card
> breakpoint: small
  - width: 100%
> breakpoint: large
  - width: 50%

ptml:
> box:
  - styles: card
  > text: Responsive card
`;

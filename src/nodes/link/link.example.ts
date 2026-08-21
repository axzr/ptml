const basicLink = `ptml:
> link:
  - href: https://example.com
`;

const linkWithText = `ptml:
> link:
  - href: /about
  - text: About
`;

const linkWithStateBoundHref = `state:
- url: https://example.com/dynamic

ptml:
> link:
  - href: $url
  - text: Dynamic link
`;

const linkWithTarget = `ptml:
> link:
  - href: https://example.com
  - target: _blank
  - text: Open in new tab
`;

const linkWithStyles = `ptml:
> link:
  - href: https://example.com
  - text: Styled link
  - styles:
    - color: blue
    - textDecoration: underline
`;

const linkWithChild = `ptml:
> link:
  - href: https://example.com
  > text: Click here
`;

const linkWithClick = `state:
- page: home

template: home
> text: Home page
> link:
  - href: #
  - text: Go to shop
  - click:
    ! set: $page shop

template: shop
> text: Shop page
> link:
  - href: #
  - text: Go to home
  - click:
    ! set: $page home

ptml:
> show: $page
`;

// link was the only renderable node that dropped viewportWidth and breakpoints
// when resolving its styles, so responsive styles on a link did nothing at all.
const linkWithBreakpointStyles = `breakpoints:
- mobile: 768
- desktop:

define: nav-link
- font-size: 14px
> breakpoint: desktop or more
  - font-size: 24px

ptml:
> link:
  - href: /about
  - text: About
  - styles: nav-link
`;

export {
  basicLink,
  linkWithText,
  linkWithStateBoundHref,
  linkWithTarget,
  linkWithStyles,
  linkWithChild,
  linkWithClick,
  linkWithBreakpointStyles,
};

export const docExample = `
ptml:
> link:
  - href: https://example.com
  > text: Visit Example
`;

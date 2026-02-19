const windowScrollTop = `
state:
- page: home
ptml:
> box:
  > text: $page
> button:
  > text: go to about
  - click:
    ! set: $page about
    ! window: scrollTop
`;

const windowInvalidOperation = `
state:
- x: 0
ptml:
> button:
  > text: click
  - click:
    ! window: badOp
`;

const windowMissingData = `
ptml:
> button:
  > text: click
  - click:
    ! window:
`;

export { windowScrollTop, windowInvalidOperation, windowMissingData };

export const docExample = `
state:
- page: home

ptml:
> button:
  > text: Back to top
  - click:
    ! window: scrollTop
`;

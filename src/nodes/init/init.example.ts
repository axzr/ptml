const initExample = `
state:
- greeting: yo

function: setGreeting
! set: $greeting Hello, World!

init:
! call: setGreeting

ptml:
> box:
  > text: $greeting
`;

export { initExample };

export const docExample = `
state:
- page: home

function: setPage
! set: $page getting-started

init:
! call: setPage

ptml:
> text: Current page: $page
`;

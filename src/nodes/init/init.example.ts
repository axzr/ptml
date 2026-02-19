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

init:
! set: $page getting-started

ptml:
> text: Current page: $page
`;

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

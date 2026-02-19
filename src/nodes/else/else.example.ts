const elseExample = `
ptml:
? if: $isActive
  > text: If content
? else:
  > text: Else content
`;

export { elseExample };

export const docExample = `
state:
- loggedIn: false

ptml:
? if: $loggedIn
  > text: Welcome back!
? else:
  > text: Please log in.
`;

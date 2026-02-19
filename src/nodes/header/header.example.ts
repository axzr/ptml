const defaultHeader = `ptml:
> header:`;

const headerH1 = `ptml:
> header: h1
  > text: This is a h1`;

const headerH2 = `ptml:
> header: h2
  > text: This is a h2`;

const headerWithTextChild = `ptml:
> header:
  > text: This is a h1`;

const headerInvalidLevel = `ptml:
> header: h7
  > text: Invalid`;

const headerInvalidLevelFoo = `ptml:
> header: foo
  > text: Invalid`;

export { defaultHeader, headerH1, headerH2, headerWithTextChild, headerInvalidLevel, headerInvalidLevelFoo };

export const docExample = `
ptml:
> header: h1
  > text: Page Title
> header: h2
  > text: Section Heading
`;

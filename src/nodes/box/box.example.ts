const emptyBox = `ptml:
> box:`;

const simpleTextBox = `ptml:
> box:
  > text: hello world
`;

const twoTexts = `ptml:
> box:
  > text: hello world
  > text: goodbye world
`;

const twoTextsNoColon = `ptml:
> box
  > text: nodes without data
  > text: are valid with or without a colon
  > text: but there must be nothing else on that line
`;

const nestedBoxesInvalid = `ptml:
> box:
  > text: the box below is invalid as it's not prefixed correctly
  box:
    > text: this text is inside an invalid box
`;

const nestedBoxesValid = `ptml:
> box:
  > text: hello world
  > box:
    > text: nested hello world
`;

const complexBox = `ptml:
> box:
  > text: hello world
  > box:
    > text: nested hello world
    > box:
      > text: nested nested hello world
    > box:
      > text: nested sibling
      > text: nested sibling2
      > box:
        > text: nested nested sibling
        > text: nested nested sibling2
    > box:
      > text: check that we drop back
> box:
  > text: second root level box
  > box:
    > text: second root level nested hello world
    > box:
      > text: second root level nested nested hello world
      > box:
        > text: second root level nested nested nested hello world
`;

const boxWithRoleMain = `ptml:
> box:
  - role: main
  > text: Main content
`;

const boxWithRoleHeader = `ptml:
> box:
  - role: header
  > text: Header content
`;

const boxWithRoleArticle = `ptml:
> box:
  - role: article
  > text: Article content
`;

const boxWithInvalidRole = `ptml:
> box:
  - role: invalid
  > text: content
`;

export {
  emptyBox,
  simpleTextBox,
  twoTexts,
  twoTextsNoColon,
  nestedBoxesInvalid,
  nestedBoxesValid,
  complexBox,
  boxWithRoleMain,
  boxWithRoleHeader,
  boxWithRoleArticle,
  boxWithInvalidRole,
};

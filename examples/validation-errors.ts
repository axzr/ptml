const emptyFile = ``;

const invalidChildIndentTooDeepError = `ptml:
> box:
  > text: hello
      > text: this child has indent 4 but parent is at indent 0, should be indent 2 (actual indent: 4)
`;

export { emptyFile, invalidChildIndentTooDeepError };

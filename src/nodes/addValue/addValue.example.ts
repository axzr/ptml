export const docExample = `
valueList: tags
- urgent

ptml:
> each: tags as $tag
  > text: $tag
> button:
  > text: Add tag
  - click:
    ! addValue: tags new-tag
`;

export const docExample = `
valueList: tags
- urgent
- review
- done

ptml:
> each: tags as $tag
  > text: $tag
  > button:
    > text: Remove
    - click:
      ! removeValue: tags $tag
`;

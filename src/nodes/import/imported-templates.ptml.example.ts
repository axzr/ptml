const sharedTemplatesPtml = `template: header
> text: Shared header

template: card title
> box:
  > text: $title
  - styles: cardStyle

template: footer
> text: Shared footer
`;

export { sharedTemplatesPtml };

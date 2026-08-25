const whenHoverAndFocus = `define: card
- background-color: #ffffff
- border: 1px solid #d4d4d8
- transition: background-color 0.15s ease

> when: hover
  - background-color: #f4f4f5
> when: focus
  - outline: 2px solid #2563eb
  - outline-offset: 2px

ptml:
> button:
  - styles: card
  > text: Open
`;

const whenEveryState = `define: field
> when: hover
  - border-color: #71717a
> when: focus
  - border-color: #2563eb
> when: active
  - border-color: #1d4ed8
> when: disabled
  - opacity: 0.5
> when: placeholder
  - color: #a1a1aa

ptml:
> input:
  - id: email
  - type: email
  - placeholder: you@example.com
  - styles: field
`;

const whenValueFromState = `state:
- accent: #e11d48

define: link-style
> when: hover
  - color: $accent

ptml:
> link:
  - href: /about
  - text: About
  - styles: link-style
`;

const whenUnknownState = `define: card
> when: wobble
  - color: red

ptml:
> box:
  - styles: card
  > text: Card
`;

const whenInsideInlineStyles = `ptml:
> box:
  - styles
    - when: hover
      - color: red
  > text: Card
`;

export { whenHoverAndFocus, whenEveryState, whenValueFromState, whenUnknownState, whenInsideInlineStyles };

export const docExample = `
define: card
- background-color: #ffffff
- transition: background-color 0.15s ease

> when: hover
  - background-color: #f4f4f5
> when: focus
  - outline: 2px solid #2563eb
  - outline-offset: 2px

ptml:
> button:
  - styles: card
  > text: Open
`;

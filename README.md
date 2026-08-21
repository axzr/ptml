# ptml

Parse, validate, and render PTML markup to React.

PTML is a declarative markup language for creating web application prototypes. It uses an indented, YAML-like syntax to describe UIs, state, and interactive behaviors. This package compiles PTML strings into React components.

## Philosophy

PTML is inspired by the Pareto principle: it aims to make 80% of building a website easy by making 20% of it impossible. By deliberately constraining what you can express -- no imperative logic, no custom data structures, no low-level performance tuning -- everything you _can_ express stays simple, readable, and fast to build.

## Install

```bash
npm install ptml
```

**Peer dependency:** React 18+.

## Usage

```tsx
import { validate, render, parse, usePtmlRender } from 'ptml';

const ptml = `
state:
- count: 0

ptml:
> box:
  > text: Count is $count
  > button:
    > text: Increment
    - click:
      ! set: $count $count + 1
`;

const isValid = validate(ptml);
if (isValid.isValid) {
  const nodes = parse(ptml);
  const element = render(ptml);
}

function App() {
  const { node, error } = usePtmlRender(ptml);
  if (error) return <pre>{error}</pre>;
  return <>{node}</>;
}
```

### API

- **`validate(ptml: string)`** -- Returns `{ isValid: true }` or `{ isValid: false; errorMessage: string }`. When `isValid` is false, `errorMessage` is always present.
- **`parse(ptml: string)`** -- Returns the AST (array of root nodes).
- **`render(ptml: string)`** -- Returns a React node or `null`.
- **`usePtmlRender(ptml: string)`** -- Hook that returns `{ node, error }` for use in components.

Types **`RenderContext`** and **`NamedStylesMap`** are exported for advanced use (e.g. custom node renderers or tooling).

**Note:** Invalid expressions in a `set` action inside a click handler are skipped and do not surface an error.

## For language models

The documentation website at [ptml.js.org](https://ptml.js.org) is itself written in PTML and rendered in the browser, so fetching its HTML returns an empty page. The documentation is also published as plain text, generated from the same schema definitions the language is built from:

- [ptml.js.org/llms.txt](https://ptml.js.org/llms.txt) -- overview and index, following the [llms.txt](https://llmstxt.org) convention.
- [ptml.js.org/llms-full.txt](https://ptml.js.org/llms-full.txt) -- the complete language reference: every node, its prefix, data format, allowed children and a worked example.

Both files ship inside the npm package too, so an agent working in a project that depends on `ptml` can read `node_modules/ptml/llms-full.txt` without network access.

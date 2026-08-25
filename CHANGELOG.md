# Changelog

## 3.0.0

Imports become transitive, which is what makes it practical to split a prototype across
more than two files. The change is breaking in two ways, both to do with what happens when
files disagree or an import cannot be resolved.

### Breaking changes

**Imports are transitive.** An imported file may now import others, and everything
reachable that way becomes available: templates, named styles, functions, state, lists and
breakpoints alike. Previously only the files a document imported directly were read, so a
definition two files away simply did not exist.

**The nearer definition now wins.** Where the same name is declared more than once, the
document doing the importing beats what it imports, and a nearer import beats a deeper one.
Between two imports in the same file the later one still wins. Under 2.0.0 an import
overrode the file that imported it, so a definition in another file could silently capture
a name declared locally. If you were relying on that -- a shared file deliberately
overriding a local template -- the fix is to remove the local declaration.

**An import that cannot be resolved is an error.** An import naming a file that was not
supplied, or a file that is not valid PTML, was skipped in silence: the only symptom was
that whatever it declared appeared not to exist, reported against the line that used it
rather than the line that failed to import it. Both are now reported against the import,
naming the file it appears in and listing the files that were supplied. Validating a
document with no files map at all still says nothing about imports, since a caller
validating a document on its own is not claiming what exists.

Circular imports resolve rather than recursing, and a file imported down several paths is
read once.

### Fixed

- **Calling a function from an imported file was rejected by validation.** The renderer
  merged functions from imported files, but validation built its function map from the
  local document alone, so `! call:` on an imported function worked at render time and
  failed to validate. It had never worked, at any import depth.
- **Imported files were parsed without being syntax-checked.** Indentation and root-node
  rules are checked by the validator rather than the parser, so an imported file with bad
  indentation parsed into the wrong shape and was merged in silently. Imported files are
  now held to the same file-level syntax rules as the document importing them.

## 2.0.0

A major release. Most of it is new capability, but validation has been tightened in
eight places where PTML previously accepted a document and then quietly did the wrong
thing. Those are breaking: documents that validated under 1.1.0 may now be rejected.
In every case the document was already not doing what it looked like it was doing, and
the error says what to write instead.

### Breaking changes

**Reading a form field now requires `$form.<field>`.**
`! set: $email form.email` assigned the literal text `"form.email"`. The `$form.<field>`
form worked at runtime but was rejected by validation, so there was no way to write it
correctly. Validation now accepts `$form.<field>`, checks the field name against the ids
the document declares, and rejects the bare form with a message naming the fix. For a
radio group the key is the group `name` rather than an id.

**Form fields must have a binding.** An `input`, `textarea`, `select` or `checkbox` needs
either an `id`, which binds it to `form.<id>`, or a `value` bound to a state variable.
With neither it rendered a field that silently refused input. Note the matching
relaxation below: `id` itself is no longer required.

**Field ids must be unique.** Two fields declaring the same id shared one form value and
produced duplicate ids in the page. Fields in different branches of a conditional are
exempt, since they never render together. A fixed id inside an `each` or `range` is also
rejected — use a per-item id such as `- id: $item.key`, which now works.

**`label`'s `- for:` must name a field the document declares.** It previously accepted any
value and linked the label to nothing. Skipped when the document has an `import:`, or when
an id is only known at render time.

**`styles` must use the `-` prefix.** Written as `> styles:` it parsed as a block, which
skipped every check beneath it while the renderer ignored the node entirely, so the styles
never applied.

**Breakpoint labels must be declared.** `> breakpoint: someLabel` validated whatever the
label was and then matched nothing.

**`select` must be able to produce options.** A `select` with no `option`, `each`, `if` or
`show` child renders a dropdown with nothing to choose. A list that is empty at runtime is
still fine.

**`show:` rejects more positional arguments than the template has parameters.** The extras
were silently discarded, which is what a value containing spaces looked like. Pass such a
value as a named argument instead (see below). Passing fewer arguments than parameters is
still allowed, so parameters remain optional.

### Behaviour changes

**`usePtmlRender` measures the browser viewport.** Breakpoints are resolved against
`viewportWidth`, and where a host supplied none, no breakpoint applied at all. The hook now
tracks the live window width and re-resolves on resize. Documents using breakpoints will
start rendering responsively where they previously rendered base styles. Pass an explicit
`viewportWidth` to override, for example in a device-frame preview.

**`id` and `for` resolve `$` references.** `- id: $task.key` produced the literal string
`"$task.key"`. Both now resolve like `src`, `alt` and `placeholder`.

**An absent `id` no longer renders as `id=""`.** Empty ids are invalid HTML and made a
label's `- for:` match nothing.

### Added

- **`svg`**, with `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon` and
  `group`. Renders inline, so `currentColor` and `- styles:` work and icons take their
  colour from context. An optional `- title:` gives an accessible name; without one the
  icon is marked decorative.
- **`fonts`**, loading web fonts from Google Fonts with `font-display: block` so the first
  paint has the right metrics. If a font does not load for any reason — a misspelled
  family, no network, a blocked request — it is reported through `console.warn` and the new
  `onFontsUnavailable` option rather than silently falling back.
- **`- placeholder:`** on `input` and `textarea`.
- **`- sort:`** on `each`, ordering items at render time without changing the list.
  Numbers compare as numbers, text compares naturally, and sorting by a property no record
  carries is an error rather than a silent no-op.
- **Inline text runs** — a `text` node may contain further `text` nodes, which render as
  inline runs of one paragraph. This is how to style part of a sentence.
- **Named template arguments** — `> show:` accepts one property child per parameter, which
  is the only way to pass a value containing spaces, and can be given in any order.
- **`breakpoint: <label> or more` / `or less`**, which were documented but not implemented.
- **`externalState`** on `render` and `usePtmlRender`, for state only the host knows,
  merged over what the document declares. Mirrors the existing `externalLists`.
- **`llms.txt` and `llms-full.txt`** ship inside the package, so an agent working in a
  project that depends on `ptml` can read the language reference without network access.

### Fixed

- **`select` and `option` rendered nothing at all.** Both were marked renderable but had no
  renderer, so a valid dropdown silently vanished. They now render, and `each`, `if`/`else`
  and `show` are allowed inside a `select` so options can come from a list.
- **`link` ignored breakpoints.** It was the only renderable node that dropped
  `viewportWidth` and `breakpoints`, so responsive styles on a link did nothing.
- **`each` accepted only eight node types.** `image`, `table`, `input`, `svg`, `list`,
  `header`, `form` and `breakpoint` were rejected as direct children despite working one
  level down inside a `box`. It now accepts whatever a `box` accepts.
- **`id` and `type` are no longer required** on form fields. `type` defaults to `text`, and
  `id` is one of two ways to bind a field rather than the only one.
- Whitespace handling in `text` is now documented rather than folklore: exactly one space
  after the colon separates a node from its text, further leading spaces are content, and
  trailing spaces are always stripped.

## 1.1.0

Earlier releases are not covered by this changelog.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { allSchemas, getBlocksList } from '../../src/schemaRegistry/schemaMap';
import type { NodeSchema } from '../../src/schemas/types';
import { CATEGORY_ORDER, CATEGORY_LABELS, PREFIX_MAP, loadDocExamples } from './schemaDocs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const SITE_URL = 'https://ptml.js.org';
const REPO_URL = 'https://github.com/axzr/ptml';

const groupByCategory = (schemas: NodeSchema[]): Map<string, NodeSchema[]> => {
  const grouped = new Map<string, NodeSchema[]>();
  for (const category of CATEGORY_ORDER) {
    grouped.set(category, []);
  }
  for (const schema of schemas) {
    grouped.get(schema.category)?.push(schema);
  }
  for (const [, list] of grouped) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return grouped;
};

const GENERATED_NOTICE =
  'This file is generated from the PTML source schema definitions. It is the authoritative\n' +
  'reference for the language: if it disagrees with anything else, believe this file.';

const SYNTAX_PRIMER = `## How PTML is written

A PTML document is a plain text file. Every line is one node, and a prefix says what
kind of node it is:

| Prefix | Category | Meaning |
| --- | --- | --- |
| \`>\` | block | a renderable element, such as a box or some text |
| \`-\` | property | configures the node it sits under |
| \`?\` | conditional | renders its children only when a condition holds |
| \`!\` | action | changes state; only valid inside a click handler, init block or function |
| none | declaration | a top-level section such as \`state:\`, \`ptml:\` or \`template:\` |

Nesting is by indentation, two spaces per level. Odd indentation is an error. Declarations
start at column zero and take no prefix. Data follows the node name and a colon:
\`> text: Hello\`. Exactly one space after the colon separates the node from its data, so
any further leading spaces are part of the value; trailing spaces are always stripped.

\`$name\` reads a state variable, a loop variable, a function parameter or a template
parameter. \`$form.<field>\` reads what has been typed into a form field, keyed by the
field's id (or, for radios, the group name).

A document renders only what is inside its \`ptml:\` declaration. Everything else --
\`state:\`, \`define:\`, \`template:\`, \`breakpoints:\`, \`fonts:\`, \`valueList:\`,
\`recordList:\`, \`function:\` -- declares things that \`ptml:\` draws on.

## A complete example

\`\`\`ptml
state:
- count: 0

define: panel
- padding: 16px
- border: 1px solid #ccc

ptml:
> box:
  - styles: panel
  > text: Count is $count
  > button:
    > text: Add one
    - click:
      ! set: $count $count + 1
\`\`\`
`;

const describeData = (schema: NodeSchema): string[] => {
  const { data } = schema;
  if (data.allowed === false) {
    return ['**Data:** not accepted.'];
  }
  if (!data.format) {
    return data.required ? ['**Data:** required.'] : [];
  }

  const separator = data.format.separator === 'comma' ? ', comma-separated' : '';
  const lines = [`**Data:** ${data.required ? 'required' : 'optional'}${separator}.`];
  for (const key of ['first', 'second', 'rest'] as const) {
    const item = data.format[key];
    if (item) {
      lines.push(`- \`${item.name}\` (${item.required ? 'required' : 'optional'}) — ${item.description}`);
    }
  }
  for (const part of data.format.parts ?? []) {
    lines.push(`- \`${part.name}\` (${part.required ? 'required' : 'optional'}) — ${part.description}`);
  }
  return lines;
};

const describeChildren = (schema: NodeSchema): string[] => {
  if (schema.blocks?.isContainerParent) {
    return ['**Children:** any block node (container parent).'];
  }
  const blocks = getBlocksList(schema);
  return blocks.length ? [`**Children:** ${blocks.map((b) => `\`${b.name}\``).join(', ')}`] : [];
};

const describeProperties = (schema: NodeSchema): string[] => {
  const properties = schema.properties;
  if (!properties || (!properties.list?.length && !properties.allowAny)) {
    return [];
  }
  const named = (properties.list ?? []).map((p) => `\`${p.name}\`${p.required ? ' (required)' : ''}`);
  if (properties.allowAny) {
    const detail = properties.description ? ` — ${properties.description}` : '';
    return [`**Properties:** any${detail}`, ...(named.length ? [`Also: ${named.join(', ')}`] : [])];
  }
  return [`**Properties:** ${named.join(', ')}`];
};

const describeFlags = (schema: NodeSchema): string[] => {
  const flags: string[] = [];
  if (schema.conditionals?.allowed) flags.push('supports `? if:` and `? else:`');
  if (schema.actions?.allowAny) flags.push('accepts action children');
  if (schema.requiresFunctionalContext) flags.push('must sit inside a click handler, init block or function');
  return flags.length ? [`**Notes:** ${flags.join('; ')}.`] : [];
};

const emitNode = (schema: NodeSchema, docExamples: Map<string, string>): string => {
  const lines = [`### \`${schema.name}\``, '', `${CATEGORY_LABELS[schema.category]} — prefix \`${PREFIX_MAP[schema.category]}\`.`, ''];
  lines.push(schema.description, '');
  for (const section of [describeData(schema), describeChildren(schema), describeProperties(schema), describeFlags(schema)]) {
    if (section.length) {
      lines.push(...section, '');
    }
  }
  const example = docExamples.get(schema.name) ?? schema.example;
  if (example) {
    lines.push('```ptml', example.trim(), '```', '');
  }
  return lines.join('\n');
};

const buildFullReference = (docExamples: Map<string, string>): string => {
  const grouped = groupByCategory([...allSchemas]);
  const out: string[] = [
    '# PTML Language Reference',
    '',
    '> PTML is a declarative, line-based markup language for building web prototypes. It compiles',
    '> to React components and is rendered by the `ptml` npm package.',
    '',
    GENERATED_NOTICE,
    '',
    `Package: \`ptml\` on npm · Repository: ${REPO_URL} · Website: ${SITE_URL}`,
    '',
    SYNTAX_PRIMER,
    '## Every node, by category',
    '',
  ];

  for (const category of CATEGORY_ORDER) {
    const schemas = grouped.get(category);
    if (!schemas?.length) continue;
    out.push(`${CATEGORY_LABELS[category]}: ${schemas.map((s) => `\`${s.name}\``).join(', ')}`, '');
  }

  for (const category of CATEGORY_ORDER) {
    const schemas = grouped.get(category);
    if (!schemas?.length) continue;
    out.push(`## ${CATEGORY_LABELS[category]} nodes`, '');
    for (const schema of schemas) {
      out.push(emitNode(schema, docExamples));
    }
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
};

// The llms.txt convention: an H1, a blockquote summary, then link lists.
const buildIndex = (): string =>
  [
    '# PTML',
    '',
    '> A declarative, line-based markup language for building web prototypes. PTML compiles to',
    '> React components, so a prototype is a text file rather than a codebase. Install with',
    '> `npm install ptml` and render with the `usePtmlRender` hook.',
    '',
    'PTML documents are made of nodes, one per line, where a prefix gives the node its kind:',
    '`>` for renderable blocks, `-` for properties, `?` for conditionals, `!` for state actions,',
    'and no prefix for top-level declarations such as `state:` and `ptml:`. Nesting is by two-space',
    'indentation.',
    '',
    'The website at ' + SITE_URL + ' is itself written in PTML and rendered in the browser, so',
    'fetching its HTML returns an empty page. Read the files below instead.',
    '',
    '## Docs',
    '',
    `- [Full language reference](${SITE_URL}/llms-full.txt): every node, generated from the source`,
    '  schema definitions — categories, prefixes, data formats, allowed children and a worked',
    '  example for each.',
    `- [README](${REPO_URL}#readme): installation and a short introduction.`,
    '',
    '## Optional',
    '',
    `- [Repository](${REPO_URL}): source, issue tracker and the schema definitions these docs`,
    '  are generated from.',
    '',
  ].join('\n');

const docExamples = await loadDocExamples();
const full = buildFullReference(docExamples);
const index = buildIndex();

const targets = [
  join(REPO_ROOT, 'website', 'public'),
  // Also shipped inside the npm package, so an agent working in a project that
  // depends on ptml can read node_modules/ptml/llms.txt with no network.
  REPO_ROOT,
];

for (const dir of targets) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'llms.txt'), index);
  writeFileSync(join(dir, 'llms-full.txt'), full);
}

console.log(`Generated llms.txt and llms-full.txt (${allSchemas.length} schemas, ${full.length} bytes)`);

import { allSchemas, getBlocksList } from '../../src/schemaRegistry/schemaMap';
import type { NodeSchema } from '../../src/schemas/types';
import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CATEGORY_ORDER = ['declaration', 'block', 'property', 'conditional', 'action'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  declaration: 'Declaration',
  block: 'Block',
  property: 'Property',
  conditional: 'Conditional',
  action: 'Action',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  declaration: 'Declaration nodes sit at the top level of a PTML file with no indentation and no prefix.',
  block: 'Block nodes are renderable UI elements. They use the > prefix.',
  property: 'Property nodes configure their parent node. They use the - prefix.',
  conditional: 'Conditional nodes control rendering. They use the ? prefix.',
  action:
    'Action nodes modify state. They use the ! prefix and must appear inside a click handler, init block, or function body.',
};

const PREFIX_MAP: Record<string, string> = {
  block: '> (angle bracket)',
  property: '- (dash)',
  conditional: '? (question mark)',
  action: '! (exclamation)',
  declaration: 'none (top-level)',
};

function ind(level: number): string {
  return '  '.repeat(level);
}

function groupByCategory(schemas: NodeSchema[]): Map<string, NodeSchema[]> {
  const grouped = new Map<string, NodeSchema[]>();
  for (const cat of CATEGORY_ORDER) {
    grouped.set(cat, []);
  }
  for (const schema of schemas) {
    grouped.get(schema.category)?.push(schema);
  }
  for (const [, list] of grouped) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return grouped;
}

function emitTOC(lines: string[], grouped: Map<string, NodeSchema[]>, b: number): void {
  lines.push(`${ind(b)}> box:`, `${ind(b + 1)}- styles: toc-section`);

  for (const cat of CATEGORY_ORDER) {
    const schemas = grouped.get(cat);
    if (!schemas?.length) continue;
    lines.push(
      `${ind(b + 1)}> text: ${CATEGORY_LABELS[cat]}`,
      `${ind(b + 2)}- styles: toc-category-title`,
      `${ind(b + 1)}> box:`,
      `${ind(b + 2)}- styles: toc-list`,
    );
    for (const schema of schemas) {
      lines.push(`${ind(b + 2)}> text: ${schema.name}`, `${ind(b + 3)}- styles: node-doc-tag`);
    }
  }
}

function emitNodeHeader(lines: string[], schema: NodeSchema, b: number): void {
  lines.push(
    `${ind(b)}> box:`,
    `${ind(b + 1)}- styles: node-doc-header`,
    `${ind(b + 1)}> text: ${schema.name}`,
    `${ind(b + 2)}- styles: node-doc-name`,
    `${ind(b + 1)}> text: ${CATEGORY_LABELS[schema.category]}`,
    `${ind(b + 2)}- styles: category-badge-${schema.category}`,
  );
}

function emitDataNotAccepted(lines: string[], b: number): void {
  lines.push(
    `${ind(b)}> text: DATA`,
    `${ind(b + 1)}- styles: node-doc-detail-label`,
    `${ind(b)}> text: Not accepted -- this node takes no inline data.`,
    `${ind(b + 1)}- styles: node-doc-detail-value`,
  );
}

function emitDataFormatParts(lines: string[], schema: NodeSchema, b: number): void {
  const { data } = schema;
  const fmt = data.format!;
  const parts: string[] = [];

  for (const key of ['first', 'second', 'rest'] as const) {
    const item = fmt[key];
    if (!item) continue;
    const req = item.required ? 'required' : 'optional';
    parts.push(`${item.name} (${req}) -- ${item.description}`);
  }
  if (fmt.parts) {
    for (const p of fmt.parts) {
      const req = p.required ? 'required' : 'optional';
      parts.push(`${p.name} (${req}) -- ${p.description}`);
    }
  }

  const separator = fmt.separator === 'comma' ? ' (comma-separated)' : '';
  const reqLabel = data.required ? 'Required' : 'Optional';
  lines.push(
    `${ind(b)}> text: DATA`,
    `${ind(b + 1)}- styles: node-doc-detail-label`,
    `${ind(b)}> text: ${reqLabel}${separator}`,
    `${ind(b + 1)}- styles: node-doc-detail-value`,
  );

  for (const part of parts) {
    lines.push(`${ind(b)}> text: ${part}`, `${ind(b + 1)}- styles: node-doc-detail-value`);
  }
}

function emitDataFormat(lines: string[], schema: NodeSchema, b: number): void {
  const { data } = schema;

  if (data.allowed === false) {
    emitDataNotAccepted(lines, b);
    return;
  }

  if (!data.format) {
    if (data.required) {
      lines.push(
        `${ind(b)}> text: DATA`,
        `${ind(b + 1)}- styles: node-doc-detail-label`,
        `${ind(b)}> text: Required.`,
        `${ind(b + 1)}- styles: node-doc-detail-value`,
      );
    }
    return;
  }

  emitDataFormatParts(lines, schema, b);
}

function emitChildren(lines: string[], schema: NodeSchema, b: number): void {
  if (schema.blocks?.isContainerParent) {
    lines.push(
      `${ind(b)}> text: CHILDREN`,
      `${ind(b + 1)}- styles: node-doc-detail-label`,
      `${ind(b)}> text: Any block node (container parent).`,
      `${ind(b + 1)}- styles: node-doc-detail-value`,
    );
    return;
  }

  const blocksList = getBlocksList(schema);
  if (!blocksList.length) return;

  lines.push(
    `${ind(b)}> text: CHILDREN`,
    `${ind(b + 1)}- styles: node-doc-detail-label`,
    `${ind(b)}> box:`,
    `${ind(b + 1)}- styles: toc-list`,
  );
  for (const block of blocksList) {
    lines.push(`${ind(b + 1)}> text: ${block.name}`, `${ind(b + 2)}- styles: node-doc-tag`);
  }
}

function emitProperties(lines: string[], schema: NodeSchema, b: number): void {
  const props = schema.properties;
  if (!props || (!props.list?.length && !props.allowAny)) return;

  lines.push(`${ind(b)}> text: PROPERTIES`, `${ind(b + 1)}- styles: node-doc-detail-label`);

  if (props.allowAny) {
    const desc = props.description ? ` (${props.description})` : '';
    lines.push(`${ind(b)}> text: Any property${desc}`, `${ind(b + 1)}- styles: node-doc-detail-value`);
  }

  if (props.list?.length) {
    lines.push(`${ind(b)}> box:`, `${ind(b + 1)}- styles: toc-list`);
    for (const prop of props.list) {
      const suffix = prop.required ? ' (required)' : '';
      lines.push(`${ind(b + 1)}> text: ${prop.name}${suffix}`, `${ind(b + 2)}- styles: node-doc-tag`);
    }
  }
}

function emitFlags(lines: string[], schema: NodeSchema, b: number): void {
  if (schema.conditionals?.allowed) {
    lines.push(
      `${ind(b)}> text: Supports ? if: and ? else: conditionals.`,
      `${ind(b + 1)}- styles: node-doc-detail-value`,
    );
  }
  if (schema.actions?.allowAny) {
    lines.push(
      `${ind(b)}> text: Supports action children (! set, ! call, etc).`,
      `${ind(b + 1)}- styles: node-doc-detail-value`,
    );
  }
}

function emitExample(lines: string[], schema: NodeSchema, docExamples: Map<string, string>, b: number): void {
  const docEx = docExamples.get(schema.name);
  const exampleText = docEx || schema.example;
  if (!exampleText) return;

  lines.push(
    `${ind(b)}> text: EXAMPLE`,
    `${ind(b + 1)}- styles: node-doc-detail-label`,
    `${ind(b)}> box:`,
    `${ind(b + 1)}- styles: node-doc-code`,
  );

  for (const exLine of exampleText.trim().split('\n')) {
    lines.push(`${ind(b + 1)}> text: ${exLine || ' '}`, `${ind(b + 2)}- newline`);
  }
}

function emitNodeDoc(lines: string[], schema: NodeSchema, docExamples: Map<string, string>, b: number): void {
  lines.push(`${ind(b)}> box:`, `${ind(b + 1)}- styles: node-doc-card`);

  emitNodeHeader(lines, schema, b + 1);

  lines.push(
    `${ind(b + 1)}> text: ${schema.description}`,
    `${ind(b + 2)}- styles: node-doc-desc`,
    `${ind(b + 1)}> text: PREFIX`,
    `${ind(b + 2)}- styles: node-doc-detail-label`,
    `${ind(b + 1)}> text: ${PREFIX_MAP[schema.category] || 'none'}`,
    `${ind(b + 2)}- styles: node-doc-detail-value`,
  );

  emitDataFormat(lines, schema, b + 1);
  emitChildren(lines, schema, b + 1);
  emitProperties(lines, schema, b + 1);
  emitFlags(lines, schema, b + 1);
  emitExample(lines, schema, docExamples, b + 1);
}

function emitCategorySection(
  lines: string[],
  cat: string,
  schemas: NodeSchema[],
  docExamples: Map<string, string>,
  b: number,
): void {
  lines.push(
    `${ind(b)}> box:`,
    `${ind(b + 1)}- styles: section`,
    `${ind(b + 1)}> header: h2`,
    `${ind(b + 2)}> text: ${CATEGORY_LABELS[cat]} Nodes`,
    `${ind(b + 3)}- styles: section-title`,
    `${ind(b + 1)}> text: ${CATEGORY_DESCRIPTIONS[cat]}`,
    `${ind(b + 2)}- styles: body-text`,
  );

  for (const schema of schemas) {
    emitNodeDoc(lines, schema, docExamples, b + 1);
  }
}

async function loadDocExamples(): Promise<Map<string, string>> {
  const examples = new Map<string, string>();
  const nodesDir = join(__dirname, '..', '..', 'src', 'nodes');

  for (const schema of allSchemas) {
    const dirName = schema.name;
    const filePath = join(nodesDir, dirName, `${dirName}.example.ts`);
    if (!existsSync(filePath)) continue;

    try {
      const fileUrl = pathToFileURL(filePath).href;
      const mod = (await import(fileUrl)) as Record<string, unknown>;
      if (typeof mod.docExample === 'string') {
        examples.set(schema.name, mod.docExample);
      }
    } catch {
      // skip if import fails
    }
  }

  return examples;
}

async function generateReference(): Promise<string> {
  const grouped = groupByCategory([...allSchemas]);
  const docExamples = await loadDocExamples();
  const lines: string[] = [];

  lines.push(
    'ptml:',
    '> box:',
    `${ind(1)}> header:`,
    `${ind(2)}> text: Language Reference`,
    `${ind(3)}- styles: section-title`,
    `${ind(1)}> text: Complete reference for every PTML node, generated from the source schema definitions.`,
    `${ind(2)}- styles: body-text`,
  );

  emitTOC(lines, grouped, 1);

  for (const cat of CATEGORY_ORDER) {
    const schemas = grouped.get(cat);
    if (!schemas?.length) continue;
    emitCategorySection(lines, cat, schemas, docExamples, 1);
  }

  return lines.join('\n') + '\n';
}

const output = await generateReference();
const outputPath = join(__dirname, '..', 'src', 'content', 'reference.ptml');
writeFileSync(outputPath, output);
console.log(`Generated reference.ptml (${allSchemas.length} schemas)`);

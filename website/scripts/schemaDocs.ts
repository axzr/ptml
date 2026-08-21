import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { allSchemas } from '../../src/schemaRegistry/schemaMap';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const CATEGORY_ORDER = ['declaration', 'block', 'property', 'conditional', 'action'] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  declaration: 'Declaration',
  block: 'Block',
  property: 'Property',
  conditional: 'Conditional',
  action: 'Action',
};

export const PREFIX_MAP: Record<string, string> = {
  block: '> (angle bracket)',
  property: '- (dash)',
  conditional: '? (question mark)',
  action: '! (exclamation)',
  declaration: 'none (top-level)',
};

// docExample is the worked example shown for a node in both the website
// reference and the generated LLM docs, and is validated by docExamples.spec.
export async function loadDocExamples(): Promise<Map<string, string>> {
  const examples = new Map<string, string>();
  const nodesDir = join(__dirname, '..', '..', 'src', 'nodes');

  for (const schema of allSchemas) {
    const filePath = join(nodesDir, schema.name, `${schema.name}.example.ts`);
    if (!existsSync(filePath)) continue;

    try {
      const mod = (await import(pathToFileURL(filePath).href)) as Record<string, unknown>;
      if (typeof mod.docExample === 'string') {
        examples.set(schema.name, mod.docExample);
      }
    } catch {
      // skip if import fails
    }
  }

  return examples;
}

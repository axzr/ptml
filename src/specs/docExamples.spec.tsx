import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validate } from '../index';

// docExample is what website/scripts/generate-reference.ts pulls into the
// public language reference (and, indirectly, what Appicent's MCP syntax
// resource is sourced from) -- an invalid one ships a broken example to
// both, and nobody notices until someone tries to actually use it. Found
// 16 real ones this way (getRecord, getValue, each, range, state-array,
// select/option, checkbox, radio, row/table, init, call/function, import,
// where) that had sat broken in the published reference; this test exists
// so that class of bug can't silently return. Scans every nodes/*/*.example.ts
// on disk (not just schema-registered names, which is how state-array's
// broken example slipped past an earlier, schema-driven version of this
// check) the same way generate-reference.ts's own loadDocExamples() does,
// rather than using import.meta.glob, which plain `tsc` (this package's
// typecheck) doesn't know about without pulling in vite/client globals
// repo-wide.
const nodesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'nodes');

const exampleFiles = readdirSync(nodesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({
    name: entry.name,
    filePath: join(nodesDir, entry.name, `${entry.name}.example.ts`),
  }))
  .filter(({ filePath }) => existsSync(filePath));

describe('docExample validity', () => {
  it('found *.example.ts files to check (something is very wrong otherwise)', () => {
    expect(exampleFiles.length).toBeGreaterThan(0);
  });

  for (const { name, filePath } of exampleFiles) {
    it(`${name}'s docExample is valid PTML`, async () => {
      const mod = (await import(pathToFileURL(filePath).href)) as Record<string, unknown>;

      // This node's example file doesn't export a docExample -- nothing to check.
      if (typeof mod.docExample !== 'string') {
        return;
      }

      const result = validate(mod.docExample);
      expect(result.isValid ? true : result.errorMessage).toBe(true);
    });
  }
});

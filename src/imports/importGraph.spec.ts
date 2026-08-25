import { describe, it, expect } from 'vitest';
import { parse } from '../parsers/parser';
import { forEachImportedDocument } from './importGraph';
import type { PtmlFilesMap } from '../types';

const A = 'a.ptml';
const B = 'b.ptml';
const IMPORT_B = `import: ${B}\n`;
const LEAF = 'ptml:\n> text: x\n';

const visitOrder = (main: string, files: PtmlFilesMap): string[] => {
  const order: string[] = [];
  forEachImportedDocument(parse(main), files, ({ filename }) => order.push(filename));
  return order;
};

describe('forEachImportedDocument', () => {
  it('reaches a file imported by a file that was itself imported', () => {
    expect(visitOrder('import: a.ptml\n', { 'a.ptml': 'import: b.ptml\n', 'b.ptml': 'ptml:\n> text: x\n' })).toEqual([
      'b.ptml',
      'a.ptml',
    ]);
  });

  it('visits deepest first, so a nearer document can overwrite what it imports', () => {
    expect(visitOrder(`import: ${A}\n`, { [A]: IMPORT_B, [B]: 'import: c.ptml\n', 'c.ptml': LEAF })).toEqual([
      'c.ptml',
      B,
      A,
    ]);
  });

  it('keeps sibling imports in document order, so the later one wins', () => {
    expect(visitOrder(`import: ${A}\nimport: ${B}\n`, { [A]: LEAF, [B]: LEAF })).toEqual([A, B]);
  });

  it('visits a file shared by two branches only once', () => {
    expect(
      visitOrder(`import: ${A}\nimport: ${B}\n`, {
        [A]: 'import: shared.ptml\n',
        [B]: 'import: shared.ptml\n',
        'shared.ptml': LEAF,
      }),
    ).toEqual(['shared.ptml', A, B]);
  });

  it('terminates on a cycle rather than recursing forever', () => {
    expect(visitOrder('import: a.ptml\n', { 'a.ptml': 'import: b.ptml\n', 'b.ptml': 'import: a.ptml\n' })).toEqual([
      'b.ptml',
      'a.ptml',
    ]);
  });

  it('skips a file that was not supplied, leaving the rest of the graph intact', () => {
    expect(visitOrder('import: gone.ptml\nimport: a.ptml\n', { 'a.ptml': 'ptml:\n> text: x\n' })).toEqual(['a.ptml']);
  });

  it('skips a file that cannot be parsed, leaving the rest of the graph intact', () => {
    expect(
      visitOrder(`import: bad.ptml\nimport: ${A}\n`, {
        'bad.ptml': 'not: a *valid* ptml file at all',
        [A]: LEAF,
      }),
    ).toContain(A);
  });
});

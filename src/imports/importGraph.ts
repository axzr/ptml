import { parse } from '../parsers/parser';
import type { Node, PtmlFilesMap } from '../types';

export type ImportedDocument = { filename: string; nodes: Node[] };

const importedFilenames = (nodes: Node[]): string[] =>
  nodes.filter((node) => node.type === 'import' && node.data).map((node) => node.data.trim());

/**
 * Visits every document reachable through import declarations, depth first,
 * each file at most once however many times it is imported.
 *
 * Imports are transitive: a file may import a file that imports another, so the
 * things assembled across files -- templates, named styles, functions, state and
 * lists, breakpoints -- all walk the same graph. Keeping that walk in one place
 * is what stops them disagreeing about which files a document can see.
 *
 * Visiting deepest first means a nearer document's definitions are applied
 * after, and so win over, the ones it imports -- the order callers that merge by
 * assignment rely on. Files that cannot be read or parsed are skipped here;
 * validateSemantics reports them, and rendering carries on with what it has.
 */
export const forEachImportedDocument = (
  nodes: Node[],
  files: PtmlFilesMap,
  visit: (document: ImportedDocument) => void,
  visited: Set<string> = new Set(),
): void => {
  for (const filename of importedFilenames(nodes)) {
    if (visited.has(filename)) {
      continue;
    }
    visited.add(filename);

    const content = files[filename];
    if (typeof content !== 'string') {
      continue;
    }

    let importedNodes: Node[];
    try {
      importedNodes = parse(content);
    } catch {
      continue;
    }

    // Depth first: whatever this file imports is visited before the file itself.
    forEachImportedDocument(importedNodes, files, visit, visited);
    visit({ filename, nodes: importedNodes });
  }
};

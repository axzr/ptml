import type { FunctionMap, Node, PtmlFilesMap } from '../../types';
import type { SemanticStackEntry, ValidationContext } from '../types';
import { parse } from '../../parsers/parser';
import { buildStateAndLists, type StateMap, type ListMap } from '../../state/state';
import { buildFunctionMap } from '../../evaluation/functionOperations';
import { validateRootNodes } from './validateRootNodes';
import { collectFieldIds, validateIds } from './validateIds';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { splitOnWhitespace } from '../../utils/regexPatterns';
import { ImportErrors, StateErrors } from '../../errors/messages';
import { validateFileSyntax } from '../validate';
import { forEachImportedDocument } from '../../imports/importGraph';

const addLoopVariablesFromNode = (node: Node, loopVars: Set<string>): void => {
  if (!node.data) {
    return;
  }

  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(node.type);
  if (!schema?.functions?.loopVariableExtractor) {
    return;
  }

  const vars = schema.functions.loopVariableExtractor(node.data);
  vars.forEach((v) => loopVars.add(v));
};

const extractFromChildren = (children: Node[], loopVars: Set<string>): void => {
  children.forEach((child) => {
    addLoopVariablesFromNode(child, loopVars);
    if (child.children) {
      extractFromChildren(child.children, loopVars);
    }
  });
};

const buildLoopVariablesMap = (ptml: string): Set<string> => {
  const loopVars = new Set<string>();
  try {
    const nodes = parse(ptml);
    nodes.forEach((node) => {
      addLoopVariablesFromNode(node, loopVars);
      if (node.children) {
        extractFromChildren(node.children, loopVars);
      }
    });
  } catch {
    return loopVars;
  }
  return loopVars;
};

const buildStateAndListsForValidation = (ptml: string): { state: StateMap; lists: ListMap } | undefined => {
  try {
    const nodes = parse(ptml);
    return buildStateAndLists(nodes);
  } catch {
    return undefined;
  }
};

// The renderer merges functions from imported files, but validation used to
// build this map from the local document alone, so calling an imported function
// worked at render time and was rejected by validation.
const buildFunctionMapForValidation = (ptml: string, files?: PtmlFilesMap): FunctionMap | undefined => {
  try {
    const nodes = parse(ptml);
    const functionMap: FunctionMap = {};
    if (files) {
      forEachImportedDocument(nodes, files, ({ nodes: importedNodes }) => {
        Object.assign(functionMap, buildFunctionMap(importedNodes));
      });
    }
    Object.assign(functionMap, buildFunctionMap(nodes));
    return functionMap;
  } catch {
    return undefined;
  }
};

const collectTemplateNames = (nodes: Node[]): Set<string> => {
  const names = new Set<string>();
  nodes.forEach((n) => {
    if (n.type === 'template' && n.data) {
      const parts = splitOnWhitespace(n.data.trim());
      if (parts.length > 0) names.add(parts[0]);
    }
  });
  return names;
};

const collectTemplateParameters = (nodes: Node[]): Record<string, string[]> => {
  const parameters: Record<string, string[]> = {};
  nodes.forEach((n) => {
    if (n.type === 'template' && n.data) {
      const parts = splitOnWhitespace(n.data.trim());
      if (parts.length > 0) {
        parameters[parts[0]] = parts.slice(1);
      }
    }
  });
  return parameters;
};

const collectDefineNames = (nodes: Node[]): Set<string> => {
  const names = new Set<string>();
  nodes.forEach((n) => {
    if (n.type === 'define' && n.data) {
      const trimmed = n.data.trim();
      if (trimmed) names.add(trimmed);
    }
  });
  return names;
};

const collectBreakpointLabels = (nodes: Node[]): Set<string> => {
  const labels = new Set<string>();
  const breakpointsNode = nodes.find((n) => n.type === 'breakpoints');
  if (!breakpointsNode) return labels;
  breakpointsNode.children.forEach((child) => {
    const label = (child.type ?? '').trim();
    if (label) labels.add(label);
  });
  return labels;
};

// A breakpoints declaration is a single ordered ladder, so it can't be merged
// across files the way templates and defines can. The local declaration wins;
// only when a file declares none does it inherit one wholesale from the first
// import that has one. buildImportedBreakpoints in renderers/render.tsx applies
// the same rule, so what validates is what renders.
const collectImportedBreakpointLabels = (rootNodes: Node[], files: PtmlFilesMap): Set<string> => {
  let labels = new Set<string>();
  forEachImportedDocument(rootNodes, files, ({ nodes }) => {
    const imported = collectBreakpointLabels(nodes);
    // Visited deepest first, so a nearer import overwrites a deeper one.
    if (imported.size > 0) {
      labels = imported;
    }
  });
  return labels;
};

type ImportedNames = {
  templates: Set<string>;
  defines: Set<string>;
  parameters: Record<string, string[]>;
};

const buildAvailableFromImports = (rootNodes: Node[], files: PtmlFilesMap): ImportedNames => {
  const templates = new Set<string>();
  const defines = new Set<string>();
  const parameters: Record<string, string[]> = {};

  forEachImportedDocument(rootNodes, files, ({ nodes }) => {
    collectTemplateNames(nodes).forEach((name) => templates.add(name));
    collectDefineNames(nodes).forEach((name) => defines.add(name));
    Object.assign(parameters, collectTemplateParameters(nodes));
  });

  return { templates, defines, parameters };
};

type AvailableNames = {
  availableTemplates: Set<string>;
  availableDefines: Set<string>;
  availableBreakpoints: Set<string>;
  availableFieldIds: Set<string>;
  fieldIdsAreKnown: boolean;
  templateParameters: Record<string, string[]>;
};

const hasImports = (nodes: Node[]): boolean => nodes.some((node) => node.type === 'import');

const collectAvailableNames = (nodes: Node[], files?: PtmlFilesMap): AvailableNames => {
  const availableTemplates = collectTemplateNames(nodes);
  const availableDefines = collectDefineNames(nodes);
  let availableBreakpoints = collectBreakpointLabels(nodes);
  const templateParameters: Record<string, string[]> = {};

  if (files && Object.keys(files).length > 0) {
    const fromImports = buildAvailableFromImports(nodes, files);
    fromImports.templates.forEach((t) => availableTemplates.add(t));
    fromImports.defines.forEach((d) => availableDefines.add(d));
    Object.assign(templateParameters, fromImports.parameters);
    if (availableBreakpoints.size === 0) {
      availableBreakpoints = collectImportedBreakpointLabels(nodes, files);
    }
  }
  // Applied last so a template declared here wins over an imported one of the
  // same name, matching how the renderer merges them.
  Object.assign(templateParameters, collectTemplateParameters(nodes));

  const fieldIds = collectFieldIds(nodes, hasImports(nodes));
  return {
    availableTemplates,
    availableDefines,
    availableBreakpoints,
    availableFieldIds: fieldIds.ids,
    fieldIdsAreKnown: fieldIds.allKnown,
    templateParameters,
  };
};

const buildValidationContext = (ptml: string, files?: PtmlFilesMap): ValidationContext => {
  const stateAndLists = buildStateAndListsForValidation(ptml);
  const stateMap = stateAndLists?.state;
  const listMap = stateAndLists?.lists;
  const functionMap = buildFunctionMapForValidation(ptml, files);
  const loopVariables = buildLoopVariablesMap(ptml);
  const lines = ptml.trim().split('\n');
  const stack: SemanticStackEntry[] = [];

  return {
    stateMap,
    listMap,
    functionMap,
    loopVariables,
    lines,
    stack,
    ...collectAvailableNames(parse(ptml), files),
  };
};

const describeSuppliedFiles = (files: PtmlFilesMap): string => {
  const names = Object.keys(files).sort();
  return names.length === 0 ? 'No files were supplied alongside this document.' : `Files supplied: ${names.join(', ')}`;
};

// An import that resolves to nothing used to be skipped in silence, so the only
// symptom was whatever it declared appearing not to exist -- reported against
// the line that used it rather than the line that failed to import it. Walked
// transitively, because a broken import three files down drops that whole
// subtree just as quietly.
const readImportedFile = (node: Node, filename: string, files: PtmlFilesMap, importedBy: string): Node[] => {
  const content = files[filename];
  if (typeof content !== 'string') {
    throw new Error(ImportErrors.fileNotFound(node.lineNumber, filename, importedBy, describeSuppliedFiles(files)));
  }
  try {
    validateFileSyntax(content);
    return parse(content);
  } catch (error) {
    throw new Error(
      ImportErrors.fileNotParseable(
        node.lineNumber,
        filename,
        importedBy,
        error instanceof Error ? error.message : String(error),
      ),
    );
  }
};

const validateImports = (
  nodes: Node[],
  files: PtmlFilesMap,
  visited: Set<string> = new Set(),
  containingFile?: string,
): void => {
  const importedBy = containingFile ? ` of "${containingFile}"` : '';

  nodes.forEach((node) => {
    if (node.type !== 'import' || !node.data) {
      return;
    }
    const filename = node.data.trim();
    if (visited.has(filename)) {
      return;
    }
    visited.add(filename);
    validateImports(readImportedFile(node, filename, files, importedBy), files, visited, filename);
  });
};

const FILE_REFERENCE_PATTERN = /^file\((.+)\)$/;

const validateFileReferences = (nodes: Node[], files: PtmlFilesMap): void => {
  nodes.forEach((node) => {
    if (node.type !== 'state') return;
    node.children.forEach((child) => {
      if (!child.data) return;
      const match = child.data.match(FILE_REFERENCE_PATTERN);
      if (match) {
        const filename = match[1].trim();
        if (!(filename in files)) {
          throw new Error(StateErrors.fileReferenceNotFound(child.type, filename, child.lineNumber));
        }
      }
    });
  });
};

export const validateSemantics = (ptml: string, files?: PtmlFilesMap): void => {
  const nodes = parse(ptml);
  const context = buildValidationContext(ptml, files);

  // Only when a files map was supplied at all: a caller validating a document
  // on its own is not claiming anything about what files exist.
  if (files) {
    validateImports(nodes, files);
  }

  if (files && Object.keys(files).length > 0) {
    validateFileReferences(nodes, files);
  }

  validateRootNodes(nodes, context);
  validateIds(nodes, hasImports(nodes));
};

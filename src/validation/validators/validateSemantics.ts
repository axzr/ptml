import type { FunctionMap, Node, PtmlFilesMap } from '../../types';
import type { SemanticStackEntry, ValidationContext } from '../types';
import { parse } from '../../parsers/parser';
import { buildStateAndLists, type StateMap, type ListMap } from '../../state/state';
import { buildFunctionMap } from '../../evaluation/functionOperations';
import { validateRootNodes } from './validateRootNodes';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { splitOnWhitespace } from '../../utils/regexPatterns';
import { StateErrors } from '../../errors/messages';

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

const buildFunctionMapForValidation = (ptml: string): FunctionMap | undefined => {
  try {
    const nodes = parse(ptml);
    return buildFunctionMap(nodes);
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

const buildAvailableFromImports = (
  rootNodes: Node[],
  files: PtmlFilesMap,
  visited: Set<string>,
): { templates: Set<string>; defines: Set<string> } => {
  const templates = new Set<string>();
  const defines = new Set<string>();
  rootNodes.forEach((node) => {
    if (node.type !== 'import' || !node.data) return;
    const filename = node.data.trim();
    if (visited.has(filename)) return;
    visited.add(filename);
    const content = files[filename];
    if (!content || typeof content !== 'string') return;
    try {
      const importedNodes = parse(content);
      collectTemplateNames(importedNodes).forEach((t) => templates.add(t));
      collectDefineNames(importedNodes).forEach((d) => defines.add(d));
    } catch {
      // ignore parse errors in imported file
    }
  });
  return { templates, defines };
};

const buildValidationContext = (ptml: string, files?: PtmlFilesMap): ValidationContext => {
  const stateAndLists = buildStateAndListsForValidation(ptml);
  const stateMap = stateAndLists?.state;
  const listMap = stateAndLists?.lists;
  const functionMap = buildFunctionMapForValidation(ptml);
  const loopVariables = buildLoopVariablesMap(ptml);
  const lines = ptml.trim().split('\n');
  const stack: SemanticStackEntry[] = [];

  const nodes = parse(ptml);
  const availableTemplates = collectTemplateNames(nodes);
  const availableDefines = collectDefineNames(nodes);

  if (files && Object.keys(files).length > 0) {
    const visited = new Set<string>();
    const fromImports = buildAvailableFromImports(nodes, files, visited);
    fromImports.templates.forEach((t) => availableTemplates.add(t));
    fromImports.defines.forEach((d) => availableDefines.add(d));
  }

  return {
    stateMap,
    listMap,
    functionMap,
    loopVariables,
    lines,
    stack,
    availableTemplates,
    availableDefines,
  };
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

  if (files && Object.keys(files).length > 0) {
    validateFileReferences(nodes, files);
  }

  validateRootNodes(nodes, context);
};

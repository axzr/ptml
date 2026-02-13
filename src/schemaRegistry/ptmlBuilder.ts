import { getSchemaMap } from './schemaMap';
import { removeAllPrefixes } from '../utils/regexPatterns';
import type { SchemaExampleContext } from './testCaseTypes';

const buildMinimalExampleContext = (nodeType: string): SchemaExampleContext => {
  const schema = getSchemaMap().get(nodeType);
  return schema?.functions?.getContext?.() ?? { parentNode: 'box' };
};

const getPrefixForCategory = (category: string, isRoot: boolean): string => {
  if (isRoot) {
    return '';
  }
  switch (category) {
    case 'block':
      return '> ';
    case 'property':
      return '- ';
    case 'conditional':
      return '? ';
    case 'action':
      return '! ';
    case 'declaration':
      return '';
    default:
      return '- ';
  }
};

const processChildrenForRoot = (children: string[]): string => {
  return children
    .map((child) => {
      const lines = child.split('\n');
      return lines
        .map((line, index) => {
          if (index === 0) {
            return line.trimStart();
          }
          const trimmed = line.trimStart();
          const currentIndent = line.length - trimmed.length;
          const newIndent = Math.max(0, currentIndent);
          return ' '.repeat(newIndent) + trimmed;
        })
        .join('\n');
    })
    .join('\n');
};

const indentChildren = (children: string[]): string => {
  return children
    .map((child) => {
      const lines = child.split('\n');
      return lines
        .map((line) => {
          if (line.trim() === '') return line;
          const trimmed = line.trimStart();
          const existingIndent = line.length - trimmed.length;
          const newIndent = existingIndent + 2;
          return ' '.repeat(newIndent) + trimmed;
        })
        .join('\n');
    })
    .join('\n');
};

const buildNodePTML = (
  nodeType: string,
  data: string,
  children: string[],
  isRoot = false,
  includeColon = true,
): string => {
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(nodeType);
  const category = schema?.category || 'block';
  const prefix = getPrefixForCategory(category, isRoot);
  const dataPart = data ? ` ${data}` : '';
  const colon = includeColon ? ':' : '';
  const nodeLine = `${prefix}${nodeType}${colon}${dataPart}`;

  if (children.length === 0) {
    return nodeLine;
  }

  if (isRoot) {
    const childrenAtRoot = processChildrenForRoot(children);
    return `${nodeLine}\n${childrenAtRoot}`;
  }

  const childrenIndented = indentChildren(children);
  return `${nodeLine}\n${childrenIndented}`;
};

const buildNodePTMLWithSibling = (
  nodeType: string,
  data: string,
  children: string[],
  precedingSibling: string,
): string => {
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(nodeType);
  const category = schema?.category || 'block';
  const prefix = getPrefixForCategory(category, false);
  const dataPart = data ? ` ${data}` : '';
  const nodePTML = `${prefix}${nodeType}:${dataPart}`;
  const childrenIndented = children.length > 0 ? '\n' + children.map((child) => `  ${child}`).join('\n') : '';
  return `${precedingSibling}\n${nodePTML}${childrenIndented}`;
};

const indentChildLines = (nodePTML: string, spaces: number): string => {
  const indent = ' '.repeat(spaces);
  return nodePTML
    .split('\n')
    .map((line) => {
      if (line.trim()) {
        const existingIndent = line.length - line.trimStart().length;
        const content = line.trimStart();
        return `${indent}${' '.repeat(existingIndent)}${content}`;
      }
      return line;
    })
    .join('\n');
};

const wrapNonRootParent = (nodePTML: string, parentNode: string): string[] => {
  const schemaMap = getSchemaMap();
  const parentSchema = schemaMap.get(parentNode);
  const wrapFn = parentSchema?.functions.wrapAsParent;
  if (wrapFn) {
    const result = wrapFn(nodePTML);
    return Array.isArray(result) ? result : result.split('\n');
  }

  const parts: string[] = [];
  if (parentSchema && parentSchema.category === 'block') {
    parts.push('ptml:');
    parts.push(`> ${parentNode}:`);
    parts.push(indentChildLines(nodePTML, 2));
  } else {
    parts.push('ptml:');
    parts.push(indentChildLines(nodePTML, 2));
  }
  return parts;
};

const addStateContext = (parts: string[], state?: Record<string, string>): void => {
  if (!state) {
    return;
  }
  const stateEntries = Object.entries(state);
  if (stateEntries.length > 0) {
    parts.push('state:');
    stateEntries.forEach(([key, value]) => {
      if (value === undefined || value === '') {
        parts.push(`- ${key}:`);
      } else {
        parts.push(`- ${key}: ${value}`);
      }
    });
  }
};

const addListContext = (parts: string[], lists?: string[]): void => {
  if (!lists) {
    return;
  }
  lists.forEach((listName) => {
    parts.push(`valueList: ${listName}`);
    parts.push(`- item 1`);
  });
};

const wrapRootParent = (nodePTML: string, parentNode: string): string[] => {
  const schemaMap = getSchemaMap();
  const parentSchema = schemaMap.get(parentNode);
  const wrapFn = parentSchema?.functions.wrapAsRoot;
  if (wrapFn) {
    return wrapFn(nodePTML);
  }
  return [parentNode, nodePTML];
};

const extractNodeTypeFromLine = (line: string): { prefix: string; nodeType: string } | null => {
  const match = line.match(/^([>?\-!]*\s*)?(\w+)(?::|$|\s)/);
  if (!match) {
    return null;
  }
  return {
    prefix: match[1] || '',
    nodeType: match[2],
  };
};

const wrapRootNodeInPtml = (nodePTML: string): string => {
  const schemaMap = getSchemaMap();
  const firstLine = nodePTML.split('\n')[0];
  const nodeTypeMatch = extractNodeTypeFromLine(firstLine);
  const existingPrefix = nodeTypeMatch ? nodeTypeMatch.prefix : '';
  const nodeType = nodeTypeMatch ? nodeTypeMatch.nodeType : '';
  const nodeSchema = schemaMap.get(nodeType);

  if (nodeSchema && nodeSchema.category !== 'declaration') {
    const prefix = existingPrefix || getPrefixForCategory(nodeSchema.category, false);
    const lines = nodePTML.split('\n');
    const firstLineWithoutPrefix = removeAllPrefixes(lines[0]);
    const firstLineContent = `${prefix}${firstLineWithoutPrefix}`;
    const restLines = lines.slice(1);
    const indentedRest = restLines
      .map((line) => {
        const currentIndent = line.length - line.trimStart().length;
        const newIndent = currentIndent + 2;
        return ' '.repeat(newIndent) + line.trimStart();
      })
      .join('\n');
    return `ptml:\n${firstLineContent}${indentedRest ? '\n' + indentedRest : ''}`;
  }
  return nodePTML;
};

const extractShowTemplateName = (text: string): string | null => {
  const match = text.match(/^(?:[->] )?show:\s*(\S+)/);
  return match ? match[1] : null;
};

const addTemplateForShow = (parts: string[], nodePTML: string): void => {
  const templateName = extractShowTemplateName(nodePTML);
  if (templateName && !templateName.startsWith('$')) {
    parts.unshift(`template: ${templateName}\n- text: Template content`);
  }
};

const handleRootDeclarationNode = (
  nodePTML: string,
  nodeType: string,
  context: SchemaExampleContext,
  parts: string[],
): void => {
  if (context.lists && context.lists.length > 0) {
    addListContext(parts, context.lists);
  }
  if (context.state && Object.keys(context.state).length > 0) {
    addStateContext(parts, context.state);
  }
  addTemplateForShow(parts, nodePTML);
  const nodeLines = nodePTML.split('\n').filter((line) => {
    const trimmed = line.trim();
    return trimmed && (nodeType === 'ptml' || !trimmed.startsWith('ptml:'));
  });
  parts.push(...nodeLines);
};

const handleRootNonDeclarationNode = (nodePTML: string, context: SchemaExampleContext, parts: string[]): void => {
  addListContext(parts, context.lists);
  addStateContext(parts, context.state);
  addTemplateForShow(parts, nodePTML);
  const wrapped = wrapRootNodeInPtml(nodePTML);
  parts.push(...wrapped.split('\n'));
};

const wrapWithParent = (nodePTML: string, context: SchemaExampleContext, parts: string[]): void => {
  const parentNode = context.parentNode!;
  if (
    parentNode !== 'valueList' &&
    parentNode !== 'recordList' &&
    parentNode !== 'function' &&
    parentNode !== 'updateRecord' &&
    parentNode !== 'each'
  ) {
    addListContext(parts, context.lists);
    addStateContext(parts, context.state);
  }

  const schemaMap = getSchemaMap();
  const parentSchema = schemaMap.get(parentNode);

  if (parentSchema && parentSchema.category !== 'declaration') {
    const wrapped = wrapNonRootParent(nodePTML, parentNode);
    const wrappedString = wrapped.join('\n');
    if (wrappedString.startsWith('ptml:') || wrappedString.includes('\nptml:')) {
      parts.push(...wrappedString.split('\n'));
    } else {
      const wrappedInPtml = wrapRootNodeInPtml(wrappedString);
      parts.push(...wrappedInPtml.split('\n'));
    }
  } else {
    parts.push(...wrapRootParent(nodePTML, parentNode));
  }
};

const wrapInContext = (nodeType: string, nodePTML: string, context: SchemaExampleContext): string => {
  const parts: string[] = [];

  if (context.parentNode !== undefined) {
    wrapWithParent(nodePTML, context, parts);
  } else {
    const schemaMap = getSchemaMap();
    const nodeSchema = schemaMap.get(nodeType);

    if (nodeSchema && nodeSchema.category === 'declaration') {
      handleRootDeclarationNode(nodePTML, nodeType, context, parts);
    } else {
      handleRootNonDeclarationNode(nodePTML, context, parts);
    }
  }

  return parts.join('\n');
};

export const buildPTML = (
  nodeType: string,
  data: string,
  children: string[],
  context?: SchemaExampleContext,
): string => {
  const minimalContext = context || buildMinimalExampleContext(nodeType);
  const isRoot = minimalContext.parentNode === undefined;
  const nodePTML = buildNodePTML(nodeType, data, children, isRoot);
  return wrapInContext(nodeType, nodePTML, minimalContext);
};

export {
  buildMinimalExampleContext,
  buildNodePTML,
  wrapInContext,
  buildNodePTMLWithSibling,
  indentChildLines,
  addListContext,
};

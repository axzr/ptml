import React from 'react';

import { renderNode } from '../../renderers/renderNode';
import { getNodeStyles } from '../../renderers/helpers';
import {
  parseTemplateParameters,
  parseTemplateArguments,
  bindTemplateArguments,
} from '../../templates/templateOperations';
import { getVariableValue } from '../../evaluation/conditionals';
import type { Node } from '../../types';
import type { RenderContext } from '../../renderers/types';

const resolveTemplateName = (
  templateNameText: string,
  state: RenderContext['state'],
  loopVariables?: RenderContext['loopVariables'],
): string => {
  if (templateNameText.startsWith('$')) {
    const varName = templateNameText.slice(1);
    const value = getVariableValue(varName, state, loopVariables);
    if (value !== undefined) {
      return String(value);
    }
  }
  return templateNameText;
};

const renderTemplateChildren = (
  templateChildren: RenderContext['node']['children'],
  mergedContext: RenderContext,
  keyPrefix: string,
): React.ReactNode[] => {
  const renderedChildren: React.ReactNode[] = [];

  for (let i = 0; i < templateChildren.length; i++) {
    const child = templateChildren[i];
    const childKey = `${keyPrefix}-template-${i}`;
    const nextSibling = i < templateChildren.length - 1 ? templateChildren[i + 1] : undefined;
    const childContext = { ...mergedContext, node: child, keyPrefix: childKey, nextSibling };

    const rendered = renderNode(childContext);
    if (rendered) {
      renderedChildren.push(React.createElement(React.Fragment, { key: childKey }, rendered));
    }
  }

  return renderedChildren;
};

const resolveTemplateSourceFilename = (templateName: string, context: RenderContext): string | undefined => {
  const importedFilename = context.templateSourceMap?.[templateName];
  return importedFilename ?? context.sourceFilename;
};

const renderTemplateContent = (
  templateNode: RenderContext['node'],
  context: RenderContext,
  boundParams: RenderContext['loopVariables'],
  keyPrefix: string,
  templateName: string,
): React.ReactNode[] => {
  const templateChildren = templateNode.children.filter((child) => child.type !== 'styles');
  const mergedContext: RenderContext = {
    ...context,
    node: { ...templateNode, children: templateChildren } as typeof templateNode,
    loopVariables: { ...context.loopVariables, ...boundParams },
    sourceFilename: resolveTemplateSourceFilename(templateName, context),
  };

  return renderTemplateChildren(templateChildren, mergedContext, keyPrefix);
};

type ResolvedTemplate = {
  templateNode: RenderContext['node'];
  boundParams: RenderContext['loopVariables'];
  templateName: string;
};

const resolveTemplateAndBindParams = (
  node: RenderContext['node'],
  state: RenderContext['state'],
  loopVariables: RenderContext['loopVariables'],
  lists: RenderContext['lists'],
  templateMap: RenderContext['templateMap'],
): ResolvedTemplate | null => {
  if (!node.data || !templateMap) {
    return null;
  }

  const parts = node.data.trim().split(/\s+/);

  const rawTemplateName = parts[0];
  const templateName = resolveTemplateName(rawTemplateName, state, loopVariables);
  const templateNode = templateMap[templateName];

  if (!templateNode) {
    return null;
  }

  const parameters = parseTemplateParameters(templateNode);
  const arguments_ = parseTemplateArguments(node);
  const boundParams = bindTemplateArguments(parameters, arguments_, state, loopVariables, lists);

  return { templateNode, boundParams, templateName };
};

export const showNodeToReact = (context: RenderContext): React.ReactNode | null => {
  const { node, keyPrefix = '', namedStyles, state, lists, loopVariables, templateMap } = context;

  const resolved = resolveTemplateAndBindParams(node, state, loopVariables, lists, templateMap);
  if (!resolved) {
    return null;
  }

  const { templateNode, boundParams, templateName } = resolved;
  const showStyles = node.children.filter((child) => child.type === 'styles');
  const templateContent = renderTemplateContent(templateNode, context, boundParams, keyPrefix, templateName);

  if (showStyles.length > 0) {
    const nodeWithStyles = { ...node, children: showStyles };
    const style = getNodeStyles(
      nodeWithStyles as Node,
      namedStyles,
      state,
      { ...loopVariables, ...boundParams },
      context.viewportWidth,
      context.breakpoints,
    );
    return React.createElement(
      'div',
      { key: keyPrefix, style: style as React.CSSProperties | undefined },
      templateContent,
    );
  }

  if (templateContent.length === 0) {
    return null;
  }

  if (templateContent.length === 1) {
    return templateContent[0];
  }

  return React.createElement(React.Fragment, { key: keyPrefix }, ...templateContent);
};

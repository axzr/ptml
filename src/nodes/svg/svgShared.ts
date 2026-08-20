import React from 'react';

import type { NodeSchema, PropertyDefinition } from '../../schemas/types';
import type { Node } from '../../types';
import type { RenderContext } from '../../renderers/types';
import type { ValidationContext } from '../../validation/types';
import { getNodeStyles, resolveAttributeValue } from '../../renderers/helpers';
import { renderNode } from '../../renderers/renderNode';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { convertKebabToCamel } from '../../utils/regexPatterns';
import { SvgErrors } from '../../errors/messages';

// The shapes an svg (or a group) may contain.
export const SVG_SHAPE_NAMES = ['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon', 'group'];

// Presentation attributes every svg element accepts. Deliberately an explicit
// allow-list rather than allowAny: a mistyped attribute would otherwise pass
// validation and then quietly do nothing, which is the failure mode this
// language keeps running into.
export const SVG_PRESENTATION_PROPERTIES = [
  'fill',
  'fill-opacity',
  'fill-rule',
  'clip-rule',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-opacity',
  'opacity',
  'transform',
] as const;

const asProperties = (names: readonly string[], required = false): PropertyDefinition[] =>
  names.map((name) => (required ? { name, required: true } : { name }));

export const svgPresentationProperties = (): PropertyDefinition[] => asProperties(SVG_PRESENTATION_PROPERTIES);

// Attribute children are passed through to the DOM; styles is handled
// separately via getNodeStyles, and title becomes a <title> element.
const NON_ATTRIBUTE_CHILDREN = new Set(['styles', 'title']);

export const buildSvgAttributes = (context: RenderContext): Record<string, string> => {
  const { node, state, loopVariables } = context;
  const attributes: Record<string, string> = {};
  node.children.forEach((child) => {
    if (child.category !== 'property' || NON_ATTRIBUTE_CHILDREN.has(child.type)) {
      return;
    }
    const value = resolveAttributeValue(child.data, state, loopVariables);
    if (value === '') {
      return;
    }
    // React wants SVG attributes camelCased (strokeWidth, fillRule); viewBox
    // and other already-camel names pass through untouched.
    attributes[convertKebabToCamel(child.type)] = value;
  });
  return attributes;
};

export const renderSvgChildren = (context: RenderContext): React.ReactNode[] => {
  const { node, keyPrefix = '' } = context;
  const rendered: React.ReactNode[] = [];
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.category !== 'block') {
      continue;
    }
    const childKey = `${keyPrefix}-${i}`;
    const childContext = { ...context, node: child, keyPrefix: childKey };
    const element = renderNode(childContext);
    if (element) {
      rendered.push(React.createElement(React.Fragment, { key: childKey }, element));
    }
  }
  return rendered;
};

// Every shape node renders the SVG element of the same name; group is the one
// exception, named for readability the way box is named for div. Kept as one
// named renderer rather than a factory so it reads like every other *NodeToReact.
const SVG_TAG_BY_NODE_TYPE: Record<string, string> = {
  path: 'path',
  circle: 'circle',
  ellipse: 'ellipse',
  rect: 'rect',
  line: 'line',
  polyline: 'polyline',
  polygon: 'polygon',
  group: 'g',
};

export const svgShapeNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);
  const children = renderSvgChildren(context);
  const tag = SVG_TAG_BY_NODE_TYPE[node.type] ?? node.type;

  return React.createElement(
    tag,
    {
      key: keyPrefix,
      ...buildSvgAttributes(context),
      style: style as React.CSSProperties | undefined,
    },
    children.length > 0 ? children : undefined,
  );
};

const childData = (node: Node, type: string): string => {
  const child = node.children.find((c) => c.type === type);
  return (child?.data ?? '').trim();
};

// validateMinimumChildren only fires when a node has no children at all, so a
// shape missing just its geometry attribute would slip through and render
// nothing. These attributes are the ones without which the element is invisible.
export const validateSvgRequiredProperties = (node: Node, schema: NodeSchema): void => {
  const required = (schema.properties?.list ?? []).filter((p) => p.required).map((p) => p.name);
  const missing = required.filter((name) => childData(node, name) === '');
  if (missing.length > 0) {
    throw new Error(SvgErrors.missingGeometry(node.type, node.lineNumber, ...missing));
  }
};

export const createSvgValidator =
  (schema: () => NodeSchema) =>
  (node: Node, context: ValidationContext): void => {
    validateBlockDefault(node, context);
    if (node.category !== 'block') {
      return;
    }
    validateSvgRequiredProperties(node, schema());
  };

export type SvgShapeOptions = {
  name: string;
  description: string;
  geometry: readonly string[];
  requiredGeometry: readonly string[];
  example: string;
  childShapes?: boolean;
};

export const createSvgShapeSchema = (options: SvgShapeOptions): NodeSchema => {
  const { name, description, geometry, requiredGeometry, example, childShapes = false } = options;
  const schema: NodeSchema = {
    name,
    category: 'block',
    isRenderable: true,
    description,
    properties: {
      list: [
        ...geometry.map((g) => (requiredGeometry.includes(g) ? { name: g, required: true } : { name: g })),
        ...svgPresentationProperties(),
        { name: 'styles' },
      ],
    },
    blocks: {
      list: childShapes ? SVG_SHAPE_NAMES.map((shapeName) => ({ name: shapeName })) : [],
    },
    data: {
      allowed: false,
    },
    example,
    functions: {
      validate: createSvgValidator(() => schema),
      getContext: () => ({ parentNode: 'svg' }),
      render: svgShapeNodeToReact,
    },
  };
  return schema;
};

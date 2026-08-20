import type { NodeSchema } from '../../schemas/types';
import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { SvgErrors } from '../../errors/messages';
import { SVG_SHAPE_NAMES, svgPresentationProperties } from './svgShared';
import { svgNodeToReact } from './svg.render';

const validateSvg = (node: Node, context: ValidationContext): void => {
  validateBlockDefault(node, context);
  if (node.category !== 'block') {
    return;
  }
  const viewBox = node.children.find((child) => child.type === 'viewBox');
  if (!(viewBox?.data ?? '').trim()) {
    throw new Error(SvgErrors.missingViewBox(node.lineNumber));
  }
};

export const svgSchema: NodeSchema = {
  name: 'svg',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'An inline SVG, for icons and simple vector graphics. Requires a viewBox and contains shape children (path, circle, ellipse, rect, line, polyline, polygon, group). Because it renders inline rather than as an image, a fill or stroke of currentColor takes the surrounding text colour, and styles applies to it like any other block. An optional title gives it an accessible name; without one it is marked decorative.',
  properties: {
    list: [
      { name: 'viewBox', required: true },
      { name: 'width' },
      { name: 'height' },
      { name: 'title' },
      ...svgPresentationProperties(),
      { name: 'styles' },
    ],
  },
  blocks: {
    list: SVG_SHAPE_NAMES.map((name) => ({ name })),
  },
  data: {
    allowed: false,
  },
  example: '> svg:\n  - viewBox: 0 0 24 24\n  > path:\n    - d: M3 12h18',
  functions: {
    validate: validateSvg,
    getContext: () => ({ parentNode: 'box' }),
    wrapAsParent: (nodePTML: string) =>
      `ptml:\n> svg:\n  - viewBox: 0 0 24 24\n${nodePTML
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n')}`,
    render: svgNodeToReact,
  },
};

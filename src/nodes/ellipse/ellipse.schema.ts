import type { NodeSchema } from '../../schemas/types';
import { createSvgShapeSchema } from '../svg/svgShared';

export const ellipseSchema: NodeSchema = createSvgShapeSchema({
  name: 'ellipse',
  description: 'An ellipse shape inside an svg, positioned by cx and cy with radii rx and ry.',
  geometry: ['cx', 'cy', 'rx', 'ry'],
  requiredGeometry: ['rx', 'ry'],
  example: '> ellipse:\n  - cx: 12\n  - cy: 12\n  - rx: 10\n  - ry: 6',
});

import type { NodeSchema } from '../../schemas/types';
import { createSvgShapeSchema } from '../svg/svgShared';

export const circleSchema: NodeSchema = createSvgShapeSchema({
  name: 'circle',
  description: 'A circle shape inside an svg, positioned by cx and cy with radius r.',
  geometry: ['cx', 'cy', 'r'],
  requiredGeometry: ['r'],
  example: '> circle:\n  - cx: 12\n  - cy: 12\n  - r: 10',
});

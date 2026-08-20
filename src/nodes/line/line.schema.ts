import type { NodeSchema } from '../../schemas/types';
import { createSvgShapeSchema } from '../svg/svgShared';

export const lineSchema: NodeSchema = createSvgShapeSchema({
  name: 'line',
  description:
    'A straight line inside an svg, from (x1, y1) to (x2, y2). A line has no fill, so it needs a stroke to be visible.',
  geometry: ['x1', 'y1', 'x2', 'y2'],
  requiredGeometry: ['x1', 'y1', 'x2', 'y2'],
  example: '> line:\n  - x1: 3\n  - y1: 12\n  - x2: 21\n  - y2: 12',
});

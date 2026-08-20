import type { NodeSchema } from '../../schemas/types';
import { createSvgShapeSchema } from '../svg/svgShared';

export const pathSchema: NodeSchema = createSvgShapeSchema({
  name: 'path',
  description:
    'A path shape inside an svg. The d attribute holds the path data copied straight from an icon set. Inherits fill and stroke from its svg unless it sets its own.',
  geometry: ['d'],
  requiredGeometry: ['d'],
  example: '> path:\n  - d: M3 12h18',
});

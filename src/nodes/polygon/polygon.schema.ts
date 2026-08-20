import type { NodeSchema } from '../../schemas/types';
import { createSvgShapeSchema } from '../svg/svgShared';

export const polygonSchema: NodeSchema = createSvgShapeSchema({
  name: 'polygon',
  description:
    'A closed shape inside an svg, given as a points list. Unlike polyline the final point joins back to the first.',
  geometry: ['points'],
  requiredGeometry: ['points'],
  example: '> polygon:\n  - points: 12 2 22 22 2 22',
});

import type { NodeSchema } from '../../schemas/types';
import { createSvgShapeSchema } from '../svg/svgShared';

export const polylineSchema: NodeSchema = createSvgShapeSchema({
  name: 'polyline',
  description: 'A connected series of straight lines inside an svg, given as a points list (e.g. "20 6 9 17 4 12").',
  geometry: ['points'],
  requiredGeometry: ['points'],
  example: '> polyline:\n  - points: 20 6 9 17 4 12',
});

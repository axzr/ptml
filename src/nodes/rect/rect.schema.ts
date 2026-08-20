import type { NodeSchema } from '../../schemas/types';
import { createSvgShapeSchema } from '../svg/svgShared';

export const rectSchema: NodeSchema = createSvgShapeSchema({
  name: 'rect',
  description: 'A rectangle shape inside an svg. Width and height are required; x, y, rx and ry are optional.',
  geometry: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  requiredGeometry: ['width', 'height'],
  example: '> rect:\n  - x: 3\n  - y: 3\n  - width: 18\n  - height: 18\n  - rx: 2',
});

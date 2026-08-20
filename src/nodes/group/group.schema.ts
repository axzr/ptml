import type { NodeSchema } from '../../schemas/types';
import { createSvgShapeSchema } from '../svg/svgShared';

// Renders an SVG <g>. Named "group" rather than "g" so the source stays
// readable, in the same spirit as box rendering a div.
export const groupSchema: NodeSchema = createSvgShapeSchema({
  name: 'group',
  description:
    'Groups shapes inside an svg so a transform, fill or stroke can be applied to all of them at once. Renders an SVG g element.',
  geometry: [],
  requiredGeometry: [],
  example: '> group:\n  - transform: translate(4 4)\n  > path:\n    - d: M3 12h18',
  childShapes: true,
});

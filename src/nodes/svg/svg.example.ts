// A real Lucide "check" icon. stroke: currentColor is the point of inline svg:
// the icon takes its colour from whatever it sits in, which a data-URI <img>
// cannot do.
const svgCheckIcon = `ptml:
> box:
  - styles:
    - color: #1e7f4f
  > svg:
    - viewBox: 0 0 24 24
    - fill: none
    - stroke: currentColor
    - stroke-width: 2
    - stroke-linecap: round
    - stroke-linejoin: round
    - title: Done
    > polyline:
      - points: 20 6 9 17 4 12
`;

const svgDecorative = `ptml:
> svg:
  - viewBox: 0 0 24 24
  > path:
    - d: M3 12h18
`;

const svgEveryShape = `ptml:
> svg:
  - viewBox: 0 0 24 24
  > path:
    - d: M3 12h18
  > circle:
    - cx: 12
    - cy: 12
    - r: 10
  > ellipse:
    - cx: 6
    - cy: 6
    - rx: 4
    - ry: 2
  > rect:
    - x: 1
    - y: 1
    - width: 4
    - height: 4
    - rx: 1
  > line:
    - x1: 0
    - y1: 0
    - x2: 9
    - y2: 9
  > polygon:
    - points: 12 2 22 22 2 22
  > group:
    - transform: translate(4 4)
    > path:
      - d: M0 0h4
`;

const svgSizedByBreakpoint = `breakpoints:
- mobile: 768
- desktop:

define: icon
- width: 16px
> breakpoint: desktop or more
  - width: 32px

ptml:
> svg:
  - viewBox: 0 0 24 24
  - styles: icon
  > path:
    - d: M3 12h18
`;

const svgPathFromState = `state:
- iconPath: M3 12h18

ptml:
> svg:
  - viewBox: 0 0 24 24
  > path:
    - d: $iconPath
`;

const svgWithoutViewBox = `ptml:
> svg:
  > path:
    - d: M3 12h18
`;

const svgPathWithoutD = `ptml:
> svg:
  - viewBox: 0 0 24 24
  > path:
    - fill: red
`;

const svgRectWithoutHeight = `ptml:
> svg:
  - viewBox: 0 0 24 24
  > rect:
    - width: 4
`;

const svgMistypedAttribute = `ptml:
> svg:
  - viewBox: 0 0 24 24
  > path:
    - d: M3 12h18
    - strokewidth: 2
`;

const svgShapeOutsideSvg = `ptml:
> box:
  > path:
    - d: M3 12h18
`;

export {
  svgCheckIcon,
  svgDecorative,
  svgEveryShape,
  svgSizedByBreakpoint,
  svgPathFromState,
  svgWithoutViewBox,
  svgPathWithoutD,
  svgRectWithoutHeight,
  svgMistypedAttribute,
  svgShapeOutsideSvg,
};

export const docExample = `
ptml:
> svg:
  - viewBox: 0 0 24 24
  - fill: none
  - stroke: currentColor
  - stroke-width: 2
  - title: Done
  > polyline:
    - points: 20 6 9 17 4 12
`;

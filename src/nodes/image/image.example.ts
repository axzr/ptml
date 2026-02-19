const basicImage = `ptml:
> image:
  - src: https://example.com/photo.jpg
`;

const imageWithAlt = `ptml:
> image:
  - src: https://example.com/photo.jpg
  - alt: A sample photo
`;

const imageWithStyles = `ptml:
> image:
  - src: https://example.com/photo.jpg
  - alt: Styled photo
  - styles:
    - width: 200px
    - height: 150px
    - objectFit: cover
`;

const imageWithStateBoundSrc = `state:
- imageUrl: https://example.com/dynamic.jpg

ptml:
> image:
  - src: $imageUrl
  - alt: Dynamic image
`;

const imageWithStateBoundAlt = `state:
- imageAlt: Logo for Brand
- imageUrl: https://example.com/logo.png

ptml:
> image:
  - src: $imageUrl
  - alt: $imageAlt
`;

export { basicImage, imageWithAlt, imageWithStyles, imageWithStateBoundSrc, imageWithStateBoundAlt };

export const docExample = `
ptml:
> image:
  - src: https://example.com/photo.jpg
  - alt: A scenic mountain view
`;

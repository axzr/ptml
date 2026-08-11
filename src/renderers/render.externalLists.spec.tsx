import { describe, it, expect } from 'vitest';
import { render as renderRtl, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render as renderPtml } from './render';
import { usePtmlRender } from '../hooks/usePtmlRender';

describe('externalLists (host-supplied records)', () => {
  it('populates an empty recordList declaration from externalLists', () => {
    const ptml = `
recordList: books

ptml:
> each: books as $book
  > box
    > text: $book.title -- $book.author
`;

    const node = renderPtml(ptml, undefined, undefined, {
      books: [
        { title: 'Dune', author: 'Herbert' },
        { title: 'Neuromancer', author: 'Gibson' },
      ],
    });
    renderRtl(<div>{node}</div>);

    expect(screen.getByText('Dune -- Herbert')).toBeInTheDocument();
    expect(screen.getByText('Neuromancer -- Gibson')).toBeInTheDocument();
  });

  it('does not require the list to be declared at all', () => {
    const ptml = `
ptml:
> each: books as $book
  > text: $book.title
`;

    const node = renderPtml(ptml, undefined, undefined, {
      books: [{ title: 'Dune' }],
    });
    renderRtl(<div>{node}</div>);

    expect(screen.getByText('Dune')).toBeInTheDocument();
  });

  it('merges externalLists alongside other locally-declared lists rather than replacing them', () => {
    const ptml = `
valueList: colours
- red
- green

recordList: books

ptml:
> each: colours as $colour
  > text: colour $colour
> each: books as $book
  > text: book $book.title
`;

    const node = renderPtml(ptml, undefined, undefined, {
      books: [{ title: 'Dune' }],
    });
    const { container } = renderRtl(<div>{node}</div>);

    expect(container.textContent).toContain('colour red');
    expect(container.textContent).toContain('colour green');
    expect(container.textContent).toContain('book Dune');
  });

  it('an externally-supplied list overrides a same-named locally-declared list', () => {
    const ptml = `
recordList: books
- record:
  - title: Local Only

ptml:
> each: books as $book
  > text: $book.title
`;

    const node = renderPtml(ptml, undefined, undefined, {
      books: [{ title: 'From Host' }],
    });
    renderRtl(<div>{node}</div>);

    expect(screen.getByText('From Host')).toBeInTheDocument();
    expect(screen.queryByText('Local Only')).not.toBeInTheDocument();
  });

  it('is still available after interaction, on interactive prototypes with click handlers', async () => {
    const user = userEvent.setup();
    const ptml = `
state:
- clicks: 0

recordList: books

ptml:
> button:
  - click:
    ! set: $clicks 1
  > text: increment

> text: clicks is $clicks

> each: books as $book
  > text: $book.title
`;

    const node = renderPtml(ptml, undefined, undefined, {
      books: [{ title: 'Dune' }],
    });
    const { container } = renderRtl(<div>{node}</div>);

    expect(container.textContent).toContain('Dune');

    await user.click(screen.getByText('increment'));

    expect(container.textContent).toContain('clicks is 1');
    expect(container.textContent).toContain('Dune');
  });

  it('is forwarded correctly by the usePtmlRender hook', () => {
    const ptml = `
recordList: books

ptml:
> each: books as $book
  > text: $book.title
`;

    const { result } = renderHook(() =>
      usePtmlRender(ptml, { externalLists: { books: [{ title: 'Dune' }] } }),
    );

    expect(result.current.error).toBeNull();
    renderRtl(<div>{result.current.node}</div>);
    expect(screen.getByText('Dune')).toBeInTheDocument();
  });
});

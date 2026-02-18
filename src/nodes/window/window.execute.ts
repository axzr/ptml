import type { Node, ExecutionContext } from '../../types';

export const executeWindowOperation = (child: Node, _context: ExecutionContext): void => {
  const operation = child.data?.trim().split(/\s+/)[0];

  if (operation === 'scrollTop') {
    globalThis.scrollTo(0, 0);
  }
};

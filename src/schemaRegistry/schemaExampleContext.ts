import type { SchemaExampleContext } from './testCaseTypes';

export const getExampleContextForListOperations = (): SchemaExampleContext => ({
  lists: ['items'],
  state: { x: '0' },
  parentNode: 'click',
});

export const getExampleContextForListGetSetOperations = (): SchemaExampleContext => ({
  lists: ['items'],
  state: { index: '0' },
  parentNode: 'click',
});

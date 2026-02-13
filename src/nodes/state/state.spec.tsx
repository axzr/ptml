import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  multipleVariables,
  canRenderTrueFalse,
  canRenderNull,
  userObject,
  colonsAreOptional,
  stateWithPipe,
  stateBeforeList,
  stateWithLists,
  stateWithUndefinedRef,
} from './state.example';
import { render as renderPtml, validate, parse } from '../../index';
import { buildStateAndLists } from '../../state/state';
import { StateErrors } from '../../errors/messages';
import { normalizeLineNumbers } from '../../errors/testHelpers';

describe('State (simple scalars)', () => {
  it('validates multipleVariables', () => {
    const validation = validate(multipleVariables);
    expect(validation.isValid).toBe(true);
  });

  it('parses multipleVariables into text and state nodes with multiple variables', () => {
    const nodes = parse(multipleVariables);
    expect(nodes.length).toBe(2);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    expect(stateNode?.children).toHaveLength(2);
    const userNameChild = stateNode?.children.find((c) => c.type === 'userName');
    expect(userNameChild).toBeDefined();
    expect(userNameChild?.data).toBe('John Doe');
    const ageChild = stateNode?.children.find((c) => c.type === 'age');
    expect(ageChild).toBeDefined();
    expect(ageChild?.data).toBe('30');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textNode = ptmlNode?.children.find((c) => c.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('hello $userName and $age');
  });

  it('renders multipleVariables with interpolated state values', () => {
    const node = renderPtml(multipleVariables);
    render(<div>{node}</div>);

    expect(screen.getByText('hello John Doe and 30')).toBeInTheDocument();
  });

  it('validates canRenderTrueFalse', () => {
    const validation = validate(canRenderTrueFalse);
    expect(validation.isValid).toBe(true);
  });

  it('parses canRenderTrueFalse into text and state nodes with boolean values', () => {
    const nodes = parse(canRenderTrueFalse);
    expect(nodes.length).toBe(2);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    expect(stateNode?.children).toHaveLength(2);
    const isAdminChild = stateNode?.children.find((c) => c.type === 'isAdmin');
    expect(isAdminChild).toBeDefined();
    expect(isAdminChild?.data).toBe('true');
    const likesAppleChild = stateNode?.children.find((c) => c.type === 'likesApple');
    expect(likesAppleChild).toBeDefined();
    expect(likesAppleChild?.data).toBe('false');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textNode = ptmlNode?.children.find((c) => c.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('hello $isAdmin $likesApple');
  });

  it('renders canRenderTrueFalse with interpolated boolean state values', () => {
    const node = renderPtml(canRenderTrueFalse);
    render(<div>{node}</div>);

    expect(screen.getByText('hello true false')).toBeInTheDocument();
  });

  it('validates canRenderNull', () => {
    const validation = validate(canRenderNull);
    expect(validation.isValid).toBe(true);
  });

  it('parses canRenderNull into text and state nodes with null value', () => {
    const nodes = parse(canRenderNull);
    expect(nodes.length).toBe(2);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    expect(stateNode?.children).toHaveLength(1);
    const isAdminChild = stateNode?.children.find((c) => c.type === 'isAdmin');
    expect(isAdminChild).toBeDefined();
    expect(isAdminChild?.data).toBe('null');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textNode = ptmlNode?.children.find((c) => c.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('hello $isAdmin');
  });

  it('renders canRenderNull with interpolated null state value', () => {
    const node = renderPtml(canRenderNull);
    render(<div>{node}</div>);

    expect(screen.getByText('hello null')).toBeInTheDocument();
  });

  it('validates userObject', () => {
    const validation = validate(userObject);
    expect(validation.isValid).toBe(true);
  });

  it('parses userObject into text and state nodes with nested object', () => {
    const nodes = parse(userObject);
    expect(nodes.length).toBe(2);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    expect(stateNode?.children).toHaveLength(1);

    const userChild = stateNode?.children[0];
    expect(userChild).toBeDefined();
    expect(userChild?.type).toBe('user');
    expect(userChild?.data).toBe('');
    expect(userChild?.children).toHaveLength(2);

    const [nameChild, ageChild] = userChild?.children || [];
    expect(nameChild.type).toBe('name');
    expect(nameChild.data).toBe('John Doe');
    expect(ageChild.type).toBe('age');
    expect(ageChild.data).toBe('30');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textNode = ptmlNode?.children.find((c) => c.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('hello $user.name and $user.age');
  });

  it('renders userObject with interpolated nested object properties', () => {
    const node = renderPtml(userObject);
    render(<div>{node}</div>);

    expect(screen.getByText('hello John Doe and 30')).toBeInTheDocument();
  });

  it('validates colonsAreOptional', () => {
    const validation = validate(colonsAreOptional);
    expect(validation.isValid).toBe(true);
  });

  it('parses colonsAreOptional into text and state nodes with nested object (no colons)', () => {
    const nodes = parse(colonsAreOptional);
    expect(nodes.length).toBe(2);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    expect(stateNode?.children).toHaveLength(1);

    const userChild = stateNode?.children[0];
    expect(userChild).toBeDefined();
    expect(userChild?.type).toBe('user');
    expect(userChild?.data).toBe('');
    expect(userChild?.children).toHaveLength(2);

    const [nameChild, ageChild] = userChild?.children || [];
    expect(nameChild.type).toBe('name');
    expect(nameChild.data).toBe('John Doe');
    expect(ageChild.type).toBe('age');
    expect(ageChild.data).toBe('30');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textNode = ptmlNode?.children.find((c) => c.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('hello $user.name and $user.age');
  });

  it('renders colonsAreOptional with interpolated nested object properties', () => {
    const node = renderPtml(colonsAreOptional);
    render(<div>{node}</div>);

    expect(screen.getByText('hello John Doe and 30')).toBeInTheDocument();
  });
});

describe('State with pipe expression (stateWithPipe)', () => {
  it('validates stateWithPipe', () => {
    const validation = validate(stateWithPipe);
    expect(validation.isValid).toBe(true);
  });

  it('parses stateWithPipe into list, state, and text nodes', () => {
    const nodes = parse(stateWithPipe);
    expect(nodes.length).toBeGreaterThan(0);

    const listNode = nodes.find((n) => n.type === 'valueList' || n.type === 'recordList');
    expect(listNode).toBeDefined();
    expect(listNode?.data).toBe('names');
    expect(listNode?.children).toHaveLength(3);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    const numNamesChild = stateNode?.children.find((c) => c.type === 'numNames');
    expect(numNamesChild).toBeDefined();
    expect(numNamesChild?.data).toBe('$names | length');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textNode = ptmlNode?.children.find((c) => c.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('there are $numNames names');
  });

  it('builds state map with evaluated pipe expression', () => {
    const nodes = parse(stateWithPipe);
    const { state: stateMap, lists: listMap } = buildStateAndLists(nodes);

    expect(listMap.names).toBeDefined();
    expect(listMap.names).toHaveLength(3);
    expect(listMap.names).toEqual(['John', 'Jannette', 'Jim']);

    expect(stateMap.numNames).toBeDefined();
    expect(stateMap.numNames).toBe(3);
  });

  it('renders stateWithPipe with evaluated pipe expression', () => {
    const node = renderPtml(stateWithPipe);
    render(<div>{node}</div>);

    expect(screen.getByText('there are 3 names')).toBeInTheDocument();
  });
});

describe('State with pipe expression before list (stateBeforeList)', () => {
  it('throws error when state references list declared later', () => {
    let error: Error | undefined;
    try {
      const nodes = parse(stateBeforeList);
      buildStateAndLists(nodes);
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeDefined();
    const expectedMessage = normalizeLineNumbers(
      StateErrors.undefinedVariableReference('state', 'numNames', 0, 'names'),
    );
    const actualMessage = normalizeLineNumbers(error?.message || '');
    expect(actualMessage).toBe(expectedMessage);
  });

  it('renders stateBeforeList with error message', () => {
    let error: Error | undefined;
    try {
      void renderPtml(stateBeforeList);
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeDefined();
    const expectedMessage = normalizeLineNumbers(
      StateErrors.undefinedVariableReference('state', 'numNames', 0, 'names'),
    );
    const actualMessage = normalizeLineNumbers(error?.message || '');
    expect(actualMessage).toBe(expectedMessage);
  });
});

describe('State with undefined reference', () => {
  it('throws error when state references undefined list', () => {
    let error: Error | undefined;
    try {
      const nodes = parse(stateWithUndefinedRef);
      buildStateAndLists(nodes);
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeDefined();
    const expectedMessage = normalizeLineNumbers(
      StateErrors.undefinedVariableReference('state', 'count', 0, 'unknownList'),
    );
    const actualMessage = normalizeLineNumbers(error?.message || '');
    expect(actualMessage).toBe(expectedMessage);
  });
});

describe('State with arrays (stateWithLists)', () => {
  it('validates stateWithLists', () => {
    const validation = validate(stateWithLists);
    expect(validation.isValid).toBe(true);
  });

  it('parses stateWithLists into state, list, and each nodes', () => {
    const nodes = parse(stateWithLists);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.children).toHaveLength(3);

    const todoChild = stateNode?.children.find((c) => c.type === 'todo');
    expect(todoChild).toBeDefined();
    expect(todoChild?.children).toHaveLength(2);

    const titleChild = todoChild?.children.find((c) => c.type === 'title');
    expect(titleChild).toBeDefined();
    expect(titleChild?.data).toBe('Todo');

    const itemsChild = todoChild?.children.find((c) => c.type === 'items');
    expect(itemsChild).toBeDefined();
    expect(itemsChild?.children).toHaveLength(2);
    expect(itemsChild?.children[0].category).toBe('property');
    expect(itemsChild?.children[0].type).toBe('Buy groceries');
    expect(itemsChild?.children[0].data).toBe('');
    expect(itemsChild?.children[1].category).toBe('property');
    expect(itemsChild?.children[1].type).toBe('Walk the dog');
    expect(itemsChild?.children[1].data).toBe('');

    const listNode = nodes.find((n) => n.type === 'valueList' || n.type === 'recordList');
    expect(listNode).toBeDefined();
    expect(listNode?.data).toBe('columns');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const eachNode = ptmlNode?.children.find((n) => n.type === 'each');
    expect(eachNode).toBeDefined();
    expect(eachNode?.data).toBe('columns as $column');
  });

  it('builds state map with arrays correctly', () => {
    const nodes = parse(stateWithLists);
    const { state: stateMap, lists: listMap } = buildStateAndLists(nodes);

    expect(stateMap.todo).toBeDefined();
    expect(typeof stateMap.todo).toBe('object');
    expect(stateMap.todo).not.toBeNull();
    const todo = stateMap.todo;
    if (todo !== null && typeof todo === 'object' && !Array.isArray(todo)) {
      expect(todo.title).toBe('Todo');
      expect(Array.isArray(todo.items)).toBe(true);
      expect(todo.items).toEqual(['Buy groceries', 'Walk the dog']);
    }

    expect(stateMap.doing).toBeDefined();
    const doing = stateMap.doing;
    if (doing !== null && typeof doing === 'object' && !Array.isArray(doing)) {
      expect(doing.title).toBe('Doing');
      expect(Array.isArray(doing.items)).toBe(true);
      expect(doing.items).toEqual(['Write documentation']);
    }

    expect(stateMap.done).toBeDefined();
    const done = stateMap.done;
    if (done !== null && typeof done === 'object' && !Array.isArray(done)) {
      expect(done.title).toBe('Done');
      expect(Array.isArray(done.items)).toBe(true);
      expect(done.items).toEqual(['Set up project']);
    }

    expect(listMap.columns).toBeDefined();
    expect(Array.isArray(listMap.columns)).toBe(true);
    expect(listMap.columns.length).toBe(3);
  });

  it('renders stateWithLists with nested each loops', () => {
    const node = renderPtml(stateWithLists);
    render(<div>{node}</div>);

    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('Doing')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
    expect(screen.getByText('Write documentation')).toBeInTheDocument();
    expect(screen.getByText('Set up project')).toBeInTheDocument();
  });

  it('renders items in correct columns', () => {
    const node = renderPtml(stateWithLists);
    render(<div>{node}</div>);

    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('Doing')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
    expect(screen.getByText('Write documentation')).toBeInTheDocument();
    expect(screen.getByText('Set up project')).toBeInTheDocument();
  });
});

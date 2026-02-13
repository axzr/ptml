import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { basicValueList, invalidLoopVariable, valueListItemsFromState } from './valueList.example';
import { render as renderPtml, validate, parse } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { VariableErrors } from '../../errors/messages';
import { buildStateAndLists } from '../../state/state';

describe('Basic valueList (basicValueList)', () => {
  it('validates basicValueList', () => {
    const validation = validate(basicValueList);
    expect(validation.isValid).toBe(true);
  });

  it('parses basicValueList into valueList and box nodes', () => {
    const nodes = parse(basicValueList);
    expect(nodes.length).toBeGreaterThan(0);

    const valueListNode = nodes.find((n) => n.type === 'valueList');
    expect(valueListNode).toBeDefined();
    expect(valueListNode?.data).toBe('items');
    expect(valueListNode?.children).toHaveLength(3);

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();
  });

  it('renders basicValueList with all list items displayed', () => {
    const node = renderPtml(basicValueList);
    render(<div>{node}</div>);

    expect(screen.getByText('item 1')).toBeInTheDocument();
    expect(screen.getByText('item 2')).toBeInTheDocument();
    expect(screen.getByText('item 3')).toBeInTheDocument();
  });

  it('displays list items in correct order', () => {
    const node = renderPtml(basicValueList);
    const { container } = render(<div>{node}</div>);

    const textNodes = Array.from(container.querySelectorAll('*')).filter((el) => {
      const text = el.textContent || '';
      return text === 'item 1' || text === 'item 2' || text === 'item 3';
    });

    expect(textNodes.length).toBe(3);
  });

  it('preserves full text of list items with spaces', () => {
    const node = renderPtml(basicValueList);
    render(<div>{node}</div>);

    expect(screen.getByText('item 1')).toBeInTheDocument();
    expect(screen.getByText('item 2')).toBeInTheDocument();
    expect(screen.getByText('item 3')).toBeInTheDocument();
  });
});

describe('Invalid loop variable (invalidLoopVariable)', () => {
  it('validates invalidLoopVariable as invalid', () => {
    const validation = validate(invalidLoopVariable);
    expect(validation.isValid).toBe(false);
  });

  it('parses invalidLoopVariable into valueList, state, box, and each nodes', () => {
    const nodes = parse(invalidLoopVariable);
    expect(nodes.length).toBeGreaterThan(0);

    const valueListNode = nodes.find((n) => n.type === 'valueList');
    expect(valueListNode).toBeDefined();

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const eachNode = boxNode?.children.find((child) => child.type === 'each');
    expect(eachNode).toBeDefined();
  });

  it('provides helpful error message about loop variable name conflict with state variable', () => {
    const validation = validate(invalidLoopVariable);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, VariableErrors.loopVariableConflict, 'each', 0, 'item');
  });
});

describe('ValueList with state variables (valueListItemsFromState)', () => {
  it('validates valueListItemsFromState', () => {
    const validation = validate(valueListItemsFromState);
    expect(validation.isValid).toBe(true);
  });

  it('parses valueListItemsFromState into valueList node with state variable references', () => {
    const nodes = parse(valueListItemsFromState);
    expect(nodes.length).toBeGreaterThan(0);

    const valueListNode = nodes.find((n) => n.type === 'valueList' && n.data === 'columns');
    expect(valueListNode).toBeDefined();
    expect(valueListNode?.children.length).toBe(3);

    const firstChild = valueListNode?.children[0];
    expect(firstChild?.category).toBe('property');
    expect(firstChild?.type).toBe('value');
    expect(firstChild?.data).toBe('$todo');

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    const todoChild = stateNode?.children.find((c) => c.type === 'todo');
    expect(todoChild).toBeDefined();
  });

  it('resolves state variable references in valueList to actual state objects', () => {
    const nodes = parse(valueListItemsFromState);
    const { state: stateMap, lists: listMap } = buildStateAndLists(nodes);

    expect(listMap.columns).toBeDefined();
    expect(listMap.columns.length).toBe(3);
    expect(listMap.columns[0]).toEqual(stateMap.todo);
    expect(listMap.columns[1]).toEqual(stateMap.doing);
    expect(listMap.columns[2]).toEqual(stateMap.done);
  });

  it('renders valueListItemsFromState with state objects resolved from valueList', () => {
    const node = renderPtml(valueListItemsFromState);
    render(<div>{node}</div>);

    expect(screen.getByText(/this is the title: Todo/)).toBeInTheDocument();
    expect(screen.getByText(/this is the title: Doing/)).toBeInTheDocument();
    expect(screen.getByText(/this is the title: Done/)).toBeInTheDocument();
  });
});

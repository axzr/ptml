import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  simpleList,
  invalidListData,
  eachWithIndex,
  indexOnly,
  invalidEach,
  invalidEachInBox,
  setToIndex,
  invalidEachData,
  stateGetEach,
} from './each.example';
import { render as renderPtml, validate, parse } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { DataFormatErrors, ValidatorErrors } from '../../errors/messages';

describe('Each loops (simpleList)', () => {
  it('validates simpleList', () => {
    const validation = validate(simpleList);
    expect(validation.isValid).toBe(true);
  });

  it('parses simpleList into valueList and each nodes', () => {
    const nodes = parse(simpleList);
    expect(nodes.length).toBe(2);

    const listNode = nodes[0];
    expect(listNode.type).toBe('valueList');
    expect(listNode.data).toBe('fruits');
    expect(listNode.children).toHaveLength(3);
    expect(listNode.children[0].data).toBe('apple');
    expect(listNode.children[1].data).toBe('banana');
    expect(listNode.children[2].data).toBe('cherry');

    const ptmlNode = nodes[1];
    expect(ptmlNode.type).toBe('ptml');
    const eachNode = ptmlNode.children.find((n) => n.type === 'each');
    expect(eachNode).toBeDefined();
    expect(eachNode?.data).toBe('fruits as $fruit');
  });

  it('renders simpleList with all fruits', () => {
    const node = renderPtml(simpleList);
    render(<div>{node}</div>);

    expect(screen.getByText('this is the fruit: apple')).toBeInTheDocument();
    expect(screen.getByText('this is the fruit: banana')).toBeInTheDocument();
    expect(screen.getByText('this is the fruit: cherry')).toBeInTheDocument();
  });
});

describe('Invalid list data (invalidListData)', () => {
  it('rejects invalidListData with inline list items', () => {
    const validation = validate(invalidListData);
    expect(validation.isValid).toBe(false);
  });

  it('provides informative error message for inline list items', () => {
    const validation = validate(invalidListData);
    expect(validation.isValid).toBe(false);

    const maxParts = 1;
    const foundParts = 4;

    expectErrorToMatchIgnoringLineNumber(
      validation,
      DataFormatErrors.maxPartsExceeded,
      'valueList',
      0,
      maxParts,
      foundParts,
    );
  });
});

describe('Each with index (eachWithIndex)', () => {
  it('validates eachWithIndex', () => {
    const validation = validate(eachWithIndex);
    expect(validation.isValid).toBe(true);
  });

  it('parses eachWithIndex with both item and index variables', () => {
    const nodes = parse(eachWithIndex);
    expect(nodes.length).toBe(2);

    const ptmlNode = nodes[1];
    expect(ptmlNode.type).toBe('ptml');
    const eachNode = ptmlNode.children.find((n) => n.type === 'each');
    expect(eachNode).toBeDefined();
    expect(eachNode?.data).toBe('fruits as $fruit, index as $index');
  });

  it('renders eachWithIndex with both item and index accessible', () => {
    const node = renderPtml(eachWithIndex);
    render(<div>{node}</div>);

    expect(screen.getByText('this is the fruit: apple at index 0')).toBeInTheDocument();
    expect(screen.getByText('this is the fruit: banana at index 1')).toBeInTheDocument();
    expect(screen.getByText('this is the fruit: cherry at index 2')).toBeInTheDocument();
  });
});

describe('Each with index only (indexOnly)', () => {
  it('validates indexOnly', () => {
    const validation = validate(indexOnly);
    expect(validation.isValid).toBe(true);
  });

  it('parses indexOnly with only index variable', () => {
    const nodes = parse(indexOnly);
    expect(nodes.length).toBe(2);

    const ptmlNode = nodes[1];
    expect(ptmlNode.type).toBe('ptml');
    const eachNode = ptmlNode.children.find((n) => n.type === 'each');
    expect(eachNode).toBeDefined();
    expect(eachNode?.data).toBe('fruits, index as $index');
  });

  it('renders indexOnly with only index accessible', () => {
    const node = renderPtml(indexOnly);
    render(<div>{node}</div>);

    expect(screen.getByText('this is the index: 0')).toBeInTheDocument();
    expect(screen.getByText('this is the index: 1')).toBeInTheDocument();
    expect(screen.getByText('this is the index: 2')).toBeInTheDocument();
    expect(screen.getByText('this is the index: 3')).toBeInTheDocument();
  });
});

describe('Invalid each syntax (invalidEach)', () => {
  it('rejects invalidEach with missing $ prefix on variable name', () => {
    const validation = validate(invalidEach);
    expect(validation.isValid).toBe(false);
  });

  it('provides informative error message for invalid each node', () => {
    const validation = validate(invalidEach);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidatorErrors.listNameBindingVariableName, 'each', 0, 'fruit');
  });
});

describe('Invalid each syntax in box (invalidEachInBox)', () => {
  it('rejects invalidEachInBox with missing $ prefix on variable name', () => {
    const validation = validate(invalidEachInBox);
    expect(validation.isValid).toBe(false);
  });

  it('provides informative error message for invalid each node in box', () => {
    const validation = validate(invalidEachInBox);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidatorErrors.listNameBindingVariableName, 'each', 0, 'fruit');
  });
});

describe('Set to index (setToIndex)', () => {
  it('validates setToIndex', () => {
    const validation = validate(setToIndex);
    expect(validation.isValid).toBe(true);
  });

  it('parses setToIndex with state, list, and each nodes', () => {
    const nodes = parse(setToIndex);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const selectedIndexChild = stateNode?.children.find((c) => c.type === 'selectedIndex');
    expect(selectedIndexChild).toBeDefined();

    const listNode = nodes.find((n) => n.type === 'valueList' && n.data === 'fruits');
    expect(listNode).toBeDefined();

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const eachNode = ptmlNode?.children.find((n) => n.type === 'each');
    expect(eachNode).toBeDefined();
    expect(eachNode?.data).toBe('fruits as $fruit, index as $index');
  });

  it('renders setToIndex with buttons for each fruit', () => {
    const node = renderPtml(setToIndex);
    render(<div>{node}</div>);

    expect(screen.getByText('select apple')).toBeInTheDocument();
    expect(screen.getByText('select banana')).toBeInTheDocument();
    expect(screen.getByText('select cherry')).toBeInTheDocument();
  });

  it('displays selected index initially', () => {
    const node = renderPtml(setToIndex);
    render(<div>{node}</div>);

    expect(screen.getByText(/the selected index is:/)).toBeInTheDocument();
  });

  it('updates selected index when button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(setToIndex);
    const { container } = render(<div>{node}</div>);

    const bananaButton = screen.getByText('select banana');
    await user.click(bananaButton);

    const textContent = container.textContent;
    expect(textContent).toContain('the selected index is: 1');
  });

  it('updates selected index correctly for different buttons', async () => {
    const user = userEvent.setup();
    const node = renderPtml(setToIndex);
    const { container } = render(<div>{node}</div>);

    const appleButton = screen.getByText('select apple');
    await user.click(appleButton);

    expect(container.textContent).toContain('the selected index is: 0');

    const cherryButton = screen.getByText('select cherry');
    await user.click(cherryButton);

    expect(container.textContent).toContain('the selected index is: 2');
  });
});

describe('Invalid each data (invalidEachData)', () => {
  it('validates invalidEachData as invalid (extra text after variable)', () => {
    const validation = validate(invalidEachData);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.listNameBindingInvalidSyntax,
      'each',
      0,
      'fruits as $fruit bat',
    );
  });
});

describe('State get each (stateGetEach)', () => {
  it('validates stateGetEach', () => {
    const validation = validate(stateGetEach);
    expect(validation.isValid).toBe(true);
  });

  it('parses stateGetEach into correct node structure', () => {
    const nodes = parse(stateGetEach);
    expect(nodes.length).toBeGreaterThan(0);

    const namesListNode = nodes.find((n) => n.type === 'valueList' && n.data === 'names');
    expect(namesListNode).toBeDefined();
    expect(namesListNode?.children).toHaveLength(3);

    const namesLengthsListNode = nodes.find((n) => n.type === 'valueList' && n.data === 'namesLengths');
    expect(namesLengthsListNode).toBeDefined();

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();

    const initNode = nodes.find((n) => n.type === 'init');
    expect(initNode).toBeDefined();
    const callNode = initNode?.children.find((c) => c.type === 'call');
    expect(callNode).toBeDefined();
    expect(callNode?.data).toBe('populateNamesLengths');

    const functionNode = nodes.find((n) => n.type === 'function' && n.data?.startsWith('populateNamesLengths'));
    expect(functionNode).toBeDefined();
    const eachInFunction = functionNode?.children.find((c) => c.type === 'each');
    expect(eachInFunction).toBeDefined();
    expect(eachInFunction?.data).toBe('names as $name, index as $i');
    const setValueInFunction = eachInFunction?.children.find((c) => c.type === 'setValue');
    expect(setValueInFunction).toBeDefined();
    expect(setValueInFunction?.data).toBe('namesLengths $i ($name | length)');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const eachNodes = ptmlNode?.children.filter((n) => n.type === 'each') || [];
    expect(eachNodes.length).toBe(1);

    const displayEachNode = eachNodes.find((n) => n.data === 'namesLengths as $nameLength, index as $index');
    expect(displayEachNode).toBeDefined();
    const listGetNode = displayEachNode?.children.find((c) => c.type === 'getValue' || c.type === 'getRecord');
    expect(listGetNode).toBeDefined();
    expect(listGetNode?.data).toBe('names $index as $name');

    const boxNode = displayEachNode?.children.find((c) => c.type === 'box');
    expect(boxNode).toBeDefined();
  });

  it('renders stateGetEach with correct output', () => {
    const node = renderPtml(stateGetEach);
    render(<div>{node}</div>);

    expect(screen.getByText('4 characters in John')).toBeInTheDocument();
    expect(screen.getByText('8 characters in Jannette')).toBeInTheDocument();
    expect(screen.getByText('3 characters in Jim')).toBeInTheDocument();
  });

  it('populates namesLengths list correctly', () => {
    const node = renderPtml(stateGetEach);
    render(<div>{node}</div>);

    const textContent = document.body.textContent || '';
    expect(textContent).toContain('4 characters in John');
    expect(textContent).toContain('8 characters in Jannette');
    expect(textContent).toContain('3 characters in Jim');
  });
});

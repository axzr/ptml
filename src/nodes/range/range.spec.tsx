import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rangeListSet, rangeListCreateRecord, invalidRange } from './range.example';
import { render as renderPtml, validate, parse } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { ValidatorErrors } from '../../errors/messages';

describe('Range list set (rangeListSet)', () => {
  it('validates rangeListSet', () => {
    const validation = validate(rangeListSet);
    expect(validation.isValid).toBe(true);
  });

  it('parses rangeListSet into correct node structure (state children preserve case)', () => {
    const nodes = parse(rangeListSet);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    const gridSizeChild = stateNode?.children.find((c) => c.type === 'gridSize');
    expect(gridSizeChild).toBeDefined();
    expect(gridSizeChild?.data).toBe('10');

    const listNode = nodes.find((n) => n.type === 'valueList' || n.type === 'recordList');
    expect(listNode).toBeDefined();
    expect(listNode?.data).toBe('grid');

    const functionNode = nodes.find((n) => n.type === 'function');
    expect(functionNode).toBeDefined();
    expect(functionNode?.data).toBe('populateGrid');

    const rangeNode = functionNode?.children.find((c) => c.type === 'range');
    expect(rangeNode).toBeDefined();
    expect(rangeNode?.data).toBe('gridSize as $i');

    const listAddNode = rangeNode?.children.find((c) => c.type === 'addValue' || c.type === 'addRecord');
    expect(listAddNode).toBeDefined();
    expect(listAddNode?.data).toBe('grid $i');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const buttonNode = ptmlNode?.children.find((n) => n.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((c) => c.type === 'click');
    expect(clickNode).toBeDefined();

    const callNode = clickNode?.children.find((c) => c.type === 'call');
    expect(callNode).toBeDefined();
    expect(callNode?.data).toBe('populateGrid');

    const eachNode = ptmlNode?.children.find((n) => n.type === 'each');
    expect(eachNode).toBeDefined();
    expect(eachNode?.data).toBe('grid as $cell');
  });

  it('renders rangeListSet with empty grid initially', () => {
    const node = renderPtml(rangeListSet);
    render(<div>{node}</div>);

    expect(screen.getByRole('button', { name: 'populate grid' })).toBeInTheDocument();
    expect(screen.queryByText(/this is the cell:/)).not.toBeInTheDocument();
  });

  it('populates grid when button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(rangeListSet);
    render(<div>{node}</div>);

    const button = screen.getByRole('button', { name: 'populate grid' });
    await user.click(button);

    expect(screen.getByText('this is the cell: 0')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 1')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 2')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 3')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 4')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 5')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 6')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 7')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 8')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 9')).toBeInTheDocument();
  });

  it('populates grid with exactly 10 items (0-9) when gridSize is 10', async () => {
    const user = userEvent.setup();
    const node = renderPtml(rangeListSet);
    render(<div>{node}</div>);

    const button = screen.getByRole('button', { name: 'populate grid' });
    await user.click(button);

    const cellTexts = screen.getAllByText(/this is the cell:/);
    expect(cellTexts).toHaveLength(10);

    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(`this is the cell: ${i}`)).toBeInTheDocument();
    }
  });
});

describe('Range list create record (rangeListCreateRecord)', () => {
  it('validates rangeListCreateRecord', () => {
    const validation = validate(rangeListCreateRecord);
    expect(validation.isValid).toBe(true);
  });

  it('parses rangeListCreateRecord into correct node structure', () => {
    const nodes = parse(rangeListCreateRecord);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    const gridSizeChild = stateNode?.children.find((c) => c.type === 'gridSize');
    expect(gridSizeChild).toBeDefined();
    expect(gridSizeChild?.data).toBe('10');

    const listNode = nodes.find((n) => n.type === 'valueList' || n.type === 'recordList');
    expect(listNode).toBeDefined();
    expect(listNode?.data).toBe('grid');

    const initNode = nodes.find((n) => n.type === 'init');
    expect(initNode).toBeDefined();
    const initCallNode = initNode?.children.find((c) => c.type === 'call');
    expect(initCallNode).toBeDefined();
    expect(initCallNode?.data).toBe('init');

    const functionNode = nodes.find((n) => n.type === 'function' && n.data === 'init');
    expect(functionNode).toBeDefined();

    const rangeNode = functionNode?.children.find((c) => c.type === 'range');
    expect(rangeNode).toBeDefined();
    expect(rangeNode?.data).toBe('gridSize as $i');

    const listAddNode = rangeNode?.children.find((c) => c.type === 'addValue' || c.type === 'addRecord');
    expect(listAddNode).toBeDefined();
    expect(listAddNode?.data).toBe('grid');

    const recordChild = listAddNode?.children.find((c) => c.type === 'record');
    expect(recordChild).toBeDefined();

    const xField = recordChild?.children.find((c) => c.type === 'x');
    expect(xField).toBeDefined();
    expect(xField?.data).toBe('$i');

    const aliveField = recordChild?.children.find((c) => c.type === 'alive');
    expect(aliveField).toBeDefined();
    expect(aliveField?.data).toBe('false');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const eachNode = ptmlNode?.children.find((n) => n.type === 'each');
    expect(eachNode).toBeDefined();
    expect(eachNode?.data).toBe('grid as $cell');
  });

  it('renders rangeListCreateRecord with records created automatically on mount', () => {
    const node = renderPtml(rangeListCreateRecord);
    render(<div>{node}</div>);

    expect(screen.getByText('this is the cell: 0: false')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 1: false')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 2: false')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 3: false')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 4: false')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 5: false')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 6: false')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 7: false')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 8: false')).toBeInTheDocument();
    expect(screen.getByText('this is the cell: 9: false')).toBeInTheDocument();
  });

  it('creates exactly 10 records (0-9) when gridSize is 10', () => {
    const node = renderPtml(rangeListCreateRecord);
    render(<div>{node}</div>);

    const cellTexts = screen.getAllByText(/this is the cell:/);
    expect(cellTexts).toHaveLength(10);

    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(`this is the cell: ${i}: false`)).toBeInTheDocument();
    }
  });
});

describe('Invalid range (invalidRange)', () => {
  it('validates invalidRange and reports error for missing $ prefix', () => {
    const validation = validate(invalidRange);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidatorErrors.rangeVariableName, 0, 'i');
  });

  it('provides informative error message about missing $ prefix on range variable', () => {
    const validation = validate(invalidRange);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidatorErrors.rangeVariableName, 0, 'i');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { recordListWithRecords } from './recordList.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('RecordList with records (recordListWithRecords)', () => {
  it('validates recordListWithRecords', () => {
    const validation = validate(recordListWithRecords);
    expect(validation.isValid).toBe(true);
  });

  it('parses recordListWithRecords into recordList node with record children', () => {
    const nodes = parse(recordListWithRecords);
    expect(nodes.length).toBeGreaterThan(0);

    const recordListNode = nodes.find((n) => n.type === 'recordList' && n.data === 'expenses');
    expect(recordListNode).toBeDefined();
    expect(recordListNode?.children.length).toBe(2);

    const firstRecord = recordListNode?.children[0];
    expect(firstRecord).toBeDefined();
    expect(firstRecord?.type).toBe('record');
    expect(firstRecord?.children.length).toBe(3);

    const descriptionNode = firstRecord?.children.find((c) => c.type === 'description');
    expect(descriptionNode).toBeDefined();
    expect(descriptionNode?.data).toBe('Groceries');

    const categoryNode = firstRecord?.children.find((c) => c.type === 'category');
    expect(categoryNode).toBeDefined();
    expect(categoryNode?.data).toBe('Food');

    const amountNode = firstRecord?.children.find((c) => c.type === 'amount');
    expect(amountNode).toBeDefined();
    expect(amountNode?.data).toBe('45.50');
  });

  it('renders recordListWithRecords with record properties', () => {
    const node = renderPtml(recordListWithRecords);
    render(<div>{node}</div>);

    expect(screen.getByText(/Groceries/)).toBeInTheDocument();
    expect(screen.getByText(/Food/)).toBeInTheDocument();
    expect(screen.getByText(/45\.50/)).toBeInTheDocument();
    expect(screen.getByText(/Bus ticket/)).toBeInTheDocument();
    expect(screen.getByText(/Transport/)).toBeInTheDocument();
    expect(screen.getByText(/2\.50/)).toBeInTheDocument();
  });
});

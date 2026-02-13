import React from 'react';
import { getNodeStyles } from '../../renderers/helpers';
import { rowNodeToReactInSection } from '../row/row.render';
import type { RenderContext } from '../../renderers/types';
import type { TableSection } from '../row/row.render';
import type { Node } from '../../types';

const getRowSection = (rowNode: { children: { type: string; data?: string }[] }): TableSection => {
  const roleNode = rowNode.children.find((child) => child.type === 'role');
  const value = (roleNode?.data ?? 'body').trim().toLowerCase();
  if (value === 'header') return 'header';
  if (value === 'footer') return 'footer';
  return 'body';
};

const groupRowsBySection = (rows: Node[]): { header: Node[]; body: Node[]; footer: Node[] } => {
  const header: Node[] = [];
  const body: Node[] = [];
  const footer: Node[] = [];
  for (const row of rows) {
    const section = getRowSection(row);
    if (section === 'header') header.push(row);
    else if (section === 'footer') footer.push(row);
    else body.push(row);
  }
  return { header, body, footer };
};

const mapRowsToSection = (
  context: RenderContext,
  rows: Node[],
  keyPrefix: string,
  keyPart: string,
  section: TableSection,
): React.ReactNode[] =>
  rows.map((row, i) => {
    const rowContext = {
      ...context,
      node: row,
      keyPrefix: `${keyPrefix}-${keyPart}-${i}`,
      loopVariables: context.loopVariables,
      setLists: context.setLists,
    };
    return rowNodeToReactInSection(rowContext, section);
  });

const buildSectionElements = (
  context: RenderContext,
  keyPrefix: string,
  grouped: { header: Node[]; body: Node[]; footer: Node[] },
): React.ReactNode[] => {
  const sectionElements: React.ReactNode[] = [];
  if (grouped.header.length > 0) {
    const headerContent = mapRowsToSection(context, grouped.header, keyPrefix, 'h', 'header');
    sectionElements.push(React.createElement('thead', { key: `${keyPrefix}-thead` }, headerContent));
  }
  if (grouped.body.length > 0 || sectionElements.length > 0) {
    const bodyContent = mapRowsToSection(context, grouped.body, keyPrefix, 'b', 'body');
    sectionElements.push(React.createElement('tbody', { key: `${keyPrefix}-tbody` }, bodyContent));
  }
  if (grouped.footer.length > 0) {
    const footerContent = mapRowsToSection(context, grouped.footer, keyPrefix, 'f', 'footer');
    sectionElements.push(React.createElement('tfoot', { key: `${keyPrefix}-tfoot` }, footerContent));
  }
  return sectionElements;
};

export const tableNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);
  const rows = node.children.filter((child) => child.type === 'row');
  const grouped = groupRowsBySection(rows);
  const sectionElements = buildSectionElements(context, keyPrefix, grouped);
  return React.createElement(
    'table',
    { key: keyPrefix, style: style as React.CSSProperties | undefined },
    sectionElements,
  );
};

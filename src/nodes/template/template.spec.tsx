import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { validate, parse, render as renderPtml } from '../../index';
import {
  buildTemplateMap,
  parseTemplateParameters,
  parseTemplateArguments,
  bindTemplateArguments,
} from '../../templates/templateOperations';
import {
  basicTemplate,
  templateWithSimpleParam,
  templateWithObjectParam,
  templateWithDynamicName,
  templateInEachLoop,
  templateWithNestedPropertyAccess,
  templateWithMultipleParams,
  templateParameterNestedPropertyInText,
  templateParameterNestedPropertyInIfCondition,
  templateParameterNestedPropertyInIfConditionEmpty,
} from './template.example';

describe('Template Node', () => {
  describe('Validation', () => {
    it('validates basicTemplate', () => {
      const result = validate(basicTemplate);
      expect(result.isValid).toBe(true);
    });

    it('validates templateWithSimpleParam', () => {
      const result = validate(templateWithSimpleParam);
      expect(result.isValid).toBe(true);
    });

    it('validates templateWithObjectParam', () => {
      const result = validate(templateWithObjectParam);
      expect(result.isValid).toBe(true);
    });

    it('validates templateWithDynamicName', () => {
      const result = validate(templateWithDynamicName);
      expect(result.isValid).toBe(true);
    });

    it('validates templateInEachLoop', () => {
      const result = validate(templateInEachLoop);
      expect(result.isValid).toBe(true);
    });

    it('validates templateWithNestedPropertyAccess', () => {
      const result = validate(templateWithNestedPropertyAccess);
      expect(result.isValid).toBe(true);
    });

    it('validates template parameter with nested property in text node', () => {
      const result = validate(templateParameterNestedPropertyInText);
      expect(result.isValid).toBe(true);
    });

    it('validates template parameter with nested property in if condition', () => {
      const result = validate(templateParameterNestedPropertyInIfCondition);
      expect(result.isValid).toBe(true);
    });

    it('validates template parameter with nested property in if condition with is empty', () => {
      const result = validate(templateParameterNestedPropertyInIfConditionEmpty);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Parsing', () => {
    it('parses template nodes correctly', () => {
      const nodes = parse(basicTemplate);
      const templateNodes = nodes.filter((n) => n.type === 'template');
      expect(templateNodes.length).toBe(2);
      expect(templateNodes[0].data).toBe('home');
      expect(templateNodes[1].data).toBe('shop');
    });

    it('parses template with parameters', () => {
      const nodes = parse(templateWithSimpleParam);
      const templateNode = nodes.find((n) => n.type === 'template');
      expect(templateNode).toBeDefined();
      expect(templateNode?.data).toBe('greeting name');
    });
  });

  describe('Template Map Building', () => {
    it('builds template map from nodes', () => {
      const nodes = parse(basicTemplate);
      const templateMap = buildTemplateMap(nodes);
      expect(templateMap.home).toBeDefined();
      expect(templateMap.shop).toBeDefined();
      expect(templateMap.home?.type).toBe('template');
      expect(templateMap.shop?.type).toBe('template');
    });

    it('extracts template names correctly', () => {
      const nodes = parse(templateWithSimpleParam);
      const templateMap = buildTemplateMap(nodes);
      expect(templateMap.greeting).toBeDefined();
      expect(templateMap.greeting?.data).toBe('greeting name');
    });
  });

  describe('Parameter Parsing', () => {
    it('parses template parameters', () => {
      const nodes = parse(templateWithSimpleParam);
      const templateNode = nodes.find((n) => n.type === 'template');
      expect(templateNode).toBeDefined();
      const parameters = parseTemplateParameters(templateNode!);
      expect(parameters).toEqual(['name']);
    });

    it('parses multiple template parameters', () => {
      const nodes = parse(templateWithMultipleParams);
      const templateNode = nodes.find((n) => n.type === 'template');
      expect(templateNode).toBeDefined();
      const parameters = parseTemplateParameters(templateNode!);
      expect(parameters).toEqual(['name', 'age']);
    });

    it('parses template arguments', () => {
      const nodes = parse(templateWithSimpleParam);
      const ptmlNode = nodes.find((n) => n.type === 'ptml');
      expect(ptmlNode).toBeDefined();
      const showNode = ptmlNode?.children.find((n) => n.type === 'show');
      expect(showNode).toBeDefined();
      const arguments_ = parseTemplateArguments(showNode!);
      expect(arguments_).toEqual(['John']);
    });
  });

  describe('Argument Binding', () => {
    it('binds literal arguments to parameters', () => {
      const state = {};
      const bound = bindTemplateArguments(['name'], ['John'], state);
      expect(bound.name).toBe('John');
    });

    it('binds variable arguments to parameters', () => {
      const state = { userName: 'Alice' };
      const bound = bindTemplateArguments(['name'], ['$userName'], state);
      expect(bound.name).toBe('Alice');
    });

    it('binds object arguments to parameters', () => {
      const state = {};
      const lists = {
        contacts: [
          { id: 1, name: 'John', email: 'john@example.com' },
          { id: 2, name: 'Jane', email: 'jane@example.com' },
        ],
      };
      const bound = bindTemplateArguments(['contact'], ['$contacts'], state, undefined, lists);
      expect(bound.contact).toEqual({ id: 1, name: 'John', email: 'john@example.com' });
    });
  });

  describe('Rendering with is not empty in template', () => {
    it('renders templateWithNestedPropertyAccess with Note only for contact that has notes', () => {
      const node = renderPtml(templateWithNestedPropertyAccess);
      const { container } = render(<div>{node}</div>);

      expect(container.textContent).toContain('Note: Important client');
      const noteCount = (container.textContent?.match(/Note: Important client/g) ?? []).length;
      expect(noteCount).toBe(1);
    });
  });
});

import React from 'react';

import { getNodeStyles } from '../../renderers/helpers';
import { resolveVariable } from '../../state/state';
import type { RenderContext } from '../../renderers/types';

const updateFormField = (
  fieldId: string,
  value: string,
  setState: (updater: (prevState: RenderContext['state']) => RenderContext['state']) => void,
): void => {
  setState((prevState) => {
    const newState = { ...prevState };
    if (!newState.form || typeof newState.form !== 'object' || Array.isArray(newState.form)) {
      newState.form = {};
    }
    const formObj = newState.form as Record<string, string>;
    newState.form = { ...formObj, [fieldId]: value };
    return newState;
  });
};

const updateStateVariable = (
  stateVariableName: string,
  value: string,
  setState: (updater: (prevState: RenderContext['state']) => RenderContext['state']) => void,
): void => {
  setState((prevState) => {
    const newState = { ...prevState };
    newState[stateVariableName] = value;
    return newState;
  });
};

const getCurrentValue = (
  defaultValue: string,
  id: string,
  state: RenderContext['state'],
  loopVariables?: RenderContext['loopVariables'],
): string => {
  if (defaultValue) {
    if (defaultValue.startsWith('$')) {
      const resolvedValue = resolveVariable(defaultValue.slice(1), state, loopVariables);
      return resolvedValue || '';
    }
    return defaultValue;
  }
  if (state.form && typeof state.form === 'object' && !Array.isArray(state.form) && id in state.form) {
    const formObj = state.form as Record<string, string>;
    const formValue = formObj[id];
    return typeof formValue === 'string' ? formValue : String(formValue || '');
  }
  return '';
};

const createOnChangeHandler = (
  defaultValue: string,
  id: string,
  setState?: (updater: (prevState: RenderContext['state']) => RenderContext['state']) => void,
): ((e: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined => {
  if (!setState) {
    return undefined;
  }
  if (defaultValue && defaultValue.startsWith('$')) {
    const stateVariableName = defaultValue.slice(1);
    return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateStateVariable(stateVariableName, e.target.value, setState);
    };
  }
  if (id) {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateFormField(id, e.target.value, setState);
    };
  }
  return undefined;
};

export const textareaNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, setState, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);

  const idNode = node.children.find((child) => child.type === 'id');
  const id = idNode?.data?.trim() || '';

  const valueNode = node.children.find((child) => child.type === 'value');
  const defaultValue = valueNode?.data?.trim() || '';

  const currentValue = getCurrentValue(defaultValue, id, state, loopVariables);
  const onChange = createOnChangeHandler(defaultValue, id, setState);

  return React.createElement(
    'textarea',
    {
      key: keyPrefix,
      id,
      style: style as React.CSSProperties | undefined,
      value: currentValue,
      onChange,
    },
    null,
  );
};

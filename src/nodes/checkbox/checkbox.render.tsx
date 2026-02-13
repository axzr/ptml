import React from 'react';

import { getNodeStyles } from '../../renderers/helpers';
import { resolveVariable } from '../../state/state';
import type { RenderContext } from '../../renderers/types';

const updateFormCheckboxField = (
  fieldId: string,
  checked: boolean,
  setState: (updater: (prevState: RenderContext['state']) => RenderContext['state']) => void,
): void => {
  setState((prevState) => {
    const newState = { ...prevState };
    if (!newState.form || typeof newState.form !== 'object' || Array.isArray(newState.form)) {
      newState.form = {};
    }
    const formObj = newState.form as Record<string, string>;
    newState.form = { ...formObj, [fieldId]: checked ? 'true' : 'false' };
    return newState;
  });
};

const updateStateCheckboxVariable = (
  stateVariableName: string,
  checked: boolean,
  setState: (updater: (prevState: RenderContext['state']) => RenderContext['state']) => void,
): void => {
  setState((prevState) => {
    const newState = { ...prevState };
    newState[stateVariableName] = checked;
    return newState;
  });
};

const getCheckedState = (
  valueData: string,
  id: string,
  state: RenderContext['state'],
  loopVariables?: RenderContext['loopVariables'],
): boolean => {
  if (valueData) {
    if (valueData.startsWith('$')) {
      const resolvedValue = resolveVariable(valueData.slice(1), state, loopVariables);
      return resolvedValue === 'true';
    }
    return valueData === 'true';
  }
  if (state.form && typeof state.form === 'object' && !Array.isArray(state.form) && id in state.form) {
    const formObj = state.form as Record<string, string>;
    const formValue = formObj[id];
    return formValue === 'true';
  }
  return false;
};

const createCheckboxOnChangeHandler = (
  valueData: string,
  id: string,
  setState?: (updater: (prevState: RenderContext['state']) => RenderContext['state']) => void,
): ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined => {
  if (!setState) {
    return undefined;
  }
  if (valueData && valueData.startsWith('$')) {
    const stateVariableName = valueData.slice(1);
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStateCheckboxVariable(stateVariableName, e.target.checked, setState);
    };
  }
  if (id) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFormCheckboxField(id, e.target.checked, setState);
    };
  }
  return undefined;
};

export const checkboxNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, setState, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);

  const idNode = node.children.find((child) => child.type === 'id');
  const id = idNode?.data?.trim() || '';

  const valueNode = node.children.find((child) => child.type === 'value');
  const valueData = valueNode?.data?.trim() || '';

  const checked = getCheckedState(valueData, id, state, loopVariables);
  const onChange = createCheckboxOnChangeHandler(valueData, id, setState);

  return React.createElement(
    'input',
    {
      key: keyPrefix,
      id,
      type: 'checkbox',
      checked,
      onChange,
      style: style as React.CSSProperties | undefined,
    },
    null,
  );
};

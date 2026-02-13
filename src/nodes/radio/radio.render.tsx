import React from 'react';

import { getNodeStyles } from '../../renderers/helpers';
import { resolveVariable } from '../../state/state';
import type { RenderContext } from '../../renderers/types';

const updateFormRadioField = (
  groupName: string,
  selectedValue: string,
  setState: (updater: (prevState: RenderContext['state']) => RenderContext['state']) => void,
): void => {
  setState((prevState) => {
    const newState = { ...prevState };
    if (!newState.form || typeof newState.form !== 'object' || Array.isArray(newState.form)) {
      newState.form = {};
    }
    const formObj = newState.form as Record<string, string>;
    newState.form = { ...formObj, [groupName]: selectedValue };
    return newState;
  });
};

const updateStateRadioVariable = (
  stateVariableName: string,
  selectedValue: string,
  setState: (updater: (prevState: RenderContext['state']) => RenderContext['state']) => void,
): void => {
  setState((prevState) => {
    const newState = { ...prevState };
    newState[stateVariableName] = selectedValue;
    return newState;
  });
};

const getCheckedState = (
  groupName: string,
  optionValue: string,
  selectedData: string,
  state: RenderContext['state'],
  loopVariables?: RenderContext['loopVariables'],
): boolean => {
  if (selectedData && selectedData.startsWith('$')) {
    const resolvedValue = resolveVariable(selectedData.slice(1), state, loopVariables);
    const resolvedStr = resolvedValue !== undefined ? String(resolvedValue) : undefined;
    return resolvedStr === optionValue;
  }
  if (state.form && typeof state.form === 'object' && !Array.isArray(state.form) && groupName in state.form) {
    const formObj = state.form as Record<string, string>;
    const formValue = formObj[groupName];
    return formValue === optionValue;
  }
  return false;
};

const createRadioOnChangeHandler = (
  groupName: string,
  optionValue: string,
  selectedData: string,
  setState?: (updater: (prevState: RenderContext['state']) => RenderContext['state']) => void,
): ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined => {
  if (!setState) {
    return undefined;
  }
  if (selectedData && selectedData.startsWith('$')) {
    const stateVariableName = selectedData.slice(1);
    return () => {
      updateStateRadioVariable(stateVariableName, optionValue, setState);
    };
  }
  if (groupName) {
    return () => {
      updateFormRadioField(groupName, optionValue, setState);
    };
  }
  return undefined;
};

export const radioNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, setState, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);

  const nameNode = node.children.find((child) => child.type === 'name');
  const groupName = nameNode?.data?.trim() || '';

  const valueNode = node.children.find((child) => child.type === 'value');
  const optionValue = valueNode?.data?.trim() || '';

  const idNode = node.children.find((child) => child.type === 'id');
  const id = idNode?.data?.trim() || '';

  const selectedNode = node.children.find((child) => child.type === 'selected');
  const selectedData = selectedNode?.data?.trim() || '';

  const checked = getCheckedState(groupName, optionValue, selectedData, state, loopVariables);
  const onChange = createRadioOnChangeHandler(groupName, optionValue, selectedData, setState);

  return React.createElement(
    'input',
    {
      key: keyPrefix,
      id: id || undefined,
      name: groupName,
      type: 'radio',
      value: optionValue,
      checked,
      onChange,
      style: style as React.CSSProperties | undefined,
    },
    null,
  );
};

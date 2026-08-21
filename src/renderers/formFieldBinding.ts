import { resolveVariable } from '../state/state';
import type { RenderContext } from './types';
import type { StateMap, LoopVariablesMap } from '../state/state';

type SetState = (updater: (prevState: StateMap) => StateMap) => void;

// A field binds one of two ways: an id writes to form.<id>, or a $-bound value
// writes to that state variable. Shared by input, textarea and select, which
// differ only in the element they render. checkbox keeps its own copy because
// it stores a checked flag rather than a value.
export const updateFormField = (fieldId: string, value: string, setState: SetState): void => {
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

export const updateStateVariable = (stateVariableName: string, value: string, setState: SetState): void => {
  setState((prevState) => ({ ...prevState, [stateVariableName]: value }));
};

export const getFieldValue = (
  defaultValue: string,
  id: string,
  state: RenderContext['state'],
  loopVariables?: LoopVariablesMap,
): string => {
  if (defaultValue) {
    if (defaultValue.startsWith('$')) {
      return resolveVariable(defaultValue.slice(1), state, loopVariables) || '';
    }
    return defaultValue;
  }
  if (state.form && typeof state.form === 'object' && !Array.isArray(state.form) && id in state.form) {
    const formValue = (state.form as Record<string, string>)[id];
    return typeof formValue === 'string' ? formValue : String(formValue || '');
  }
  return '';
};

type ValueChangeEvent = { target: { value: string } };

export const createFieldChangeHandler = (
  defaultValue: string,
  id: string,
  setState?: SetState,
): ((event: ValueChangeEvent) => void) | undefined => {
  if (!setState) {
    return undefined;
  }
  if (defaultValue.startsWith('$')) {
    const stateVariableName = defaultValue.slice(1);
    return (event: ValueChangeEvent) => updateStateVariable(stateVariableName, event.target.value, setState);
  }
  if (id) {
    return (event: ValueChangeEvent) => updateFormField(id, event.target.value, setState);
  }
  return undefined;
};

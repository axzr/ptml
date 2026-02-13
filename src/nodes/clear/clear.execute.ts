import type { Node, ExecutionContext } from '../../types';
import type { StateMap } from '../../state/state';

export const executeClearOperation = (child: Node, context: ExecutionContext): void => {
  const { setState } = context;

  if (!child.data || !setState) {
    return;
  }

  const variableName = child.data.trim();
  const stateKey = variableName.startsWith('$') ? variableName.slice(1) : variableName;

  setState((prevState: StateMap) => {
    const newState = { ...prevState };
    newState[stateKey] = '';
    return newState;
  });
};

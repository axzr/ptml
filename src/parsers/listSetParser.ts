export const parseListSetData = (
  data: string | undefined,
): { listName: string | null; index: string | null; valueExpression: string | null } => {
  if (!data) {
    return { listName: null, index: null, valueExpression: null };
  }

  const trimmed = data.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length < 3) {
    return { listName: null, index: null, valueExpression: null };
  }

  const listName = parts[0];
  const index = parts[1];
  const valueExpression = parts.slice(2).join(' ');

  return { listName, index, valueExpression };
};

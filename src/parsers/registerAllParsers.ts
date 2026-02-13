import { registerNodeParser, hasNodeParser } from './nodeParserRegistry';
import { getSchemaMap } from '../schemaRegistry/schemaMap';
import { parseValueList } from '../nodes/valueList/valueList.parser';
import { parseRecordList } from '../nodes/recordList/recordList.parser';
import { parseState } from '../nodes/state/state.parser';
import { getDefaultParserForCategory } from './parserUtils';

let allParsersRegistered = false;

export const registerAllParsers = (): void => {
  if (allParsersRegistered) {
    return;
  }

  registerNodeParser('valueList', parseValueList);
  registerNodeParser('recordList', parseRecordList);
  registerNodeParser('state', parseState);

  const schemaMap = getSchemaMap();

  schemaMap.forEach((schema) => {
    const nodeType = schema.name;
    const category = schema.category;

    if (hasNodeParser(nodeType)) {
      return;
    }

    const defaultParser = getDefaultParserForCategory(category);
    registerNodeParser(nodeType, defaultParser);
  });

  allParsersRegistered = true;
};

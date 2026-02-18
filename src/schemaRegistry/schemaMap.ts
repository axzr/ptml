import type { BlockDefinition, NodeSchema } from '../schemas/types';
import { boxSchema } from '../nodes/box/box.schema';
import { breakpointSchema } from '../nodes/breakpoint/breakpoint.schema';
import { breakpointsSchema } from '../nodes/breakpoints/breakpoints.schema';
import { buttonSchema } from '../nodes/button/button.schema';
import { callSchema } from '../nodes/call/call.schema';
import { clearSchema } from '../nodes/clear/clear.schema';
import { clickSchema } from '../nodes/click/click.schema';
import { compileSchema } from '../nodes/compile/compile.schema';
import { cssPropertySchema } from '../nodes/css-property/css-property.schema';
import { debugSchema } from '../nodes/debug/debug.schema';
import { defineSchema } from '../nodes/define/define.schema';
import { eachSchema } from '../nodes/each/each.schema';
import { elseSchema } from '../nodes/else/else.schema';
import { formSchema } from '../nodes/form/form.schema';
import { functionSchema } from '../nodes/function/function.schema';
import { headerSchema } from '../nodes/header/header.schema';
import { ifSchema } from '../nodes/if/if.schema';
import { importSchema } from '../nodes/import/import.schema';
import { initSchema } from '../nodes/init/init.schema';
import { inputSchema } from '../nodes/input/input.schema';
import { checkboxSchema } from '../nodes/checkbox/checkbox.schema';
import { radioSchema } from '../nodes/radio/radio.schema';
import { labelSchema } from '../nodes/label/label.schema';
import { imageSchema } from '../nodes/image/image.schema';
import { linkSchema } from '../nodes/link/link.schema';
import { listSchema } from '../nodes/list/list.schema';
import { listItemSchema } from '../nodes/listItem/listItem.schema';
import { roleSchema } from '../nodes/role/role.schema';
import { rowSchema } from '../nodes/row/row.schema';
import { tableSchema } from '../nodes/table/table.schema';
import { cellSchema } from '../nodes/cell/cell.schema';
import { keyValueSchema } from '../nodes/key-value/key-value.schema';
import { valueListSchema } from '../nodes/valueList/valueList.schema';
import { recordListSchema } from '../nodes/recordList/recordList.schema';
import { addValueSchema } from '../nodes/addValue/addValue.schema';
import { addRecordSchema } from '../nodes/addRecord/addRecord.schema';
import { removeValueSchema } from '../nodes/removeValue/removeValue.schema';
import { removeRecordSchema } from '../nodes/removeRecord/removeRecord.schema';
import { updateValueSchema } from '../nodes/updateValue/updateValue.schema';
import { updateRecordSchema } from '../nodes/updateRecord/updateRecord.schema';
import { setValueSchema } from '../nodes/setValue/setValue.schema';
import { setRecordSchema } from '../nodes/setRecord/setRecord.schema';
import { getValueSchema } from '../nodes/getValue/getValue.schema';
import { getRecordSchema } from '../nodes/getRecord/getRecord.schema';
import { rangeSchema } from '../nodes/range/range.schema';
import { recordSchema } from '../nodes/record/record.schema';
import { setSchema } from '../nodes/set/set.schema';
import { stateArraySchema } from '../nodes/state-array/state-array.schema';
import { stateObjectSchema } from '../nodes/state-object/state-object.schema';
import { stateSchema } from '../nodes/state/state.schema';
import { stylesSchema } from '../nodes/styles/styles.schema';
import { textSchema } from '../nodes/text/text.schema';
import { textareaSchema } from '../nodes/textarea/textarea.schema';
import { selectSchema } from '../nodes/select/select.schema';
import { optionSchema } from '../nodes/option/option.schema';
import { templateSchema } from '../nodes/template/template.schema';
import { showSchema } from '../nodes/show/show.schema';
import { valueSchema } from '../nodes/value/value.schema';
import { whereSchema } from '../nodes/where/where.schema';
import { windowSchema } from '../nodes/window/window.schema';

import { ptmlSchema } from '../nodes/ptml/ptml.schema';

const nodeSchemas: NodeSchema[] = [
  boxSchema,
  breakpointSchema,
  breakpointsSchema,
  buttonSchema,
  callSchema,
  clearSchema,
  clickSchema,
  compileSchema,
  cssPropertySchema,
  debugSchema,
  defineSchema,
  eachSchema,
  elseSchema,
  formSchema,
  functionSchema,
  headerSchema,
  ifSchema,
  importSchema,
  initSchema,
  inputSchema,
  checkboxSchema,
  radioSchema,
  labelSchema,
  imageSchema,
  linkSchema,
  listSchema,
  listItemSchema,
  roleSchema,
  rowSchema,
  tableSchema,
  cellSchema,
  keyValueSchema,
  valueListSchema,
  recordListSchema,
  addValueSchema,
  addRecordSchema,
  removeValueSchema,
  removeRecordSchema,
  updateValueSchema,
  updateRecordSchema,
  setValueSchema,
  setRecordSchema,
  getValueSchema,
  getRecordSchema,
  rangeSchema,
  recordSchema,
  setSchema,
  stateArraySchema,
  stateObjectSchema,
  stateSchema,
  stylesSchema,
  textSchema,
  textareaSchema,
  selectSchema,
  optionSchema,
  templateSchema,
  showSchema,
  valueSchema,
  whereSchema,
  windowSchema,
  ptmlSchema,
];

const schemaMap = new Map<string, NodeSchema>(nodeSchemas.map((s) => [s.name, s]));

export const getContainerChildren = (): BlockDefinition[] =>
  Array.from(schemaMap.entries())
    .filter(([, s]) => s.allowedAsContainerChild === true)
    .map(([name]) => ({ name }));

export const getBlocksList = (schema: NodeSchema): BlockDefinition[] =>
  schema.blocks?.isContainerParent === true ? getContainerChildren() : (schema.blocks?.list ?? []);

export const getSchemaMap = (): Map<string, NodeSchema> => schemaMap;
export const allSchemas = Array.from(schemaMap.values()).filter((s) => !s.childType);

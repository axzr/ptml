import type { DataTypeSchema } from './types';
import { boxRoleSchema } from './boxRole/boxRole.schema';
import { breakpointReferenceSchema } from './breakpointReference/breakpointReference.schema';
import { rowRoleSchema } from './rowRole/rowRole.schema';
import { headingLevelSchema } from './headingLevel/headingLevel.schema';
import { styleNameSchema } from './styleName/styleName.schema';
import { listNameSchema } from './listName/listName.schema';
import { functionNameSchema } from './functionName/functionName.schema';
import { parameterNameSchema } from './parameterName/parameterName.schema';
import { variableNameSchema } from './variableName/variableName.schema';
import { rangeBindingSchema } from './rangeBinding/rangeBinding.schema';
import { listNameWithOptionalBindingSchema } from './listNameWithOptionalBinding/listNameWithOptionalBinding.schema';
import { indexBindingSchema } from './indexBinding/indexBinding.schema';
import { variableBindingSchema } from './variableBinding/variableBinding.schema';
import { pipeExpressionSchema } from './pipeExpression/pipeExpression.schema';
import { valueExpressionSchema } from './valueExpression/valueExpression.schema';
import { indexExpressionSchema } from './indexExpression/indexExpression.schema';
import { variableReferenceSchema } from './variableReference/variableReference.schema';
import { templateReferenceSchema } from './templateReference/templateReference.schema';
import { resolvesToFunctionNameSchema } from './resolvesToFunctionName/resolvesToFunctionName.schema';
import { listNameReferenceSchema } from './listNameReference/listNameReference.schema';
import { ifConditionSchema } from './ifCondition/ifCondition.schema';
import { whereConditionSchema } from './whereCondition/whereCondition.schema';
import { importFilenameSchema } from './importFilename/importFilename.schema';

const dataTypeSchemas: DataTypeSchema[] = [
  boxRoleSchema,
  breakpointReferenceSchema,
  rowRoleSchema,
  headingLevelSchema,
  styleNameSchema,
  listNameSchema,
  functionNameSchema,
  parameterNameSchema,
  variableNameSchema,
  rangeBindingSchema,
  listNameWithOptionalBindingSchema,
  indexBindingSchema,
  variableBindingSchema,
  pipeExpressionSchema,
  valueExpressionSchema,
  indexExpressionSchema,
  variableReferenceSchema,
  templateReferenceSchema,
  resolvesToFunctionNameSchema,
  listNameReferenceSchema,
  ifConditionSchema,
  whereConditionSchema,
  importFilenameSchema,
];

const dataTypeMap = new Map<string, DataTypeSchema>(dataTypeSchemas.map((s) => [s.name, s]));

export const getDataTypeMap = (): Map<string, DataTypeSchema> => dataTypeMap;

export const getDataTypeSchema = (name: string): DataTypeSchema | undefined => dataTypeMap.get(name);

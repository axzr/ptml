export const ParserErrors = {
  unknownNodeType: (type: string) => `Unknown node type: ${type}`,
  unmatchedDeclaration: (content: string) => `Unmatched node type in declaration: ${content}`,
  rootMustBeDeclaration: (type: string) => `Root nodes must be declaration nodes. Found ${type}`,
  rootNodeHasPrefix: (lineNumber: number) => `Root nodes must be declarations without prefixes on line ${lineNumber}`,
  unknownCategory: (category: string) => `Unknown category: ${category}`,
  invalidFormat: (category: string, content: string) =>
    `Invalid ${category} format: "${content}". ${category.charAt(0).toUpperCase() + category.slice(1)} nodes must match format: "type" or "type: data"`,
  valueListDeclarationExpected: (lineNumber: number) => `Expected valueList declaration on line ${lineNumber}`,
  recordListDeclarationExpected: (lineNumber: number) => `Expected recordList declaration on line ${lineNumber}`,
  valueItemPrefixExpected: (lineNumber: number) => `Expected value item to start with "- " on line ${lineNumber}`,
};

export const ValidationErrors = {
  unknownNodeType: (category: string, type: string, lineNumber: number) =>
    `Unknown ${category} node type: ${type} on line ${lineNumber}`,
  notBlockNode: (type: string, lineNumber: number) => `Node type ${type} on line ${lineNumber} is not a block node`,
  notPropertyNode: (type: string, lineNumber: number) =>
    `Node type ${type} on line ${lineNumber} is not a property node`,
  notConditionalNode: (type: string, lineNumber: number) =>
    `Node type ${type} on line ${lineNumber} is not a conditional node`,
  notActionNode: (type: string, lineNumber: number) => `Node type ${type} on line ${lineNumber} is not an action node`,
  notDeclarationNode: (type: string, lineNumber: number) =>
    `Node type ${type} on line ${lineNumber} is not a declaration node`,
  unknownCategory: (category: string, type: string, lineNumber: number) =>
    `Unknown node category: ${category} for node ${type} on line ${lineNumber}`,
};

export const HierarchyErrors = {
  propertyCannotContain: (category: string, childType: string, lineNumber: number) =>
    `Property node cannot contain ${category} nodes. Found: ${childType} (category: ${category}) on line ${lineNumber}`,
  propertyCannotContainDescendants: (category: string, childType: string, lineNumber: number) =>
    `Property node cannot contain ${category} nodes as descendants. Found: ${childType} (category: ${category}) on line ${lineNumber}`,
  blockCannotContain: (category: string, childType: string, lineNumber: number) =>
    `Block node cannot contain ${category} nodes. Found: ${childType} (category: ${category}) on line ${lineNumber}`,
  conditionalInBlockCannotContain: (category: string, childType: string, lineNumber: number) =>
    `Conditional node in block context cannot contain ${category} nodes. Found: ${childType} (category: ${category}) on line ${lineNumber}`,
  conditionalInPropertyCannotContain: (category: string, childType: string, lineNumber: number) =>
    `Conditional node in property context cannot contain ${category} nodes. Found: ${childType} (category: ${category}) on line ${lineNumber}`,
  defineCannotContain: (category: string, childType: string, lineNumber: number) =>
    `Define node cannot contain ${category} nodes. Found: ${childType} (category: ${category}) on line ${lineNumber}`,
  actionCanOnlyContain: (childType: string, category: string, lineNumber: number) =>
    `Action node can only contain actions and properties. Found: ${childType} (category: ${category}) on line ${lineNumber}`,
};

export const ActionErrors = {
  requiresFunctionalContext: (nodeType: string, lineNumber: number) =>
    `${nodeType} node on line ${lineNumber} must appear inside a functional context (e.g. click or init).`,
};

export const DataFormatErrors = {
  missingRequiredPart: (nodeType: string, lineNumber: number, partName: string, description?: string) =>
    `${nodeType} node on line ${lineNumber} must have ${partName}. ${description || ''}`,
  dataNotAllowed: (nodeType: string, lineNumber: number) =>
    `${nodeType} node on line ${lineNumber} has data, but should not have data`,
  maxPartsExceeded: (nodeType: string, lineNumber: number, maxParts: number, foundParts: number) =>
    `${nodeType} node on line ${lineNumber} must have at most ${maxParts} data part(s). Found: ${foundParts}`,
  duplicateParts: (nodeType: string, lineNumber: number, partName: string, duplicates: string) =>
    `${nodeType} node on line ${lineNumber} has duplicate ${partName}: ${duplicates}. Each ${partName} must be unique.`,
  constraintViolation: (nodeType: string, lineNumber: number, description: string) =>
    `${nodeType} node on line ${lineNumber} violates constraint: ${description}`,
  invalidImportFilename: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must use a simple filename without path. Found: "${found}". Use e.g. templates.ptml or my-styles.ptml.`,
};

export const ChildrenErrors = {
  duplicateChildType: (
    nodeType: string,
    nodeLine: number,
    childType: string,
    childLine: number,
    firstOccurrence: number,
  ) =>
    `${nodeType} node on line ${nodeLine} has duplicate child type "${childType}" on line ${childLine}. This node does not allow repeated child types. First occurrence was on line ${firstOccurrence}.`,
  cannotHaveChildren: (nodeType: string, lineNumber: number, foundTypes: string[]) =>
    `${nodeType} node on line ${lineNumber} cannot have children. Found: ${foundTypes.join(', ')}`,
  emptyChildType: (nodeType: string, nodeLine: number, childLine: number) =>
    `${nodeType} node on line ${nodeLine} has a child on line ${childLine} with an empty or missing type. Each child must have a non-empty type.`,
  minimumChildrenRequired: (nodeType: string, lineNumber: number, requiredTypes: string[]) =>
    `${nodeType} node on line ${lineNumber} must have at least one child. Required child types: ${requiredTypes.join(', ')}.`,
  wrongChildTypeInStyles: (nodeType: string, lineNumber: number, childType: string) =>
    `${nodeType} node inside styles on line ${lineNumber} can only have children: CSS properties, if, else. Found: ${childType}`,
  elseWithoutIf: (lineNumber: number) =>
    `else node on line ${lineNumber} must have a preceding sibling if node. An else node without a preceding if node is invalid.`,
  wrongChildType: (nodeType: string, lineNumber: number, childType: string, allowedChildren: string) =>
    `${nodeType} node on line ${lineNumber} can only have children: ${allowedChildren}. Found: ${childType}`,
  tooManyChildren: (nodeType: string, lineNumber: number, childType: string, max: number, found: number) =>
    `${nodeType} node on line ${lineNumber} has too many ${childType} children. Maximum allowed: ${max}, found: ${found}.`,
};

export const VariableErrors = {
  undefinedVariable: (nodeType: string, lineNumber: number, varName: string) =>
    `${nodeType} node on line ${lineNumber} references undefined variable $${varName}. Ensure the variable is defined in state, available in the current loop context, is a list name, is a function parameter, or is a template parameter.`,
  undefinedStateVariable: (nodeType: string, lineNumber: number, varRef: string) =>
    `${nodeType} node on line ${lineNumber} references undefined state variable $${varRef}`,
  undefinedVariableInExpression: (nodeType: string, lineNumber: number, varRef: string) =>
    `${nodeType} node on line ${lineNumber} references undefined variable $${varRef} in expression. Ensure the variable is defined in state, available in the current loop context, is a list name, is a function parameter, or is a template parameter.`,
  loopVariableOutsideContext: (nodeType: string, lineNumber: number, varRef: string) =>
    `${nodeType} node on line ${lineNumber} references loop variable $${varRef} outside of loop context. Loop variables can only be used inside their defining loop or in root-level named styles that will be used within loops.`,
  variableNameMustStartWithDollar: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must use a variable name starting with $ (found: ${found})`,
  variableReferenceMustStartWithDollar: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must use a variable reference starting with $ (found: ${found})`,
  variableBindingConflict: (nodeType: string, lineNumber: number, varName: string) =>
    `${nodeType} node on line ${lineNumber} uses variable name $${varName} which conflicts with existing state variable $${varName}. Use a different variable name.`,
  loopVariableConflict: (nodeType: string, lineNumber: number, varName: string) =>
    `${nodeType} node on line ${lineNumber} uses loop variable $${varName} which conflicts with existing state variable $${varName}. Use a different loop variable name.`,
  listRemoveShouldUseLoopVariable: (nodeType: string, lineNumber: number, varName: string, availableLoopVars: string) =>
    `${nodeType} node on line ${lineNumber} uses state variable $${varName} but should use a loop variable (available: ${availableLoopVars}). Use the loop variable instead of a state variable when inside an each loop.`,
};

export const ListErrors = {
  undefinedList: (nodeType: string, lineNumber: number, listName: string) =>
    `${nodeType} node on line ${lineNumber} references undefined list "${listName}". Ensure the list is defined before using it.`,
  invalidListName: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must have a valid list name (single word). Found: "${found}"`,
  emptyValueItem: (lineNumber: number) =>
    `ValueList value item on line ${lineNumber} must have data. Value items cannot be empty.`,
  invalidListItemType: (itemType: string, lineNumber: number) =>
    `List item on line ${lineNumber} has invalid type "${itemType}". ValueList items must be "value" (simple string). RecordList items must be "record" blocks.`,
  invalidListItemCategory: (category: string, itemType: string, lineNumber: number) =>
    `List item on line ${lineNumber} has invalid category "${category}" (type: "${itemType}"). ValueList items must be property nodes. RecordList items must be block nodes.`,
};

export const IndentationErrors = {
  incorrectIndentation: (nodeType: string, lineNumber: number, expectedIndent: number, actualIndent: number) =>
    `${nodeType} node on line ${lineNumber} has incorrect indentation: expected ${expectedIndent}, actual ${actualIndent}`,
  oddIndentation: (lineNumber: number, indent: number) =>
    `Line ${lineNumber} has odd indentation (${indent}), all nodes must have even indentation`,
  missingPrefix: (lineNumber: number) =>
    `Line ${lineNumber} has indentation but is not a child node (missing prefix: '> ', '- ', '? ', or '! ')`,
  rootNodeIndented: (lineNumber: number) =>
    `Invalid format: root nodes must start at column 0. Root node on line ${lineNumber} is indented.`,
};

export const RootNodeErrors = {
  multiplePTML: (count: number, lineNumbers: string) =>
    `PTML file can have at most one ptml declaration. Found ${count} declarations on lines: ${lineNumbers}`,
  emptyFile: () => `Empty file is invalid`,
  rootMustBeDeclaration: (category: string, type: string, lineNumber: number) =>
    `Root nodes must be declaration nodes. Found ${type} (category: ${category}) on line ${lineNumber}`,
};

export const ValidatorErrors = {
  rangeBindingFormat: (lineNumber: number) =>
    `range node on line ${lineNumber} must specify a state variable and index binding. Use format: range: <stateVariable> as $variable`,
  rangeVariableName: (lineNumber: number, variableName: string) =>
    `range node on line ${lineNumber} must use a variable name starting with $ (found: ${variableName}). Use format: range: <stateVariable> as $variable`,
  rangeInvalidSyntax: (lineNumber: number, variableName: string) =>
    `range node on line ${lineNumber} has invalid syntax in range specification. Use format: range: <stateVariable> as $variable. Found variable name with spaces: "${variableName}"`,
  listNameBindingVariableName: (nodeType: string, lineNumber: number, itemVariableName: string) =>
    `${nodeType} node on line ${lineNumber} must use a variable name starting with $ (found: ${itemVariableName})`,
  listNameBindingInvalidSyntax: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} has invalid syntax in list specification. Use format: <listName> [as $variable]. Found: "${found}"`,
  indexBindingVariableName: (nodeType: string, lineNumber: number, indexVariableName: string) =>
    `${nodeType} node on line ${lineNumber} must use a variable name starting with $ for index (found: ${indexVariableName})`,
  indexBindingInvalidSyntax: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} has invalid syntax in index specification. Use format: index as $variable. Found: "${found}"`,
  undefinedFunction: (nodeType: string, lineNumber: number, functionName: string) =>
    `${nodeType} node on line ${lineNumber} references undefined function "${functionName}". Ensure the function is defined before use.`,
  unknownPipeFunction: (
    nodeType: string,
    lineNumber: number,
    functionName: string,
    fullExpression: string,
    validFunctions: string,
  ) =>
    `${nodeType} node on line ${lineNumber} uses unknown pipe function "${functionName}" in expression "${fullExpression}". Valid pipe functions are: ${validFunctions}.`,
  functionNameStartsWithDollar: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} has a function name starting with $: "${found}". Function names cannot start with $. Use format: function: <name> [param1] [param2] ...`,
  parameterNameStartsWithDollar: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} has parameters starting with $: ${found}. Function parameters cannot start with $. Use format: function: <name> [param1] [param2] ...`,
  invalidIndex: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} has invalid index "${found}". Index must be a non-negative number or a variable reference starting with $.`,
  invalidVariableBinding: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} has invalid variable binding format. Use format: as $variableName. Found: "${found}"`,
  styleNameInvalid: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must have a single-word name. Found: "${found}"`,
  styleNameNotFound: (nodeType: string, lineNumber: number, styleName: string) =>
    `${nodeType} node on line ${lineNumber} references named style "${styleName}" which does not exist.`,
  ifConditionRequired: (nodeType: string, lineNumber: number) =>
    `${nodeType} node on line ${lineNumber} must have a condition. Use format: if: $variable or if: $variable is value`,
  ifConditionVariableName: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must use a variable name starting with $ when referencing a variable (found: ${found})`,
  ifConditionComparisonVariableName: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must use a variable name starting with $ in comparison expressions (found: ${found})`,
  whereConditionRequired: (nodeType: string, lineNumber: number) =>
    `${nodeType} node on line ${lineNumber} must have a condition. Use format: where: PROPERTYNAME is MATCHVALUE`,
  whereConditionPropertyName: (nodeType: string, lineNumber: number) =>
    `${nodeType} node on line ${lineNumber} must specify a property name. Use format: where: PROPERTYNAME is MATCHVALUE`,
  whereConditionMatchValue: (nodeType: string, lineNumber: number) =>
    `${nodeType} node on line ${lineNumber} must specify a match value. Use format: where: PROPERTYNAME is MATCHVALUE`,
  whereConditionInvalidFormat: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} has invalid condition format. Expected "PROPERTYNAME is MATCHVALUE". Found: "${found}"`,
  templateReferenceRequired: (nodeType: string, lineNumber: number) =>
    `${nodeType} node on line ${lineNumber} must specify a template name. Use format: show: <template-name> [arg1] [arg2] ...`,
  templateNotFound: (nodeType: string, lineNumber: number, templateName: string) =>
    `${nodeType} node on line ${lineNumber} references template "${templateName}" which does not exist.`,
  windowOperationInvalid: (lineNumber: number, found: string, supported: string) =>
    `window node on line ${lineNumber} has unknown operation "${found}". Supported: ${supported}`,
  headingLevelInvalid: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must have heading level h1, h2, h3, h4, h5, or h6. Found: "${found}"`,
  rowRoleInvalid: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must have role header, body, or footer. Found: "${found}"`,
  boxRoleInvalid: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must have role main, header, footer, article, section, nav, or aside. Found: "${found}"`,
  breakpointsChildWidthAscending: (
    nodeType: string,
    lineNumber: number,
    label: string,
    prevWidth: number,
    width: number,
  ) =>
    `${nodeType} node on line ${lineNumber}: breakpoint "${label}" has width ${width} but must be in ascending order (previous was ${prevWidth}).`,
  breakpointsLastMustHaveNoWidth: (nodeType: string, lineNumber: number, label: string) =>
    `${nodeType} node on line ${lineNumber}: last breakpoint "${label}" must not have a width.`,
  breakpointsChildWidthInvalid: (nodeType: string, lineNumber: number, label: string, found: string) =>
    `${nodeType} node on line ${lineNumber}: breakpoint "${label}" must have a non-negative integer width in pixels (no unit). Found: "${found}"`,
  breakpointReferenceInvalid: (nodeType: string, lineNumber: number, found: string) =>
    `${nodeType} node on line ${lineNumber} must have a breakpoint label or "label or more" or "label or less". Found: "${found}"`,
  breakpointNotFound: (nodeType: string, lineNumber: number, label: string) =>
    `${nodeType} node on line ${lineNumber} references breakpoint "${label}" which is not defined in a breakpoints declaration.`,
};

export const BreakpointsErrors = {
  stylesCannotContainBreakpoint: (lineNumber: number) =>
    `styles node on line ${lineNumber} cannot contain breakpoint. Use define and named styles for conditional styles.`,
  breakpointsCannotContain: (category: string, childType: string, lineNumber: number) =>
    `breakpoints node can only contain property children (label: width). Found: ${childType} (category: ${category}) on line ${lineNumber}`,
};

export const OperationErrors = {
  missingListName: (nodeType: string, lineNumber: number) => `${nodeType} on line ${lineNumber}: Missing list name`,
  listNotFound: (nodeType: string, lineNumber: number, listName: string) =>
    `${nodeType} on line ${lineNumber}: List "${listName}" not found`,
  notAList: (nodeType: string, lineNumber: number, listName: string) =>
    `${nodeType} on line ${lineNumber}: "${listName}" is not a list`,
  missingWhereChild: (nodeType: string, lineNumber: number) =>
    `${nodeType} on line ${lineNumber}: Missing required "where" child`,
  missingRecordChild: (nodeType: string, lineNumber: number) =>
    `${nodeType} on line ${lineNumber}: Missing required "record" child`,
  invalidWhereCondition: (lineNumber: number) =>
    `where on line ${lineNumber}: Invalid condition format. Expected "PROPERTYNAME is MATCHVALUE"`,
  noMatchingItem: (nodeType: string, lineNumber: number, listName: string, propertyName: string, matchValue: string) =>
    `${nodeType} on line ${lineNumber}: No item found in list "${listName}" matching ${propertyName} is ${matchValue}`,
};

export const StateErrors = {
  undefinedVariableReference: (
    contextType: 'state' | 'list',
    parentVariableName: string | undefined,
    parentLineNumber: number,
    referenceName: string,
  ) => {
    const contextDescription = contextType === 'state' ? `State variable "${parentVariableName}"` : 'List';
    return `${contextDescription} on line ${parentLineNumber} references variable "${referenceName}" which is not declared.`;
  },
  fileReferenceNotFound: (variableName: string, filename: string, lineNumber: number) =>
    `State variable "${variableName}" on line ${lineNumber} references file "${filename}" which is not in the provided files map.`,
};

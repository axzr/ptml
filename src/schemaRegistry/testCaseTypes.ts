export type ViolationType =
  | 'missing-data'
  | 'missing-required-part'
  | 'too-many-children'
  | 'wrong-child-type'
  | 'constraint-violation'
  | 'conditional-requirement-violation'
  | 'min-parts-violation'
  | 'max-parts-violation'
  | 'missing-sibling'
  | 'root-node-not-allowed'
  | 'child-node-not-allowed';

export type SchemaExampleContext = {
  lists?: string[];
  state?: Record<string, string>;
  parentNode?: string;
};

export type GeneratedTestCase = {
  name: string;
  description: string;
  ptml: string;
  expectedValid: boolean;
  expectedError?: string;
  violationType?: ViolationType;
};

export type SchemaExampleContextProvider = (nodeType: string) => SchemaExampleContext;

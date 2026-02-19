const badIf = `
? if:
  > text: test
`;

const renderIf = `
state:
- isActive: false

ptml:
? if: $isActive
  > text: is active
? else:
  > text: is not active
> box:
  > button
    > text: toggle isActive
    - click:
      ! set: $isActive !$isActive
`;

const ifWithoutElse = `
state:
- isActive: true

ptml:
? if: $isActive
  > text: is active
`;

const ifFalse = `
state:
- isActive: false

ptml:
? if: $isActive
  > text: is active
`;

const ifWithIsCondition = `
state:
- category: Food
- selectedCategory: Food

ptml:
? if: $category is $selectedCategory
  > text: Categories match
? else:
  > text: Categories do not match
`;

const ifWithIsConditionFalse = `
state:
- category: Food
- selectedCategory: Transport

ptml:
? if: $category is $selectedCategory
  > text: Categories match
? else:
  > text: Categories do not match
`;

const nestedIf = `
state:
- isActive: true
- isEnabled: false

ptml:
? if: $isActive
  > text: Active
  ? if: $isEnabled
    > text: and Enabled
  ? else:
    > text: but not Enabled
? else:
  > text: Not Active
`;

const nestedIfElseBugCase = `
state:
- outerCondition: true
- innerCondition: false

ptml:
? if: $outerCondition
  ? if: $innerCondition
  ? else:
    > text: This should be rendered
`;

const nestedIfElseSibling = `
state:
- firstCondition: true
- secondCondition: false

ptml:
? if: $firstCondition
  > text: First is true
  ? if: $secondCondition
    > text: Second is true
  ? else:
    > text: Second is false (should render)
`;

export {
  badIf,
  renderIf,
  ifWithoutElse,
  ifFalse,
  ifWithIsCondition,
  ifWithIsConditionFalse,
  nestedIf,
  nestedIfElseBugCase,
  nestedIfElseSibling,
};

export const docExample = `
state:
- showDetails: true

ptml:
> text: Product Name
? if: $showDetails
  > text: This product is available in three sizes.
`;

const debugSimpleState = `
state:
- count: 0

ptml:
> debug:
> text: the debug node will show the current state of the application
> text: in a readable format
> text: in a styled container designed to make it easy to read and debug the application
`;

const debugComplexState = `
state:
- count: 0

state:
- name: Bob
- age: 30
- city: New York

state: 
- products {name: 'Product 1', price: 29.99}

ptml:
> debug:
`;

const debugList = `
valueList: items
- item 1
- item 2
- item 3

ptml:
> debug:
`;

const debugListWithRecords = `
recordList: products-list
- record:
  - name: 'Product 1'
  - price: 29.99
- record:
  - name: 'Product 2'
  - price: 39.99

ptml:
> debug:
`;

const debugInEachLoop = `
recordList: products-list
- record:
  - name: 'Product 1'
  - price: 29.99
- record:
  - name: 'Product 2'
  - price: 39.99

ptml:
> each: products-list as product
  > debug:
> text: inside an each node,the debug node will show the state and context of the loop
> text: in a readable format
> text: in a styled container designed to make it easy to read and debug the application
`;

const debugWithChild = `
ptml:
> debug:
  > text: this is a child of the debug node
`;

export { debugSimpleState, debugComplexState, debugList, debugListWithRecords, debugInEachLoop, debugWithChild };

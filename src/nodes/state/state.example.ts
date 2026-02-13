const multipleVariables = `state
- userName: John Doe
- age: 30

ptml:
> text: hello $userName and $age
`;

const canRenderTrueFalse = `state:
- isAdmin: true
- likesApple: false

ptml:
> text: hello $isAdmin $likesApple
`;

const canRenderNull = `state:
- isAdmin: null

ptml:
> text: hello $isAdmin
`;

const userObject = `state:
- user:
  - name: John Doe
  - age: 30

ptml:
> text: hello $user.name and $user.age
`;

const colonsAreOptional = `state
- user
  - name: John Doe
  - age: 30

ptml:
> text: hello $user.name and $user.age
`;

const unknownStateValues = `ptml:
> text: unknown variables $user and $user.age are rendered as is
`;

const stateWithPipe = `
valueList: names
- John
- Jannette
- Jim

state:
- numNames: $names | length

ptml:
> text: there are $numNames names
`;

const stateBeforeList = `
state:
- numNames: $names | length

valueList: names
- John
- Jannette
- Jim

ptml:
> text: there are $numNames names
`;

const stateWithLists = `
state:
- todo:
  - title: Todo
  - items:
    - Buy groceries
    - Walk the dog
- doing:
  - title: Doing
  - items:
    - Write documentation
- done:
  - title: Done
  - items:
    - Set up project

valueList: columns
- $todo
- $doing
- $done

ptml:
> each: columns as $column
  > box:
    > text: $column.title
    > each: $column.items as $item
      > box:
        > text: $item
`;

const stateWithUndefinedRef = `
state:
- count: $unknownList | length

ptml:
> text: count is $count
`;

export {
  multipleVariables,
  canRenderTrueFalse,
  canRenderNull,
  userObject,
  colonsAreOptional,
  unknownStateValues,
  stateWithPipe,
  stateBeforeList,
  stateWithLists,
  stateWithUndefinedRef,
};

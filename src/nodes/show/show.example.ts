const showWithLiteralTemplate = `
template: home
> text: Welcome to the home page
ptml:
> show: home
`;

const showWithArguments = `
template: greeting name age
> text: Hello $name, you are $age years old
ptml:
> show: greeting Alice 30
`;

const showWithVariableArguments = `
state:
- userName: Bob
- userAge: 25

template: greeting name age
> text: Hello $name, you are $age years old
ptml:
> show: greeting $userName $userAge
`;

const showWithObjectArgument = `
recordList: contacts
- record:
  - id: 1
  - name: John Doe
  - email: john@example.com

template: contact-card contact
> box:
  > text: $contact.name
  > text: $contact.email

ptml:
> each: contacts as $contact
  > show: contact-card $contact
`;

const showWithStyleOverride = `
template: styled
> text: this is the styled template
- styles:
  - color: red
  - font-size: 1.5em

ptml:
> show: styled
  - styles:
    - color: blue
    - font-size: 2em
`;

const showAsRoot = `
template: home
> text: This is the home page
ptml:
> show: home
`;

const showWithDynamicTemplate = `
state:
- currentPage: home
template: home
> text: Home page content
template: about
> text: About page content
ptml:
> show: $currentPage
`;

// A value containing spaces cannot be passed positionally, because positional
// arguments are separated by spaces. Named children take the rest of the line.
const showWithNamedArguments = `template: badge label kind
> text: [$label] [$kind]

ptml:
> show: badge
  - label: Back in stock soon
  - kind: primary
`;

const showWithNamedArgumentsReordered = `template: badge label kind
> text: [$label] [$kind]

ptml:
> show: badge
  - kind: primary
  - label: Back in stock soon
`;

// A parameter with no argument is empty, so it can be treated as optional.
const showWithOmittedArgument = `template: badge label kind
> text: [$label] [$kind]

ptml:
> show: badge
  - label: Back in stock soon
`;

const showWithNamedArgumentFromState = `state:
- motto: Back in stock soon

template: badge label
> text: [$label]

ptml:
> show: badge
  - label: $motto
`;

const showWithUnknownArgument = `template: badge label
> text: [$label]

ptml:
> show: badge
  - labl: Oops
`;

const showWithMixedArgumentStyles = `template: badge label kind
> text: [$label] [$kind]

ptml:
> show: badge New
  - kind: primary
`;

// The reported failure: four words for one parameter, three silently dropped.
const showWithTooManyPositionalArguments = `template: badge label
> text: [$label]

ptml:
> show: badge Back in stock soon
`;

export {
  showWithLiteralTemplate,
  showWithArguments,
  showWithVariableArguments,
  showWithObjectArgument,
  showWithStyleOverride,
  showAsRoot,
  showWithDynamicTemplate,
  showWithNamedArguments,
  showWithNamedArgumentsReordered,
  showWithOmittedArgument,
  showWithNamedArgumentFromState,
  showWithUnknownArgument,
  showWithMixedArgumentStyles,
  showWithTooManyPositionalArguments,
};

export const docExample = `
template: greeting name
> text: Hello, $name!

ptml:
> show: greeting World
`;

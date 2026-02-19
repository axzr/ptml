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

export {
  showWithLiteralTemplate,
  showWithArguments,
  showWithVariableArguments,
  showWithObjectArgument,
  showWithStyleOverride,
  showAsRoot,
  showWithDynamicTemplate,
};

export const docExample = `
template: greeting name
> text: Hello, $name!

ptml:
> show: greeting World
`;

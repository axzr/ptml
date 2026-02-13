import { sharedTemplatesPtml } from './imported-templates.ptml.example';
import { sharedStylesPtml } from './imported-styles.ptml.example';

const importFooPtml = `import: foo.ptml
ptml:
> text: hello`;

const importWithPathPtml = `import: ./templates/foo.ptml
ptml:
> text: hello`;

const importWithBackslashPtml = `import: folder\\foo.ptml
ptml:
> text: hello`;

const importTemplatesPtml = `import: templates.ptml
ptml:
> text: hello`;

const mainImportTemplatesShowHome = `import: templates.ptml
state:
- page: home
ptml:
> show: home`;

const filesTemplatesHomePage: Record<string, string> = {
  'templates.ptml': `template: home
> text: Home page`,
};

const filesTemplatesHomeFromImported: Record<string, string> = {
  'templates.ptml': `template: home
> text: Home from imported file`,
};

const mainImportStylesPrimary = `import: styles.ptml
ptml:
> text: styled
  - styles: primary`;

const filesStylesPrimary: Record<string, string> = {
  'styles.ptml': `define: primary
- color: red`,
};

const mainImportStylesRedStyle = `import: styles.ptml
ptml:
> text: red text
  - styles: redStyle`;

const filesStylesRedStyle: Record<string, string> = {
  'styles.ptml': `define: redStyle
- color: red`,
};

const mainImportMissingFile = `import: missing.ptml
state:
- page: home
ptml:
> show: home`;

const mainDuplicateTemplateLocalAndImport = `import: other.ptml
template: shared
> text: Local template
ptml:
> show: shared`;

const filesOtherImportedTemplate: Record<string, string> = {
  'other.ptml': `template: shared
> text: Imported template`,
};

const mainPtmlWithImports = `import: shared-templates.ptml
import: shared-styles.ptml
state:
- pageTitle: Welcome
ptml:
> show: header
> show: card $pageTitle
> text: Body text with
  - styles: accentStyle
> show: footer
`;

const mainImportTemplateWithState = `import: counter.ptml
ptml:
> show: counter`;

const filesImportTemplateWithState: Record<string, string> = {
  'counter.ptml': `state:
- count: 0
template: counter
> box:
  > text: count is $count
> button:
  > text: increment
  - click:
    ! set: $count ($count 1 | add)`,
};

const importExampleFiles: Record<string, string> = {
  'shared-templates.ptml': sharedTemplatesPtml,
  'shared-styles.ptml': sharedStylesPtml,
};

export {
  importFooPtml,
  importWithPathPtml,
  importWithBackslashPtml,
  importTemplatesPtml,
  mainImportTemplatesShowHome,
  filesTemplatesHomePage,
  filesTemplatesHomeFromImported,
  mainImportStylesPrimary,
  filesStylesPrimary,
  mainImportStylesRedStyle,
  filesStylesRedStyle,
  mainImportMissingFile,
  mainDuplicateTemplateLocalAndImport,
  filesOtherImportedTemplate,
  mainPtmlWithImports,
  mainImportTemplateWithState,
  filesImportTemplateWithState,
  importExampleFiles,
  sharedTemplatesPtml,
  sharedStylesPtml,
};

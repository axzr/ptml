// The single source of truth for the site's routes, shared by the client and
// the prerender script. Each entry is one nav destination: the URL its link
// points at, the currentPage value that shows it, and the file prerendered for
// it. If the two sides disagreed, a cold load would render one page and then
// hydrate into another.
export type Route = {
  path: string;
  currentPage: string;
  outputPath: string;
  title: string;
};

export const ROUTES: Route[] = [
  { path: '/', currentPage: 'home', outputPath: 'index.html', title: 'PTML - Declarative Markup for Web Prototypes' },
  {
    path: '/getting-started',
    currentPage: 'getting-started',
    outputPath: 'getting-started/index.html',
    title: 'Getting Started - PTML',
  },
  {
    path: '/reference',
    currentPage: 'reference',
    outputPath: 'reference/index.html',
    title: 'Language Reference - PTML',
  },
];

export const DEFAULT_PAGE = ROUTES[0].currentPage;

export const pageFromPath = (pathname: string): string => {
  const normalised = pathname.replace(/\/+$/, '') || '/';
  return ROUTES.find((route) => route.path === normalised)?.currentPage ?? DEFAULT_PAGE;
};

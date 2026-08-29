// Section metadata for the site (menu + home + section routing).
export interface Section {
  /** Route slug + content-collection name (for list sections). */
  id: string;
  /** Menu label. */
  label: string;
  /** Canonical URL (trailing slash). */
  url: string;
  /** One-line description shown on the home page and section index. */
  description: string;
  /** `list` = renders a dated post list; `single` = renders one page. */
  kind: 'list' | 'single';
}

export const sections: Section[] = [
  {
    id: 'portfolio',
    label: 'Portfolio',
    url: '/portfolio/',
    description: 'Projetos, trabalhos e GitHub.',
    kind: 'single',
  },
  {
    id: 'experience',
    label: 'Experience',
    url: '/experience/',
    description: 'Experiência profissional.',
    kind: 'single',
  },
  {
    id: 'posts',
    label: 'Técnicos',
    url: '/posts/',
    description: 'Artigos técnicos.',
    kind: 'list',
  },
  {
    id: 'estudos',
    label: 'Estudos',
    url: '/estudos/',
    description: 'Notas de estudo.',
    kind: 'list',
  },
  {
    id: 'diversos',
    label: 'Diversos',
    url: '/diversos/',
    description: 'Posts diversos.',
    kind: 'list',
  },
];

/** Sections that render a dated post list (have a content collection). */
export const listSections: Section[] = sections.filter((s) => s.kind === 'list');

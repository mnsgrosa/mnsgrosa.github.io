// GitHub configuration for the portfolio page's widgets.

export interface GithubConfig {
  /** GitHub username used for the public-events activity feed. */
  username: string;
  /** Repositories to highlight as cards, in "owner/repo" form. */
  repos: string[];
}

export const github: GithubConfig = {
  username: 'mnsgrosa',
  repos: [
    'mnsgrosa/mnsgrosa.github.io',
    'mnsgrosa/some-project',
  ],
};

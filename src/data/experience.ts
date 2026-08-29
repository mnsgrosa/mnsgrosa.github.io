// Structured work-experience data, rendered as compact square cards on the
// portfolio page. Not a full resume — just a one-line summary per role.

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  summary: string;
  /** Optional tech tags shown on the card (plain strings). */
  stack?: string[];
}

export const experience: ExperienceItem[] = [
  {
    company: 'Example Co.',
    role: 'Machine Learning Engineer',
    period: '2022 — present',
    summary: 'Built and shipped ML features end to end, from data pipelines to model serving.',
    stack: ['Python', 'MLOps', 'AWS'],
  },
  {
    company: 'Acme Corp.',
    role: 'Data Scientist',
    period: '2020 — 2022',
    summary: 'Analyzed user behaviour and built forecasting models that informed product decisions.',
    stack: ['Python', 'SQL', 'Airflow'],
  },
];

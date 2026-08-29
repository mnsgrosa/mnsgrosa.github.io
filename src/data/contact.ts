// Contact information shown on the /portfolio/ page.

export interface Contact {
  /** Email address (mailto: target). */
  email: string;
  /** Full URL to the GitHub profile. */
  github: string;
  /** Full URL to the LinkedIn profile. */
  linkedin: string;
}

export const contact: Contact = {
  email: 'matheus@example.com', // TODO: replace with the real email address
  github: 'https://github.com/mnsgrosa',
  linkedin: 'https://www.linkedin.com/in/mnsgrosa', // TODO: replace with the real LinkedIn URL
};

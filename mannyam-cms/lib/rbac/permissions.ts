export const PERMISSIONS = {
  'pages':      { Admin: true,  ContentManager: true,  Marketer: false },
  'journal':    { Admin: true,  ContentManager: true,  Marketer: false },
  'packages':   { Admin: true,  ContentManager: true,  Marketer: false },
  'media':      { Admin: true,  ContentManager: true,  Marketer: false },
  'seo':        { Admin: true,  ContentManager: true,  Marketer: true  },
  'redirects':  { Admin: true,  ContentManager: false, Marketer: true  },
  'clusters':   { Admin: true,  ContentManager: true,  Marketer: false },
  'analytics':  { Admin: true,  ContentManager: false, Marketer: true  },
  'leads':      { Admin: true,  ContentManager: false, Marketer: true  },
  'bookings':   { Admin: true,  ContentManager: false, Marketer: true  },
  'discounts':  { Admin: true,  ContentManager: false, Marketer: true  },
  'settings':   { Admin: true,  ContentManager: false, Marketer: false },
} as const;

export type Section = keyof typeof PERMISSIONS;
export type Role = 'Admin' | 'Content Manager' | 'Marketer';

export function canAccess(role: Role, section: Section): boolean {
  const roleKey = role.replace(' ', '') as 'Admin' | 'ContentManager' | 'Marketer';
  return PERMISSIONS[section][roleKey];
}

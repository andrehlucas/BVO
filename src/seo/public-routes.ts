export const cities = [
  { slug: 'orlando', name: 'Orlando' },
  { slug: 'tampa', name: 'Tampa' },
  { slug: 'fort-lauderdale', name: 'Fort Lauderdale' },
  { slug: 'miami', name: 'Miami' },
  { slug: 'boca-raton', name: 'Boca Raton' },
] as const

export const trustRoutes = [
  { pathname: '/methodology', title: 'Ranking methodology', description: 'Inspect the published weights and evidence rules used in Florida virtual office comparisons.' },
  { pathname: '/affiliate-disclosure', title: 'Affiliate disclosure', description: 'Understand how affiliate relationships are disclosed and kept separate from rankings.' },
  { pathname: '/privacy', title: 'Privacy', description: 'Learn how the comparison works without accounts, lead forms, or personal contact details.' },
  { pathname: '/corrections', title: 'Corrections', description: 'Read the process for reporting evidence-backed factual corrections.' },
] as const

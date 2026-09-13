import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outputRoot = path.join(root, 'dist/public')
const shell = fs.readFileSync(path.join(outputRoot, 'index.html'), 'utf8')
const editorial = JSON.parse(fs.readFileSync(path.join(root, 'src/content/editorial.json'), 'utf8'))

const routes = new Map([
  ['/', ['Compare Virtual Offices in Florida by Service', 'Compare Florida virtual offices by what you need: business address and mail, live receptionist and phone, or a full office package.']],
  ['/florida', ['Compare Virtual Offices Across Florida', 'Choose a Florida city and compare documented virtual office services, limitations, and pricing evidence.']],
  ['/providers', ['Virtual Office Provider Reviews', 'Compare what each virtual office provider documents, what may cost extra, and which details still need confirmation.']],
  ['/guides', ['Virtual Office Buying Guides', 'Understand virtual office services, fees, contracts, and limitations before comparing providers.']],
  ['/methodology', ['Virtual Office Ranking Methodology', 'See the exact weights, evidence rules, and eligibility requirements behind each Florida virtual office comparison.']],
  ['/affiliate-disclosure', ['Affiliate Disclosure and Editorial Independence', 'See how affiliate links fund this site while remaining technically separate from provider scores and rankings.']],
  ['/privacy', ['Privacy: Compare Without Becoming a Lead', 'Compare virtual offices without an account, lead form, or sharing your name, email address, or phone number.']],
  ['/corrections', ['Report a Virtual Office Listing Correction', 'Report outdated prices, plan details, locations, or missing context using current supporting evidence.']],
])

for (const city of editorial.cities) {
  routes.set(`/cities/${city.slug}`, [
    `Virtual Offices in ${city.title.replace(/^Virtual Offices in |:.*$/g, '')}: Compare Plans`,
    city.description,
  ])
}
for (const kind of ['providers', 'guides']) {
  for (const page of editorial[kind]) routes.set(`/${kind}/${page.slug}`, [page.title, page.description])
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

for (const [pathname, [title, description]] of routes) {
  const fullTitle = `${title} | Best Virtual Offices`
  const html = shell
    .replace(/<title>.*?<\/title>/, `<title>${escapeAttribute(fullTitle)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${escapeAttribute(description)}" />`)
    .replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${escapeAttribute(fullTitle)}" />`)
    .replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${escapeAttribute(description)}" />`)
    .replace(/<meta name="twitter:title" content=".*?"\s*\/?>/, `<meta name="twitter:title" content="${escapeAttribute(fullTitle)}" />`)
    .replace(/<meta name="twitter:description" content=".*?"\s*\/?>/, `<meta name="twitter:description" content="${escapeAttribute(description)}" />`)
    .replace('</head>', `  <link rel="canonical" href="${pathname}">\n  </head>`)
  const directory = pathname === '/' ? outputRoot : path.join(outputRoot, pathname.slice(1))
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(path.join(directory, 'index.html'), html)
}

console.log(`Built ${routes.size} route-specific HTML files`)
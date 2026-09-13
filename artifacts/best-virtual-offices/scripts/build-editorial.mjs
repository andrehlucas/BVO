import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const editorialKinds = ['guides', 'providers', 'cities'];
const editorialRoot = path.resolve(process.cwd(), 'src/content/editorial');

async function renderMarkdown(markdown) {
  const result = await remark().use(remarkHtml, { allowDangerousHtml: false }).process(markdown);
  return String(result);
}

function parseMatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) {
    return {
      data: yaml.load(match[1]),
      content: match[2]
    };
  }
  return { data: {}, content: source };
}

async function build() {
  const data = {
    guides: [],
    providers: [],
    cities: []
  };

  for (const kind of editorialKinds) {
    const dir = path.join(editorialRoot, kind);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const source = fs.readFileSync(path.join(dir, file), 'utf8');
      const parsed = parseMatter(source);
      if (parsed.data.status !== 'reviewed') continue;
      
      if (/<\s*script\b/i.test(parsed.content)) {
        throw new Error(`Editorial page ${file} contains a script tag`);
      }
      
      const html = await renderMarkdown(parsed.content);
      
      data[kind].push({
        ...parsed.data,
        publishedAt: parsed.data.publishedAt instanceof Date ? parsed.data.publishedAt.toISOString().slice(0, 10) : parsed.data.publishedAt,
        reviewedAt: parsed.data.reviewedAt instanceof Date ? parsed.data.reviewedAt.toISOString().slice(0, 10) : parsed.data.reviewedAt,
        html
      });
    }
  }

  const outPath = path.resolve(process.cwd(), 'src/content/editorial.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log('Built editorial.json');
}

build().catch(console.error);

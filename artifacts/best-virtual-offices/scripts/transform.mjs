import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace next/link
  content = content.replace(/import Link from ['"]next\/link['"]/g, "import { Link } from 'wouter'");

  // Replace next/image
  content = content.replace(/import Image from ['"]next\/image['"]/g, "import Image from '@/components/ui/image'");

  // Replace next/navigation
  content = content.replace(/import \{.*\} from ['"]next\/navigation['"]/g, "import { notFound, usePathname, useRouter, useSearchParams } from '@/hooks/use-next-navigation'");

  // Replace Next metadata
  content = content.replace(/export const metadata.*?};/gs, "");
  content = content.replace(/export async function generateMetadata.*?}\s*}/gs, "");
  content = content.replace(/import type \{ Metadata \} from ['"]next['"]/g, "");

  // Remove generateStaticParams and dynamicParams
  content = content.replace(/export function generateStaticParams.*?}/gs, "");
  content = content.replace(/export async function generateStaticParams.*?}/gs, "");
  content = content.replace(/export const dynamicParams = .*?;/g, "");

  // Change async default exports to synchronous for page components, and remove Promises from props
  // We will handle data loading synchronously for catalog and mock data
  content = content.replace(/export default async function (\w+)/g, "export default function $1");

  // Fix params type
  content = content.replace(/params: Promise<({.*?})>/g, "params: $1");
  content = content.replace(/searchParams: Promise<(.*?)>/g, "searchParams: $1");

  // Fix await params in component body
  // Usually const { ... } = await params
  content = content.replace(/const (\{.*?\}) = await params/g, "const $1 = params");
  content = content.replace(/const \[\{ (.*?) \}, rawSearchParams\] = await Promise.all\(\[params, searchParams\]\)/g, "const { $1 } = params; const rawSearchParams = searchParams");
  
  // Remove await from loadEditorialPage and listEditorialPages
  content = content.replace(/await loadEditorialPage/g, "loadEditorialPage");
  content = content.replace(/await listEditorialPages/g, "listEditorialPages");
  content = content.replace(/await providerFor/g, "providerFor");
  
  // Replace Promise.all for listEditorialPages
  content = content.replace(/await Promise\.all\(\[\s*listEditorialPages\('providers'\),\s*listEditorialPages\('guides'\),\s*\]\)/g, "[listEditorialPages('providers'), listEditorialPages('guides')]");

  // Remove `async` from providerFor
  content = content.replace(/async function providerFor/g, "function providerFor");
  
  // Fix React attributes
  
  fs.writeFileSync(filePath, content);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

processDirectory('artifacts/best-virtual-offices/src/pages');
processDirectory('artifacts/best-virtual-offices/src/components');

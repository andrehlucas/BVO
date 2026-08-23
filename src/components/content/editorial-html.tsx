interface EditorialHtmlProps {
  className?: string
  html: string
}

/** Renders HTML produced by the repository's safe Markdown pipeline. */
export function EditorialHtml({ className, html }: EditorialHtmlProps) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

interface AffiliateDisclosureProps { className?: string }

export function AffiliateDisclosure({ className }: AffiliateDisclosureProps) {
  return (
    <p className={className}>
      If you buy through a provider link, we may earn a commission. Provider compensation never changes a score, rank, or recommendation.
    </p>
  )
}

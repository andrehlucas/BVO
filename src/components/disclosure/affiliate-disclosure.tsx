interface AffiliateDisclosureProps { className?: string }

export function AffiliateDisclosure({ className }: AffiliateDisclosureProps) {
  return (
    <p className={className}>
      We may earn a commission if you purchase through a link on this page. This never affects our rankings or recommendations.
    </p>
  )
}

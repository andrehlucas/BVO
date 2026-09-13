type EvidenceStatus = 'limited' | 'needs-review' | 'verified'

const statusLabels: Record<EvidenceStatus, string> = {
  verified: 'Verified evidence',
  limited: 'Limited evidence',
  'needs-review': 'Needs review',
}

interface StatusBadgeProps { status: EvidenceStatus }

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span aria-hidden="true">{status === 'verified' ? '✓' : '!'}</span>{' '}
      {statusLabels[status]}
    </span>
  )
}

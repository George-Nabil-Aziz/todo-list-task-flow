// Hand-rolled inline SVG icons (no icon library dependency). Every icon is purely
// decorative: aria-hidden + focusable="false" so it never affects accessible names
// or text-based test queries.

function base(props) {
  return {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    focusable: 'false',
    ...props,
  };
}

export function PlusIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function EditIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function LogOutIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  );
}

export function ClockIcon(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function FlameIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 2s-6 5.5-6 10.5A6 6 0 0 0 18 12.5C18 8.5 15 6.5 15 6.5c.3 2-1 3-1 3-.3-3-2-4.5-2-7.5Z" />
    </svg>
  );
}

export function EqualIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M5 9h14M5 15h14" />
    </svg>
  );
}

export function ArrowDownIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

export function MailIcon(props) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function LockIcon(props) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function UserIcon(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export function AlertIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export function ChevronDownIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ClipboardIcon(props) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6M9 15h4" />
    </svg>
  );
}

export function FilterIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54Z" />
    </svg>
  );
}

export function SortIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="m3 7 4-4 4 4" />
      <path d="M7 3v18" />
      <path d="m21 17-4 4-4-4" />
      <path d="M17 21V3" />
    </svg>
  );
}

export function ClipboardIllustration(props) {
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" fill="none" aria-hidden="true" focusable="false" {...props}>
      <rect x="24" y="14" width="72" height="98" rx="12" fill="var(--color-primary-light)" opacity="0.5" />
      <rect x="32" y="24" width="56" height="80" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
      <rect x="44" y="12" width="32" height="16" rx="6" fill="var(--color-primary)" />
      <path d="M42 50h36M42 62h36M42 74h20" stroke="var(--color-border)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="90" r="14" fill="var(--color-accent-light)" />
      <path d="m53 90 5 5 9-10" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SpinnerIcon(props) {
  return (
    <svg {...base({ width: 18, height: 18, ...props })} className={`icon-spin ${props.className || ''}`}>
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  );
}

export function SunIcon(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

export function TypeIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
  );
}

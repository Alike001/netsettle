import type { SVGProps } from 'react';

export type IconName =
  | 'arrow'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'copy'
  | 'external'
  | 'failure'
  | 'fund'
  | 'network'
  | 'refresh'
  | 'settle'
  | 'submit'
  | 'wallet'
  | 'withdraw';

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="m5 12 7-7 7 7M12 5v14" />,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="10" height="10" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    external: <path d="M14 5h5v5M19 5l-8 8M18 13v5H6V6h5" />,
    failure: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m9 9 6 6m0-6-6 6" />
      </>
    ),
    fund: (
      <>
        <rect x="4" y="7" width="16" height="12" rx="2" />
        <path d="M7 7V5h10v2M8 13h8" />
      </>
    ),
    network: (
      <>
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="17" r="2" />
        <circle cx="19" cy="17" r="2" />
        <path d="m11 7-5 8m7-8 5 8M7 17h10" />
      </>
    ),
    refresh: <path d="M20 7v5h-5M4 17v-5h5M18 12a6 6 0 0 0-10-4L5 11m1 1a6 6 0 0 0 10 4l3-3" />,
    settle: (
      <>
        <path d="M5 8h14M8 5 5 8l3 3M19 16H5m11-3 3 3-3 3" />
      </>
    ),
    submit: (
      <>
        <path d="M12 4v11m-4-4 4 4 4-4" />
        <path d="M5 19h14" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 7h15v12H4zM4 7l3-3h10v3" />
        <path d="M15 12h4v3h-4a1.5 1.5 0 0 1 0-3Z" />
      </>
    ),
    withdraw: (
      <>
        <path d="M12 20V9m-4 4 4-4 4 4" />
        <path d="M5 5h14" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20" {...props}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {paths[name]}
      </g>
    </svg>
  );
}

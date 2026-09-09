// Minimal line-icon set used throughout the app instead of emoji, so
// everything renders in black/white/gray (emoji glyphs render in full
// color regardless of app theming). Deliberately dependency-free.

import { SVGProps, ReactNode } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps, children: ReactNode) {
  const { className, ...rest } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "w-5 h-5"}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: IconProps) =>
  base(p, <path d="M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9" />);

export const IconCheckCircle = (p: IconProps) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.3 2.3 2.3 4.7-5" />
    </>
  );

export const IconWallet = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H18a2 2 0 0 1 2 2v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17V7.5Z" />
      <path d="M4 7.5V6.2A1.7 1.7 0 0 1 5.7 4.5h9.1" />
      <path d="M15.5 13a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
    </>
  );

export const IconUsers = (p: IconProps) =>
  base(
    p,
    <>
      <circle cx="9" cy="8.5" r="2.75" />
      <path d="M3.5 18c.6-2.7 2.7-4.3 5.5-4.3s4.9 1.6 5.5 4.3" />
      <circle cx="16.5" cy="9" r="2.1" />
      <path d="M15 13.9c2.2.2 3.7 1.6 4.2 3.9" />
    </>
  );

export const IconHeart = (p: IconProps) =>
  base(
    p,
    <path d="M12 19.2s-7-4.4-7-9.5A3.9 3.9 0 0 1 12 7.1a3.9 3.9 0 0 1 7 2.6c0 5.1-7 9.5-7 9.5Z" />
  );

export const IconClock = (p: IconProps) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  );

export const IconClipboard = (p: IconProps) =>
  base(
    p,
    <>
      <rect x="6" y="4.5" width="12" height="16" rx="1.5" />
      <path d="M9 4.5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4v.5" />
      <path d="M9 11h6M9 14.5h6M9 8h3" />
    </>
  );

export const IconLock = (p: IconProps) =>
  base(
    p,
    <>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  );

export const IconSparkle = (p: IconProps) =>
  base(
    p,
    <path d="M12 3.5c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5Z" />
  );

export const IconFlag = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M6 3.5v17" />
      <path d="M6 4.5h10.5L14 8l2.5 3.5H6" />
    </>
  );

export const IconFolder = (p: IconProps) =>
  base(
    p,
    <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h4l1.8 2H18.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-11Z" />
  );

export const IconChat = (p: IconProps) =>
  base(
    p,
    <path d="M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 16H9l-4 3.2V6.5Z" />
  );

export const IconBuilding = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M5 20V6.2L12 3l7 3.2V20" />
      <path d="M3.5 20h17" />
      <path d="M9 20v-4.5h6V20" />
      <path d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01" />
    </>
  );

export const IconFlower = (p: IconProps) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10a2.6 2.6 0 1 1 0-5.2A2.6 2.6 0 0 1 12 10Z" />
      <path d="M12 14a2.6 2.6 0 1 1 0 5.2A2.6 2.6 0 0 1 12 14Z" />
      <path d="M14 12a2.6 2.6 0 1 1 5.2 0A2.6 2.6 0 0 1 14 12Z" />
      <path d="M10 12a2.6 2.6 0 1 1-5.2 0A2.6 2.6 0 0 1 10 12Z" />
      <path d="M12 19.2V22" />
    </>
  );

export const IconCamera = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-1.8h7l1 1.8h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
      <circle cx="12" cy="13" r="3.2" />
    </>
  );

export const IconUtensils = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M7 3.5v6.7M9 3.5v6.7M7 10.2c-1.4 0-2-1-2-2.2V3.5M8 10.2v10.3" />
      <path d="M15.5 3.5c-1.3 0-2.5 1.7-2.5 4.6s1.2 3.9 2.5 3.9v8.5" />
    </>
  );

export const IconMusic = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M9.5 17.5a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z" />
      <path d="M18 15.8a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z" />
      <path d="M11.7 13.1V5.3L20.2 4v7.4" />
    </>
  );

export const IconStar = (p: IconProps) =>
  base(
    p,
    <path d="m12 4 2.2 5.3 5.6.5-4.3 3.7 1.3 5.5L12 16l-4.8 3 1.3-5.5-4.3-3.7 5.6-.5Z" />
  );

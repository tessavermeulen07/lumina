const iconClassName = "h-5 w-5";

function SvgIcon({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

export function AiIcon() {
  return (
    <SvgIcon>
      <path
        d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17zM19 17l.75 2.25L22 20l-2.25.75L19 23l-.75-2.25L16 20l2.25-.75L19 17z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function ImageIcon() {
  return (
    <SvgIcon>
      <rect
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        width="18"
        x="3"
        y="5"
      />
      <circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M21 16l-5-5L5 19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function FormatIcon() {
  return (
    <SvgIcon>
      <path
        d="M5 6h8M9 6v12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M15 10h5M17.5 10v8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function MoreIcon() {
  return (
    <SvgIcon>
      <circle cx="6" cy="12" fill="currentColor" r="1.25" />
      <circle cx="12" cy="12" fill="currentColor" r="1.25" />
      <circle cx="18" cy="12" fill="currentColor" r="1.25" />
    </SvgIcon>
  );
}

export function BackIcon() {
  return (
    <SvgIcon>
      <path
        d="M11 6l-6 6 6 6M5 12h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function UndoIcon() {
  return (
    <SvgIcon>
      <path
        d="M9 14L4 9l5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M4 9h10.5a5.5 5.5 0 110 11H12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function RedoIcon() {
  return (
    <SvgIcon>
      <path
        d="M15 14l5-5-5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M20 9H9.5a5.5 5.5 0 100 11H13"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function BoldIcon() {
  return (
    <SvgIcon>
      <path
        d="M8 5h5.5a3.5 3.5 0 010 7H8V5zm0 7h6a3.5 3.5 0 010 7H8v-7z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function ItalicIcon() {
  return (
    <SvgIcon>
      <path
        d="M12 5h6M6 19h6M14 5l-4 14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function UnderlineIcon() {
  return (
    <SvgIcon>
      <path
        d="M7 5v5a5 5 0 0010 0V5M5 19h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function StrikethroughIcon() {
  return (
    <SvgIcon>
      <path
        d="M6 12h12M8 7c0-1.5 1.5-2.5 4-2.5s4 1 4 2.5M8 17c0 1.5 1.5 2.5 4 2.5s4-1 4-2.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function HeadingIcon() {
  return (
    <SvgIcon>
      <path
        d="M6 6v12M18 6v12M6 12h12M20 8v8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function BulletListIcon() {
  return (
    <SvgIcon>
      <path
        d="M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function NumberedListIcon() {
  return (
    <SvgIcon>
      <path
        d="M11 6h10M11 12h10M11 18h10M5 7V5M5 19v-2M5 12h1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function SmallCapsIcon() {
  return (
    <SvgIcon>
      <path
        d="M5 17V8l3-2 3 2v9M7 13h2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14 17v-4a2.5 2.5 0 015 0v4M16.5 13a2 2 0 00-2 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function TitleIcon() {
  return (
    <SvgIcon>
      <path
        d="M12 5v14M8 5h8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M5 19h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function DividerIcon() {
  return (
    <SvgIcon>
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function QuestionIcon() {
  return (
    <SvgIcon>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.5 9.5a2.5 2.5 0 014.5 1.5c0 2-2.5 2-2.5 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="17" fill="currentColor" r="0.75" />
    </SvgIcon>
  );
}

export function DeeperIcon() {
  return (
    <SvgIcon>
      <path
        d="M12 5v14M5 12l7 7 7-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function CoachIcon() {
  return (
    <SvgIcon>
      <path
        d="M4 19V9l8-4 8 4v10M9 19v-6h6v6"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function SummarizeIcon() {
  return (
    <SvgIcon>
      <path
        d="M6 8h12M6 12h8M6 16h10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function InsightIcon() {
  return (
    <SvgIcon>
      <path
        d="M9 18h6M10 21h4M12 3a5 5 0 00-3 9.2V14h6v-1.8A5 5 0 0012 3z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function PatternIcon() {
  return (
    <SvgIcon>
      <path
        d="M4 18V6M4 18h16M8 14v-4M12 16V8M16 12V6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function ActionIcon() {
  return (
    <SvgIcon>
      <path
        d="M9 11l3 3L22 4M5 12l3 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function FeedbackIcon() {
  return (
    <SvgIcon>
      <path
        d="M21 14a4 4 0 01-4 4H8l-5 3V6a4 4 0 014-4h10a4 4 0 014 4v8z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function TrashIcon() {
  return (
    <SvgIcon>
      <path
        d="M4 7h16M9 7V5h6v2M10 11v5M14 11v5M6 7l1 12h10l1-12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function BookmarkIcon() {
  return (
    <SvgIcon>
      <path
        d="M6 5h12v16l-6-4-6 4V5z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function BookmarkFilledIcon() {
  return (
    <SvgIcon>
      <path
        d="M6 5h12v16l-6-4-6 4V5z"
        fill="currentColor"
        stroke="none"
      />
    </SvgIcon>
  );
}

export function LockIcon() {
  return (
    <SvgIcon>
      <rect
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        width="14"
        x="5"
        y="11"
      />
      <path
        d="M8 11V8a4 4 0 018 0v3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

export function SaveIcon() {
  return (
    <SvgIcon>
      <path
        d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M17 21v-8H7v8M7 3v5h8"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </SvgIcon>
  );
}

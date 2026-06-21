"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ToolbarIconButtonProps {
  label: string;
  title: string;
  onClick?: () => void;
  isActive?: boolean;
  ariaPressed?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function ToolbarIconButton({
  label,
  title,
  onClick,
  isActive = false,
  ariaPressed,
  disabled = false,
  children,
}: Readonly<ToolbarIconButtonProps>) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  function showTooltip() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }

  function hideTooltip() {
    setTooltipPosition(null);
  }

  return (
    <>
      <button
        ref={buttonRef}
        aria-label={label}
        aria-pressed={ariaPressed}
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500 ${
          disabled
            ? "cursor-not-allowed text-lumina-500/40"
            : isActive
              ? "bg-lumina-500/15 text-lumina-700"
              : "text-lumina-500 hover:bg-lumina-500/10 hover:text-lumina-700"
        }`}
        disabled={disabled}
        onBlur={hideTooltip}
        onClick={onClick}
        onFocus={showTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        type="button"
      >
        {children}
      </button>

      {tooltipPosition && typeof document !== "undefined"
        ? createPortal(
            <span
              aria-hidden="true"
              className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-lumina-500/25 bg-surface/95 px-2.5 py-1 text-xs text-lumina-500 shadow-sm backdrop-blur-sm"
              role="tooltip"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
              }}
            >
              {title}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}

export function ToolbarSeparator() {
  return (
    <span
      aria-hidden="true"
      className="mx-0.5 h-5 w-px shrink-0 bg-lumina-500/25"
    />
  );
}

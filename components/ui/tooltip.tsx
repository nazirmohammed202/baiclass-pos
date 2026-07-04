"use client";

import { ReactNode, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type InfoTooltipProps = {
  children: ReactNode;
  content: string;
  className?: string;
  side?: "top" | "bottom";
};

const TOOLTIP_MAX_WIDTH = 288;

const InfoTooltip = ({
  children,
  content,
  className,
  side = "top",
}: InfoTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const halfWidth = TOOLTIP_MAX_WIDTH / 2;
    const left = Math.max(
      halfWidth + 8,
      Math.min(rect.left + rect.width / 2, window.innerWidth - halfWidth - 8)
    );
    const top = side === "top" ? rect.top - 8 : rect.bottom + 8;

    setCoords({ top, left });
    setIsVisible(true);
  }, [side]);

  const hide = useCallback(() => setIsVisible(false), []);

  const tooltip =
    isVisible && typeof document !== "undefined"
      ? createPortal(
          <div
            role="tooltip"
            className="fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg max-w-xs whitespace-normal text-left pointer-events-none"
            style={{
              top: coords.top,
              left: coords.left,
              transform:
                side === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
            }}
          >
            {content}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        ref={triggerRef}
        className={cn("relative inline-block", className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>
      {tooltip}
    </>
  );
};

export default InfoTooltip;

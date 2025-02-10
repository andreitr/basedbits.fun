"use client";

import { useState } from "react";
import { flip, offset, shift, useFloating } from "@floating-ui/react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { x, y, strategy } = useFloating({
    middleware: [offset(10), flip(), shift()],
  });

  return (
    <div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="relative flex"
    >
      {children}
      {isOpen && (
        <div
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 9999,
          }}
          className="bg-black text-white text-sm rounded p-2"
        >
          {content}
        </div>
      )}
    </div>
  );
};

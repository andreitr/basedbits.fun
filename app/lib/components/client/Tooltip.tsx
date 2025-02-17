"use client";

import { useState } from "react";
import { flip, offset, shift, useFloating } from "@floating-ui/react";

interface Props {
  content: string;
  children: React.ReactNode;
}

export const Tooltip = ({ content, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { x, y, strategy } = useFloating({
    placement: "top-start",
    middleware: [offset(40), flip(), shift()],
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
            top: y ?? 20,
            left: x ?? 20,
            zIndex: 9999,
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateY(0)" : "translateY(-40px)",
            transition: "opacity 0.9s ease-in-out, transform 0.9s ease-in-out",
          }}
          className="bg-black text-white text-sm rounded p-2"
        >
          {content}
        </div>
      )}
    </div>
  );
};

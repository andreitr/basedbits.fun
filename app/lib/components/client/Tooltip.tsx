"use client";

import { useState } from "react";
import {
  useFloating,
  useHover,
  useInteractions,
  FloatingArrow,
  autoUpdate,
  flip,
  offset,
  shift,
} from "@floating-ui/react";
import { ReactNode } from "react";

interface Props {
  content: ReactNode;
  children: ReactNode;
}

export const Tooltip = ({ content, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    delay: { open: 100, close: 0 },
    mouseOnly: true,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <div
      ref={refs.setReference}
      {...getReferenceProps()}
      className="relative flex"
    >
      {children}
      <div
        ref={refs.setFloating}
        style={{
          ...floatingStyles,
          opacity: isOpen ? 1 : 0,
          transition: "opacity 200ms ease-in-out",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        {...getFloatingProps()}
        className="bg-black bg-opacity-90 text-white text-sm rounded-lg px-3 py-2 shadow-lg"
        role="tooltip"
      >
        {content}
        <FloatingArrow
          context={context}
          className="fill-black absolute left-1/2 -translate-x-1/2"
          tipRadius={2}
        />
      </div>
    </div>
  );
};

"use client";

import { useEffect, useState } from "react";

interface Props {
  startTime: number; // Unix timestamp (seconds)
}

export const MintStatus = ({ startTime }: Props) => {
  const [isOpen, setIsOpen] = useState(() => Date.now() >= startTime * 1000);

  useEffect(() => {
    if (isOpen) return;
    const remaining = startTime * 1000 - Date.now();
    const timeout = setTimeout(() => setIsOpen(true), Math.max(remaining, 0));
    return () => clearTimeout(timeout);
  }, [isOpen, startTime]);

  return (
    <span suppressHydrationWarning>{isOpen ? "Mint open" : "Mint soon"}</span>
  );
};

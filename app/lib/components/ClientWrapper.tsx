import { ReactNode } from "react";

interface ClientWrapperProps {
  children: ReactNode;
}

export const ClientWrapper = ({ children }: ClientWrapperProps) => {
  return <div>{children}</div>;
};

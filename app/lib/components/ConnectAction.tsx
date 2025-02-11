interface ConnectActionProps {
  action: string;
}

export const ConnectAction = ({ action }: ConnectActionProps) => {
  return <div className="text-[#677467]">connect wallet → {action}</div>;
};

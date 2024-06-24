interface ConnectActionProps {
    action: string;
}

export const ConnectAction = ({action}: ConnectActionProps) => {

    return <div className="text-[#677467] mt-4">connect wallet → {action}</div>;

}
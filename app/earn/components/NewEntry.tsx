import { Button } from "@/app/lib/components/Button";
import { useEffect, useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { BBitsSocialRewardsAbi } from "@/app/lib/abi/BBitsSocialRewards.abi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import toast from "react-hot-toast";

interface Props {
  onNewEntry: () => void;
}

export const NewEntry = ({ onNewEntry }: Props) => {
  const { isConnected } = useAccount();
  const [entry, setEntry] = useState("");

  const urlPattern =
    /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const submit = () => {
    if (!urlPattern.test(entry)) {
      toast.error("Only properly formatted links are allowed!");
      return;
    }

    writeContract({
      abi: BBitsSocialRewardsAbi,
      address: process.env
        .NEXT_PUBLIC_BB_SOCIAL_REWARDS_ADDRESS as `0x${string}`,
      functionName: "submitPost",
      args: [entry],
    });
  };

  useEffect(() => {
    if (isSuccess) {
      onNewEntry();
      setEntry("");
    }
  }, [isSuccess]);

  return (
    <div className="flex flex-col gap-2 p-2 bg-black bg-opacity-10 rounded-md">
      <textarea
        className="rounded-lg p-2 shadow-sm focus:outline-none"
        rows={2}
        placeholder="https://warpcast.com..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      ></textarea>
      <div className="text-sm text-gray-500">
        If your post is approved, you will receive a share of the rewards at the
        end of the round.
      </div>
      {!isConnected ? (
        <ConnectAction action={"submit a post"} />
      ) : (
        <Button onClick={submit} loading={isFetching}>
          {isFetching ? "Submitting..." : "Submit"}
        </Button>
      )}
    </div>
  );
};

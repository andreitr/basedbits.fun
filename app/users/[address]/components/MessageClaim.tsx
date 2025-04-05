"use client";

import { useClaimMessage } from "@/app/lib/hooks/messages/useClaimMessage";
import { useMessage } from "@/app/lib/hooks/messages/useMessage";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const MessageClaim = () => {
  const [loadingToastId, setLoadingToastId] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const messageHash = searchParams.get("message");

  const { data: message } = useMessage(messageHash || undefined);
  const { call, isSuccess, isError } = useClaimMessage();

  useEffect(() => {
    if (
      message &&
      !message.txn_hash &&
      (!message.expires_at || new Date(message.expires_at) > new Date())
    ) {
      const toastId = toast.loading(`Claiming ${message?.bounty} BBITS`);
      setLoadingToastId(toastId);
      call(message);
    }
  }, [message]);

  useEffect(() => {
    if (isSuccess && loadingToastId) {
      toast.dismiss(loadingToastId);
      toast.success(`Successfully claimed ${message?.bounty} BBITS!`, {
        duration: 10000,
      });
    }
  }, [isSuccess, message?.bounty, loadingToastId]);

  useEffect(() => {
    if (isError && loadingToastId) {
      toast.dismiss(loadingToastId);
      toast.error("Failed to claim message. Please try again later.");
    }
  }, [isError, loadingToastId]);

  if (message?.txn_hash) {
    toast.error("Message already claimed");
    return;
  }

  if (message?.expires_at && new Date(message.expires_at) < new Date()) {
    toast.error("Oh sorry, that airdrop has already expired");
    return;
  }

  return null;
};

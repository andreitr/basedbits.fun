"use client";

import { useClaimMessage } from "@/app/lib/hooks/messages/useClaimMessage";
import { useMessage } from "@/app/lib/hooks/messages/useMessage";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const MessageClaim = () => {
  const [loadingToastId, setLoadingToastId] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const messageId = searchParams.get("message");

  const { data: message } = useMessage(
    messageId ? parseInt(messageId) : undefined,
  );
  const { call, isSuccess } = useClaimMessage();

  useEffect(() => {
    if (message && !message.hash) {
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

  return null;
};

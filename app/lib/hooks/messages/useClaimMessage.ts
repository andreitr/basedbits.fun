import { DBMessage } from "@/app/lib/types/types";
import { useCallback, useState } from "react";
import { claimMessage } from "../../api/messages/claimMessage";

export const useClaimMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const call = useCallback(async (message: DBMessage) => {
    try {
      setIsLoading(true);
      await claimMessage(message.id);

      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to revalidate", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { call, isSuccess, isLoading };
};

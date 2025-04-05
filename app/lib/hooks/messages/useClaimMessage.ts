import { DBMessage } from "@/app/lib/types/types";
import { useCallback, useState } from "react";
import { claimMessage } from "../../api/messages/claimMessage";

export const useClaimMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const call = useCallback(async (message: DBMessage) => {
    try {
      setIsLoading(true);
      setIsError(false);
      await claimMessage(message.id);

      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to revalidate", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { call, isSuccess, isLoading, isError };
};

import { DBMessage } from "@/app/lib/types/types";
import { useCallback, useState } from "react";

export const useClaimMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const call = useCallback(async (message: DBMessage) => {
    try {
      setIsLoading(true);
      await fetch(`/api/messages/${message.id}/claim`, {
        method: "POST",
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to revalidate", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { call, isSuccess, isLoading };
};

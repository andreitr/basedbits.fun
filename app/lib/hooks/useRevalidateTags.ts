import { useCallback } from "react";

export const useRevalidateTags = () => {
  const call = useCallback(async (tags: string[]) => {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags }),
      });
    } catch (error) {
      console.error("Failed to revalidate", error);
    }
  }, []);

  return { call };
};

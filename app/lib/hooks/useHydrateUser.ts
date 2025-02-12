import { useCallback } from "react";

export const useHydrateUser = () => {
  const call = useCallback(async (address: string) => {
    try {
      await fetch(`/api/hydrate/users?address=${address}`);
    } catch (error) {
      console.error("Failed to revalidate", error);
    }
  }, []);

  return { call };
};

import { DBMessage } from "@/app/lib/types/types";

export const claimMessage = async (id: number): Promise<DBMessage> => {
  const response = await fetch(`/api/messages/claim`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to claim message");
  }

  return response.json();
};

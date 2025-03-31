import { DBMessage } from "@/app/lib/types/types";

export const claimMessage = async (message: DBMessage): Promise<DBMessage> => {
  const response = await fetch(`/api/messages/${message.id}/claim`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to claim message");
  }

  return response.json();
};

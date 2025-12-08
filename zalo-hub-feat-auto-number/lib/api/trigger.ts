const LISTENER_BASE_URL = process.env.NEXT_PUBLIC_LISTENER_URL;
export const triggerApi = {
  triggerCheckAccounts: async () => {
    try {
      const response = await fetch(
        `${LISTENER_BASE_URL}/zalo-listener/trigger-check-accounts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Không thể trigger listener");
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Không thể trigger listener");
    }
  },
};

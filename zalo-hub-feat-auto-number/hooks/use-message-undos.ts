import { useCallback, useEffect } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Message } from "@/lib/types/message";
import { useMutation } from "@tanstack/react-query";
import { zaloApi } from "@/lib/api";
import { toast } from "sonner";

interface UndoData {
  conversationId: number;
}

export function useMessageUndos(
  accountId: number,
  conversationId: string | null,
  onUndo?: () => void
) {
  const { onNewUndo, removeEventListener } = useSocket();

  const handleNewUndo = useCallback(
    async (undo: UndoData) => {
      if (onUndo) {
        if (
          conversationId &&
          Number(conversationId) === Number(undo.conversationId)
        ) {
          onUndo();
        }
      }
    },
    [onUndo]
  );
  useEffect(() => {
    if (accountId === -1 || accountId === undefined || accountId === null)
      return;
    onNewUndo(accountId, handleNewUndo);

    return () => {
      removeEventListener(accountId, "new_undo", handleNewUndo);
    };
  }, [accountId, onNewUndo, removeEventListener, handleNewUndo]);
}

export const useUndoMessage = () => {
  const undoMessageMutation = useMutation({
    mutationFn: zaloApi.undoMessage,
  });

  const handleUndoMessage = useCallback(
    (
      message: Message,
      accountId: number,
      options?: { onSuccess?: () => void }
    ) => {
      undoMessageMutation.mutate(
        {
          accountId,
          threadId: message.threadId,
          type: message.type,
          msgId: message.msgId,
          cliMsgId: message.cliMsgId,
        },
        {
          onSuccess: options?.onSuccess,
          onError: () => {
            toast.error(
              "Thu hồi tin nhắn thất bại. Vui lòng thử lại sau khoảng 30 giây."
            );
          },
        }
      );
    },
    [undoMessageMutation]
  );

  return {
    handleUndoMessage,
    ...undoMessageMutation,
  };
};

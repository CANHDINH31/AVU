import { useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useMutation } from "@tanstack/react-query";
import { zaloApi } from "@/lib/api/zalo";
import { Message } from "@/lib/types/message";
import { reactionApi } from "@/lib/api";

interface ReactionData {
  messageId: number;
  conversationId: number;
  msgId: string;
  gMsgID: string;
  cMsgID: string;
  threadId: string;
  rType: number;
  rIcon: string;
  msgSender: string;
  dName: string;
  isSelf: boolean;
  action: "add" | "remove";
  timestamp: Date;
}

export function useReactions(
  accountId: number,
  conversationId: string | null,
  onReaction?: (reaction: ReactionData) => void
) {
  const { onNewReaction, removeEventListener } = useSocket();

  const handleNewReaction = useCallback(
    async (reaction: ReactionData) => {
      if (onReaction) {
        if (
          conversationId &&
          Number(conversationId) === Number(reaction.conversationId)
        ) {
          await reactionApi.markConversationAsRead(conversationId);
        }
        onReaction(reaction);
      }
    },
    [onReaction]
  );

  useEffect(() => {
    if (accountId === -1 || accountId === undefined || accountId === null)
      return;
    onNewReaction(accountId, handleNewReaction);

    return () => {
      removeEventListener(accountId, "new_reaction", handleNewReaction);
    };
  }, [accountId, onNewReaction, removeEventListener, handleNewReaction]);
}

export const useSendZaloReaction = () => {
  const sendReactionMutation = useMutation({
    mutationFn: zaloApi.sendReaction,
  });

  const handleSendReaction = useCallback(
    (
      message: Message,
      accountId: number,
      emoji: string,
      options?: { onSuccess?: () => void }
    ) => {
      sendReactionMutation.mutate(
        {
          accountId,
          threadId: message?.threadId || "",
          type: message?.type as number,
          msgId: message?.msgId || "",
          cliMsgId: message?.cliMsgId || "",
          emoji,
        },
        {
          onSuccess: options?.onSuccess,
        }
      );
    },
    [sendReactionMutation]
  );

  return {
    handleSendReaction,
    ...sendReactionMutation,
  };
};

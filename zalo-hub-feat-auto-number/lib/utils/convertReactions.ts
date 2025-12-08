export const quickReactions = [
  {
    text: "/-strong",
    icon: "💪",
  },
  {
    text: "/-heart",
    icon: "💖",
  },
  {
    text: ":>",
    icon: "😄",
  },
  {
    text: ":o",
    icon: "😲",
  },
  {
    text: ":-((",
    icon: "😭",
  },
  {
    text: ":-h",
    icon: "🤬",
  },
];

export const iconToEmoji: Record<string, string> = {
  "/-strong": "💪",
  "/-heart": "💖",
  ":>": "😄",
  ":o": "😲",
  ":-((": "😭",
  ":-h": "🤬",
};

export interface RawReaction {
  rIcon: string;
  uidFrom?: string;
  msgSender?: string;
}

export interface UIReaction {
  emoji: string;
  count: number;
}

export function convertReactions(rawReactions: RawReaction[]): UIReaction[] {
  console.log(rawReactions, "rawReactions");
  const map: Record<string, UIReaction> = {};
  for (const r of rawReactions) {
    if (!r.rIcon) continue;
    if (!map[r.rIcon]) {
      map[r.rIcon] = { emoji: iconToEmoji[r.rIcon] || r.rIcon, count: 0 };
    }
    map[r.rIcon].count += 1;
  }
  console.log(Object.values(map));
  return Object.values(map);
}

export function convertReactionsWithTopAndTotal(rawReactions: RawReaction[]): {
  top: UIReaction[];
  total: number;
} {
  const map: Record<string, UIReaction> = {};
  for (const r of rawReactions) {
    if (!r.rIcon) continue;
    if (!map[r.rIcon]) {
      map[r.rIcon] = { emoji: iconToEmoji[r.rIcon] || r.rIcon, count: 0 };
    }
    map[r.rIcon].count += 1;
  }
  const reactions = Object.values(map);
  const top = [...reactions].sort((a, b) => b.count - a.count).slice(0, 3);
  const total = reactions.reduce((sum, r) => sum + r.count, 0);
  return { top, total };
}

/**
 * Generates an avatar URL based on the user's name when the default avatar is used
 * @param zaloName The user's Zalo name
 * @param avatar The current avatar URL
 * @returns A generated avatar URL or the original avatar URL
 */
export const generateAvatarUrl = (
  zaloName: string | null | undefined,
  avatar: string | null | undefined
) => {
  if (!avatar || avatar === "https://s160-ava-talk.zadn.vn/default") {
    if (!zaloName) return "/placeholder.svg";

    // Generate a consistent color based on the name
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEEAD",
      "#D4A5A5",
      "#9B59B6",
      "#3498DB",
    ];
    const colorIndex =
      zaloName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;

    // Create initials from the name
    const initials = zaloName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    // Return a data URL for a colored circle with initials
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="${colors[colorIndex]}"/>
        <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dy=".3em">${initials}</text>
      </svg>
    `)}`;
  }
  return avatar;
};

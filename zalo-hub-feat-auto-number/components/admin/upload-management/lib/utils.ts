export const formatDate = (ms: number): string => {
  try {
    const d = new Date(ms);
    return d.toLocaleString();
  } catch {
    return "";
  }
};

export const formatSize = (n: number): string => {
  if (!n) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export const slugify = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const downloadUrl = (url?: string, filename?: string): void => {
  if (!url) return;
  const a = document.createElement("a");
  a.href = resolveUrl(url);
  if (filename) a.download = filename;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// Normalize file URLs coming from backend (can be relative like /uploads/..)
const apiOrigin = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/_?api\/_?v1\/?$/, "");

export const resolveUrl = (u?: string): string => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${apiOrigin}${u.startsWith("/") ? "" : "/"}${u}`;
};

export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === 0) return "";
  return filename.substring(lastDotIndex + 1).toLowerCase();
};

export const getFileName = (fullPath: string): string => {
  const parts = fullPath.split("/");
  return parts[parts.length - 1];
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeHHmm(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  if (isToday(date)) {
    // Nếu là hôm nay, chỉ hiển thị giờ:phút
    return format(date, "HH:mm");
  } else if (isYesterday(date)) {
    // Nếu là hôm qua, hiển thị "Hôm qua HH:mm"
    return `Hôm qua ${format(date, "HH:mm")}`;
  } else {
    // Nếu khác ngày, hiển thị ngày/tháng và giờ:phút
    return format(date, "dd/MM HH:mm");
  }
}

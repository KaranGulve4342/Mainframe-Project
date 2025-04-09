import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const parseStringify = (value) => JSON.parse(JSON.stringify(value));

export const convertFileToUrl = (file) => URL.createObjectURL(file);

// FORMAT DATE TIME
export const formatDateTime = (dateString, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) => {
  const dateTimeOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: timeZone,
  };

  const dateDayOptions = {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timeZone,
  };

  const dateOptions = {
    month: "short",
    year: "numeric",
    day: "numeric",
    timeZone: timeZone,
  };

  const timeOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: timeZone,
  };

  const formattedDateTime = new Date(dateString).toLocaleString("en-US", dateTimeOptions);
  const formattedDateDay = new Date(dateString).toLocaleString("en-US", dateDayOptions);
  const formattedDate = new Date(dateString).toLocaleString("en-US", dateOptions);
  const formattedTime = new Date(dateString).toLocaleString("en-US", timeOptions);

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function encryptKey(passkey) {
  return btoa(passkey);
}

export function decryptKey(passkey) {
  return atob(passkey);
}

"use client";

import { useSyncExternalStore } from "react";
import { formatDate, formatRelative, formatTime } from "@/lib/format";

const noop = () => () => {};

/**
 * Formats a timestamp in the viewer's timezone. The server doesn't know that
 * timezone, so it renders nothing and the client fills it in after hydration.
 */
export function LocalDate({ value, format = "date" }: { value: Date | string; format?: "date" | "time" | "relative" }) {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  if (!isClient) return <span className="invisible">—</span>;
  const text = format === "time" ? formatTime(value) : format === "relative" ? formatRelative(value) : formatDate(value);
  return <time dateTime={new Date(value).toISOString()}>{text}</time>;
}

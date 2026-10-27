"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCheck, Mail, MailOpen, Star, Trash2 } from "lucide-react";
import { deleteMessage, markAllRead, setMessageRead, toggleMessageStar } from "@/app/actions";
import { LocalDate } from "@/components/LocalDate";
import { EmptyState, useAction } from "@/components/ui";
import { initials } from "@/lib/format";
import type { Message } from "@/types";

const FILTERS = ["all", "unread", "starred"] as const;

export function InboxView({ messages, openId }: { messages: Message[]; openId?: string }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(openId ?? null);
  const { run, pending } = useAction();
  const selected = messages.find((m) => m.id === selectedId) ?? null;
  const unread = messages.filter((m) => !m.is_read).length;

  const shown = messages.filter((m) => (filter === "unread" ? !m.is_read : filter === "starred" ? m.is_starred : true));

  // Opening a message marks it read.
  useEffect(() => {
    if (selected && !selected.is_read) void setMessageRead(selected.id, true);
  }, [selected]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted">{unread} unread</p>
        </div>
        <button className="btn-secondary" disabled={pending || unread === 0} onClick={() => run(() => markAllRead())}>
          <CheckCheck className="size-4" /> Mark all read
        </button>
      </div>

      <div className="panel grid min-h-[480px] overflow-hidden lg:grid-cols-[360px_1fr]">
        <div className={`border-line lg:border-r ${selected ? "hidden lg:block" : ""}`}>
          <div className="flex gap-1 border-b border-line p-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-sm capitalize ${filter === f ? "bg-surface-muted font-medium" : "text-muted hover:text-ink"}`}
              >
                {f}
              </button>
            ))}
          </div>
          {shown.length === 0 ? (
            <EmptyState title={filter === "all" ? "Your inbox is empty" : `No ${filter} messages`} />
          ) : (
            <ul>
              {shown.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => setSelectedId(m.id)}
                    className={`flex w-full gap-3 border-b border-line px-4 py-3 text-left hover:bg-surface-muted ${selectedId === m.id ? "bg-surface-muted" : ""}`}
                  >
                    <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                      {initials(m.sender)}
                      {!m.is_read && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-surface" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-2">
                        <span className={`truncate text-sm ${m.is_read ? "" : "font-semibold"}`}>{m.sender}</span>
                        <span className="shrink-0 text-xs text-muted">
                          <LocalDate value={m.created_at} format="relative" />
                        </span>
                      </span>
                      <span className={`block truncate text-sm ${m.is_read ? "text-muted" : ""}`}>{m.subject}</span>
                      <span className="block truncate text-xs text-faint">{m.body}</span>
                    </span>
                    {m.is_starred && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={selected ? "" : "hidden lg:block"}>
          {selected ? (
            <article className="p-5">
              <div className="mb-5 flex items-center gap-2">
                <button className="btn-ghost btn-sm lg:hidden" onClick={() => setSelectedId(null)}>
                  <ArrowLeft className="size-4" /> Back
                </button>
                <div className="ml-auto flex gap-1">
                  <button className="icon-btn size-8" aria-label={selected.is_starred ? "Unstar" : "Star"} onClick={() => run(() => toggleMessageStar(selected.id))}>
                    <Star className={`size-4 ${selected.is_starred ? "fill-amber-400 text-amber-400" : ""}`} />
                  </button>
                  <button
                    className="icon-btn size-8"
                    aria-label="Mark as unread"
                    onClick={() => run(() => setMessageRead(selected.id, false), () => setSelectedId(null))}
                  >
                    {selected.is_read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                  </button>
                  <button
                    className="icon-btn size-8 hover:text-danger"
                    aria-label="Delete"
                    onClick={() => confirm("Delete this message?") && run(() => deleteMessage(selected.id), () => setSelectedId(null))}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <h2 className="text-lg font-semibold">{selected.subject}</h2>
              <p className="mt-1 text-sm text-muted">
                From {selected.sender} · <LocalDate value={selected.created_at} /> <LocalDate value={selected.created_at} format="time" />
              </p>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed">{selected.body}</p>
            </article>
          ) : (
            <EmptyState title="Select a message" hint="Choose a message on the left to read it." />
          )}
        </div>
      </div>
    </div>
  );
}

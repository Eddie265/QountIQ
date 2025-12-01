import { mockInboxMessages } from "@/data/mockData";

const statusLabel: Record<string, string> = {
  new: "New",
  read: "Read",
  urgent: "Requires action",
};

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Approvals, alerts, and close tasks in one place
          </p>
        </div>
        <button className="btn-primary">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {mockInboxMessages.map((message) => (
          <div
            key={message.id}
            className="card flex items-start justify-between gap-4 border border-[var(--border-color)]"
          >
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">
                {message.date}
              </p>
              <h2 className="text-lg font-semibold">{message.subject}</h2>
              <p className="text-sm text-[var(--text-muted)]">
                {message.preview}
              </p>
            </div>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide ${
                message.status === "urgent"
                  ? "bg-red-50 text-red-600"
                  : message.status === "new"
                  ? "bg-[var(--sidebar-active)] text-[var(--primary-green)]"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {statusLabel[message.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}




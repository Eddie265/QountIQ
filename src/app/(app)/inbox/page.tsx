import { listMessages } from "@/lib/queries";
import { InboxView } from "./InboxView";

export const metadata = { title: "Inbox" };

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const sp = await searchParams;
  const messages = await listMessages();
  return <InboxView messages={messages} openId={sp.open} />;
}

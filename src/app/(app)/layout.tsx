import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { getUser } from "@/lib/auth/server";
import { getProfile, getUnreadCount, listMessages } from "@/lib/queries";

// Every page reads live data from Postgres.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");
  const [profile, unread, unreadMessages] = await Promise.all([getProfile(), getUnreadCount(), listMessages("unread")]);

  return (
    <Shell profile={profile} user={user} unread={unread} notifications={unreadMessages.slice(0, 5)}>
      {children}
    </Shell>
  );
}

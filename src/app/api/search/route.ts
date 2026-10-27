import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { search } from "@/lib/queries";

export async function GET(request: Request) {
  if (!(await getUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  return NextResponse.json(await search(q.slice(0, 100)));
}

import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getInsights } from "@/lib/insights";

export async function GET() {
  if (!(await getUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getInsights());
}

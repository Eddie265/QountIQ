import { NextResponse } from "next/server";
import { db } from "@/store";
import type { JournalEntry } from "@/types";

export async function GET() {
  return NextResponse.json(db.listJournals());
}

export async function POST(request: Request) {
  const body = (await request.json()) as Omit<JournalEntry, "id">;
  const created = db.createJournal(body);
  return NextResponse.json(created, { status: 201 });
}





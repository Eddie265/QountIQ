import { NextResponse } from "next/server";
import { db } from "@/store";

export async function GET() {
  return NextResponse.json(db.listAccounts());
}




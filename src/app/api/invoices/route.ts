import { NextResponse } from "next/server";
import { db } from "@/store";
import type { Invoice } from "@/types";

export async function GET() {
  return NextResponse.json(db.listInvoices());
}

export async function POST(request: Request) {
  const body = (await request.json()) as Omit<Invoice, "id">;
  const created = db.createInvoice(body);
  return NextResponse.json(created, { status: 201 });
}





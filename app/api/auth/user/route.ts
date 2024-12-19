import { validateRequest } from "@/lib/auth/lucia";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();
  return NextResponse.json(user);
}
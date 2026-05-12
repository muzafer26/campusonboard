import { NextRequest, NextResponse } from "next/server";
import { getBotReply } from "@/lib/edubot";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message || "";

    const response = getBotReply(message);

    return NextResponse.json(response);
  } catch (error) {
    console.error("EduBot error:", error);
    return NextResponse.json(
      {
        text: "I'm having trouble connecting right now. Please try again or contact the admission office for assistance.",
        suggestions: ["What documents do I need?", "How do I pay fees?", "My document was rejected", "How do I register?"],
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

const schema = z.object({
  application_number: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("allowed_applicants")
      .select("application_number, full_name, department, category, is_registered")
      .ilike("application_number", parsed.data.application_number)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ found: false });
    }

    if (data.is_registered) {
      return NextResponse.json({
        found: true,
        already_registered: true,
        message: "This application number is already registered.",
      });
    }

    return NextResponse.json({
      found: true,
      already_registered: false,
      department: data.department,
      category: data.category,
      full_name: data.full_name,
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
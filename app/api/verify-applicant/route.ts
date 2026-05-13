import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { z } from "zod";

export const runtime = "nodejs";

const querySchema = z.object({
  application_number: z.string().min(1).max(50),
});

export async function GET(req: NextRequest) {
  const rawAppNo = req.nextUrl.searchParams.get("application_number") || "";

  const parsed = querySchema.safeParse({ application_number: rawAppNo });
  if (!parsed.success) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("allowed_applicants")
    .select("application_number, full_name, department, category, date_of_birth")
    .eq("application_number", parsed.data.application_number)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  return NextResponse.json({
    found: true,
    department: data.department,
    category: data.category,
    full_name: data.full_name,
    date_of_birth: data.date_of_birth,
  });
}
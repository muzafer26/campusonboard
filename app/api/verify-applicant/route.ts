import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const applicationNumber = req.nextUrl.searchParams.get("application_number");

  if (!applicationNumber) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("allowed_applicants")
    .select("application_number, full_name, department, category, date_of_birth")
    .ilike("application_number", applicationNumber)
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
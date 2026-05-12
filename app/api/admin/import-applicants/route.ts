import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

interface ParsedRow {
  application_number: string;
  full_name: string;
  date_of_birth: string;
  department: string;
  category: string;
}

export async function POST(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();

    // Parse CSV
    const result = Papa.parse<ParsedRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.toLowerCase().replace(/\s+/g, "_"),
    });

    if (result.errors.length > 0) {
      return NextResponse.json(
        { error: "CSV parse error: " + result.errors[0].message },
        { status: 400 }
      );
    }

    const validCategories = ["Open", "OBC", "SC", "ST", "NT", "SBC"];
    const applicants = [];
    let skipped = 0;
    const duplicates = [];

    for (const row of result.data) {
      const applicationNumber = row.application_number?.toString().trim();
      const fullName = row.full_name?.toString().trim();
      const dob = row.date_of_birth?.toString().trim();
      const department = row.department?.toString().trim();
      const category = row.category?.toString().trim();

      // Validate required fields
      if (!applicationNumber || !fullName || !dob || !department || !category) {
        skipped++;
        continue;
      }

      // Validate category
      if (!validCategories.includes(category)) {
        skipped++;
        continue;
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        skipped++;
        continue;
      }

      applicants.push({
        application_number: applicationNumber,
        full_name: fullName,
        date_of_birth: dob,
        department,
        category,
      });
    }

    if (applicants.length === 0) {
      return NextResponse.json({
        message: "No valid records to import",
        imported: 0,
        skipped,
        duplicates: 0,
      });
    }

    const supabase = getServiceClient();
    let inserted = 0;
    let duplicateCount = 0;

    for (const applicant of applicants) {
      // Check for duplicate application number
      const { data: existing } = await supabase
        .from("allowed_applicants")
        .select("id")
        .ilike("application_number", applicant.application_number)
        .maybeSingle();

      if (existing) {
        duplicateCount++;
        continue;
      }

      const { error } = await supabase
        .from("allowed_applicants")
        .insert(applicant);

      if (!error) {
        inserted++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      message: `${inserted} records imported successfully`,
      imported: inserted,
      duplicates: duplicateCount,
      skipped,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to process CSV file" },
      { status: 500 }
    );
  }
}
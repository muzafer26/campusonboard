import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

const registerSchema = z.object({
  full_name: z.string().min(3).regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces allowed"),
  application_number: z.string().min(1),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  email: z.string().email(),
  mobile: z.string().regex(/^\d{10}$/, "Must be 10 digits"),
  password: z.string().min(8).regex(/\d/, "Must contain at least one number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { full_name, application_number, date_of_birth, email, mobile, password } = result.data;
    const supabase = getServiceClient();

    // 1. Verify applicant exists in allowed_applicants
    const { data: applicant, error: applicantError } = await supabase
      .from("allowed_applicants")
      .select("*")
      .ilike("application_number", application_number)
      .eq("date_of_birth", date_of_birth)
      .maybeSingle();

    if (applicantError || !applicant) {
      return NextResponse.json(
        { error: "Application number or date of birth is incorrect. Please check your allotment letter." },
        { status: 404 }
      );
    }

    if (applicant.is_registered) {
      return NextResponse.json(
        { error: "This application number has already been used to register an account." },
        { status: 409 }
      );
    }

    // 2. Check if email already registered
    const { data: existingStudent } = await supabase
      .from("students")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingStudent) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 3. Create student account
    const password_hash = await bcrypt.hash(password, 10);

    const { data: student, error: createError } = await supabase
      .from("students")
      .insert({
        applicant_id: applicant.id,
        full_name,
        application_number: applicant.application_number,
        email: email.toLowerCase(),
        password_hash,
        mobile,
        department: applicant.department,
        category: applicant.category,
        status: "pending_approval",
      })
      .select()
      .single();

    if (createError) {
      console.error("Student creation error:", createError);
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    // 4. Mark applicant as registered
    await supabase
      .from("allowed_applicants")
      .update({ is_registered: true })
      .eq("id", applicant.id);

    return NextResponse.json(
      {
        ok: true,
        student_id: student.id,
        message: "Registration submitted! Your account is under review. You will be notified once activated.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
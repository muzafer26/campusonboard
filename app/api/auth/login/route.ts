import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { signToken, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["student", "admin"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      console.log("❌ Validation failed:", result.error);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password, role } = result.data;
    console.log(`🔍 Login attempt: ${email} as ${role}`);

    const supabase = getServiceClient();

    if (role === "admin") {
      console.log("📡 Querying admins table...");
      const { data: admin, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error("❌ Supabase error:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!admin) {
        console.log("❌ Admin not found for email:", email);
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      console.log("✅ Admin found, comparing password...");
      console.log("Stored hash (first 20 chars):", admin.password_hash?.substring(0, 20));
      
      const isValid = await bcrypt.compare(password, admin.password_hash);
      console.log(`🔐 Password valid: ${isValid}`);

      if (!isValid) {
        console.log("❌ Password mismatch");
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      console.log("✅ Password correct, generating token...");
      const token = await signToken({
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: "admin",
      });

      setSessionCookie(token);
      console.log("✅ Login successful for admin");
      return NextResponse.json({ ok: true, role: "admin" });
    } 
    
    else {
      // Student login
      console.log("📡 Querying students table...");
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error("❌ Supabase error:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!student) {
        console.log("❌ Student not found for email:", email);
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      if (student.status === "pending_approval") {
        console.log("⚠️ Pending approval account");
        return NextResponse.json({ error: "Your account is pending activation." }, { status: 403 });
      }

      if (student.status === "rejected") {
        console.log("⚠️ Rejected account");
        return NextResponse.json({ error: "Your registration was rejected." }, { status: 403 });
      }

      console.log("✅ Student found, comparing password...");
      const isValid = await bcrypt.compare(password, student.password_hash);
      console.log(`🔐 Password valid: ${isValid}`);

      if (!isValid) {
        console.log("❌ Password mismatch");
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      console.log("✅ Password correct, generating token...");
      const token = await signToken({
        id: student.id,
        email: student.email,
        full_name: student.full_name,
        role: "student",
      });

      setSessionCookie(token);
      console.log("✅ Login successful for student");
      return NextResponse.json({ ok: true, role: "student" });
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
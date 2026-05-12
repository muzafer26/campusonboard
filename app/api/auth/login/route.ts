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
      return NextResponse.json(
        { error: "Invalid input: " + result.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const { email, password, role } = result.data;
    const supabase = getServiceClient();

    if (role === "admin") {
      // Admin login
      const { data: admin, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (error || !admin) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, admin.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      const token = await signToken({
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: "admin",
      });

      setSessionCookie(token);

      return NextResponse.json({
        ok: true,
        role: "admin",
        user: { id: admin.id, name: admin.full_name, email: admin.email },
      });
    } else {
      // Student login
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (error || !student) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      // Check account status
      if (student.status === "pending_approval") {
        return NextResponse.json(
          { error: "Your account is pending activation. Please wait for admin approval." },
          { status: 403 }
        );
      }

      if (student.status === "rejected") {
        return NextResponse.json(
          { error: "Your registration was not approved. Please contact the admission office." },
          { status: 403 }
        );
      }

      const isValid = await bcrypt.compare(password, student.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      const token = await signToken({
        id: student.id,
        email: student.email,
        full_name: student.full_name,
        role: "student",
      });

      setSessionCookie(token);

      return NextResponse.json({
        ok: true,
        role: "student",
        user: { id: student.id, name: student.full_name, email: student.email },
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
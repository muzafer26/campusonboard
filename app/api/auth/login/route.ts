import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServiceClient } from "@/lib/supabase";
import { signToken, setSessionCookie } from "@/lib/auth";
import type { SessionUser } from "@/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    if (role === "admin") {
      const { data: admin } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (!admin) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const validPassword = await bcrypt.compare(password, admin.password_hash);

      if (!validPassword) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const sessionUser: SessionUser = {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: "admin",
      };

      const token = await signToken(sessionUser);

      const response = NextResponse.json({
        success: true,
        role: "admin",
        user: { id: admin.id, name: admin.full_name, email: admin.email },
      });

      setSessionCookie(token);

      return response;
    }

    if (role === "student") {
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (!student) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      if (student.status === "pending_approval") {
        return NextResponse.json(
          { error: "Account pending activation. Please contact admin." },
          { status: 403 }
        );
      }

      if (student.status === "rejected") {
        return NextResponse.json(
          { error: "Account rejected. Please contact admin." },
          { status: 403 }
        );
      }

      const validPassword = await bcrypt.compare(password, student.password_hash);

      if (!validPassword) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const sessionUser: SessionUser = {
        id: student.id,
        email: student.email,
        full_name: student.full_name,
        role: "student",
      };

      const token = await signToken(sessionUser);

      const response = NextResponse.json({
        success: true,
        role: "student",
        user: { id: student.id, name: student.full_name, email: student.email },
      });

      setSessionCookie(token);

      return response;
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { SignJWT } from "jose";

// Initialize Supabase with service role (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-min-32-chars-long"
);
const COOKIE_NAME = "co_session";
const MAX_AGE = 60 * 60 * 24 * 7;

async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    console.log("Login attempt:", { email, role });

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    if (role === "admin") {
      // Query admin
      const { data: admin, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      console.log("🔍 Found admin:", admin?.email);
      console.log("Admin query result:", admin ? "Found" : "Not found", error);

      if (!admin) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const validPassword = await bcrypt.compare(password, admin.password_hash);
      console.log("Password valid:", validPassword);

      if (!validPassword) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = await signToken({
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: "admin",
      });

      const response = NextResponse.json({
        success: true,
        role: "admin",
        user: { id: admin.id, name: admin.full_name, email: admin.email },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE,
      });

      return response;
    } 
    
    else if (role === "student") {
      // Query student
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      console.log("Student query result:", student ? "Found" : "Not found");

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
      console.log("Password valid:", validPassword);

      if (!validPassword) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = await signToken({
        id: student.id,
        email: student.email,
        full_name: student.full_name,
        role: "student",
      });

      const response = NextResponse.json({
        success: true,
        role: "student",
        user: { id: student.id, name: student.full_name, email: student.email },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE,
      });

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
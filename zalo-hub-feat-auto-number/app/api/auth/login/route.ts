import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL_ROUTE || "http://localhost:5000/api/v1";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Call backend API directly
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Đăng nhập thất bại");
    }

    const data = await response.json();

    // Create response with cookies
    const res = NextResponse.json(data);

    // Set cookies
    res.cookies.set("accessToken", data.access_token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.cookies.set("refreshToken", data.refresh_token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Đăng nhập thất bại" },
      { status: 400 }
    );
  }
}

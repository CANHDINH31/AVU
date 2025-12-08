import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create response
    const res = NextResponse.json({ message: "Đăng xuất thành công" });

    // Clear cookies
    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Đăng xuất thất bại" },
      { status: 400 }
    );
  }
}

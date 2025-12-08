import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function validateToken(accessToken: string, refreshToken: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_ROUTE}/auth/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      }
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error, "error");
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isHomePage = request.nextUrl.pathname === "/";

  // Nếu đang ở trang auth và đã có token, chuyển về dashboard
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Nếu đang ở trang chủ và đã có token, chuyển về dashboard
  if (isHomePage && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Nếu không phải trang auth và chưa có token, chuyển về trang login
  if (!isAuthPage && !accessToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Kiểm tra tính hợp lệ của token nếu có
  if (accessToken && refreshToken && !isAuthPage) {
    const res = await validateToken(accessToken, refreshToken);

    if (!res?.access_token) {
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    } else {
      const response = NextResponse.next();
      if (res.access_token !== accessToken) {
        response.cookies.set("accessToken", res.access_token, {
          httpOnly: false,
          sameSite: "lax",
          path: "/",
        });
      }

      if (res.refresh_token !== refreshToken) {
        response.cookies.set("refreshToken", res.refresh_token, {
          httpOnly: false,
          sameSite: "lax",
          path: "/",
        });
      }

      return response;
    }

    // Check if new access token is different from old one
  }

  return NextResponse.next();
}

// Cấu hình các routes cần được bảo vệ
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

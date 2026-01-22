import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === "/login";

  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    try {
      const payload = decodeJwt(token);
      const now = Math.floor(Date.now() / 1000);

      // Si el token ya expiró
      if (payload.exp && payload.exp < now) {
        // Borramos la cookie y mandamos al login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("auth_token");
        response.cookies.delete("user_email");
        return response;
      }
    } catch (e) {
      // Si el token está mal formado
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_token");
      response.cookies.delete("user_email");

      return response;
    }
  }

  // Si tiene token y va al login -> Al home
  if (isPublicRoute && token) {
    return NextResponse.next(); // O redireccionar a "/"
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token");
  const { pathname } = request.nextUrl;

  // 1. Si el usuario NO está logueado y trata de ir a rutas protegidas
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Si el usuario YA está logueado y trata de ir al login
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configuramos qué rutas debe vigilar el middleware
export const config = {
  matcher: ["/", "/mis-disenos/:path*", "/login"],
};

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const protectedRoutes = ["/select-branch", "/dashboard", "/products", "/sales"];

// const publicRoutes = ["/login", "/signup", "/forgot-password"];

export default async function proxy(req: Request) {
  const path = new URL(req.url).pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  const cookie = (await cookies()).get("__baiclass")?.value;

  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL("/login", req.url).toString(), 302);
  }

  return NextResponse.next();
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, ReactNode } from "react";

async function PublicRouteCheck({ children }: { children: ReactNode }) {
  const token = (await cookies()).get("__baiclass")?.value;
  if (token) {
    redirect("/select-branch");
  }
  return <>{children}</>;
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublicRouteCheck>{children}</PublicRouteCheck>
    </Suspense>
  );
}

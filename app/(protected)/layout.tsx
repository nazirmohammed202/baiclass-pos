import LoadingWithLogo from "@/components/loadingWithLogo";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

const AuthWrapper = async ({ children }: { children: React.ReactNode }) => {
  const token = (await cookies()).get("__baiclass")?.value;
  if (!token) redirect("/login");
  return <>{children}</>;
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingWithLogo />}>
      <AuthWrapper>{children}</AuthWrapper>
    </Suspense>
  );
}

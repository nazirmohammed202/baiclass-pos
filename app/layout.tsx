import { Roboto_Mono, Roboto } from "next/font/google";

import "./globals.css";
import { CompanyProvider } from "@/context/companyContext";
import { ToastProvider } from "@/context/toastContext";
import { ToastContainer } from "@/components/ui/toast";
import { SalesProvider } from "@/context/salesContext";
import LoadingWithLogo from "@/components/loadingWithLogo";
import { Suspense } from "react";

const geistSans = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CompanyProvider>
          <Suspense fallback={<LoadingWithLogo />}>
            <SalesProvider>
              <ToastProvider>
                {children}
                <ToastContainer />
              </ToastProvider>
            </SalesProvider>
          </Suspense>
        </CompanyProvider>
      </body>
    </html>
  );
}

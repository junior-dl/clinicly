import type { Metadata } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { DemoBanner } from "@/components/demo-banner";

export const metadata: Metadata = {
  title: "Clinicly — appointment booking for small clinics and salons",
  description: "Schedules, services and client records for clinics, barbershops and studios, with a public booking page.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
        {/* Dynamic client routes (useParams) stream in under this boundary. */}
        <DemoBanner />
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}

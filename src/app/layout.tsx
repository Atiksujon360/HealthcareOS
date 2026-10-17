import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./../index.css";

export const metadata: Metadata = {
  title: "CareFlow Health — Multi-Tenant Healthcare SaaS",
  description:
    "A unified healthcare operating system connecting patients, doctors, clinics, pharmacies, couriers, and administrators through role-specific workspaces.",
  applicationName: "CareFlow Health",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F6F8FB] text-[#172033] antialiased">{children}</body>
    </html>
  );
}

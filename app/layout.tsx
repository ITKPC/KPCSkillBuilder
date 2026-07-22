import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KPC Skill Builder",
  description: "A Kamloops Pickleball Club Player Development tool for focused, achievable and fun practice plans.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

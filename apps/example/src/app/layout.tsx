import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Burn Rate Analyzer",
  description:
    "Interactive burn rate analysis with AI-powered insights and visualizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Face Metric",
  description: "Minimal face similarity comparison"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

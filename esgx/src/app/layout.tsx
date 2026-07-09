import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ESGX",
  description:
    "ESGX converts verified disclosures and live ESG events into auditable investment signals for fund managers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden font-sans antialiased">{children}</body>
    </html>
  );
}

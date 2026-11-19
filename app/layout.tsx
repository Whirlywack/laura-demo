import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// The share image is app/opengraph-image.png; X only shows it large with this card type.
export const metadata: Metadata = { title: "Laura", twitter: { card: "summary_large_image" } };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}

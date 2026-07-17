import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trip Pricing & Profit Calculator",
  description: "Multi-currency trip pricing and profit calculator",
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

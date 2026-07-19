import type { Metadata } from "next";
import { AppNav } from "@/components";
import { CurrentUserProvider } from "@/context";
import { getCurrentUser } from "@/lib/auth/currentUser";
import "./globals.css";


export const metadata: Metadata = {
  title: "Trip Pricing & Profit Calculator",
  description: "Multi-currency trip pricing and profit calculator",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <CurrentUserProvider user={user}>
          <AppNav />
          {children}
        </CurrentUserProvider>
      </body>
    </html>
  );
}

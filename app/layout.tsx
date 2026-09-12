import type { Metadata } from "next";
import "./globals.css";
import { AppDataProvider } from "@/lib/store";

// NOTE: this build environment can't reach fonts.googleapis.com, so the
// wordmark and body copy use system font stacks (defined in globals.css)
// instead of next/font/google. Swap in next/font/google (e.g. Inter +
// Playfair Display, per the earlier gold/black-and-white branding notes)
// once deployed somewhere with normal internet access — see globals.css.

export const metadata: Metadata = {
  title: "The Wedding Cheat Sheet",
  description: "Everything you need to plan your wedding, all in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppDataProvider>{children}</AppDataProvider>
      </body>
    </html>
  );
}

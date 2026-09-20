import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppDataProvider } from "@/lib/store";
import RegisterSW from "@/components/RegisterSW";

// NOTE: this build environment can't reach fonts.googleapis.com, so the
// wordmark and body copy use system font stacks (defined in globals.css)
// instead of next/font/google. Swap in next/font/google (e.g. Inter +
// Playfair Display, per the earlier gold/black-and-white branding notes)
// once deployed somewhere with normal internet access — see globals.css.

export const metadata: Metadata = {
  title: "The Wedding Cheat Sheet",
  description: "Everything you need to plan your wedding, all in one place.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Wedding Cheat Sheet",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <RegisterSW />
        <AppDataProvider>{children}</AppDataProvider>
      </body>
    </html>
  );
}

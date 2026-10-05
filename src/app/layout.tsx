import type { Metadata, Viewport } from "next";
import { Geo, Audiowide, Geist_Mono } from "next/font/google";
import { SerwistProvider } from "@serwist/turbopack/react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geo = Geo({
  variable: "--font-geo",
  subsets: ["latin"],
  weight: "400",
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Iron Log",
  description: "Track workouts, hit PRs, and get smart weight & rep suggestions.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Iron Log",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geo.variable} ${audiowide.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="text-foreground min-h-full flex flex-col">
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="app-aurora" aria-hidden />
            <div className="relative z-0 flex min-h-full flex-1 flex-col">
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}

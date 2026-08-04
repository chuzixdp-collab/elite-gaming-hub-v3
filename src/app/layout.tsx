import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://elitegaminghub.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Elite Gaming Hub — Free Fire Top-Up & Tournaments",
  description:
    "Instant Free Fire diamond top-up, weekly & monthly memberships, and competitive tournaments with real cash prizes. Dominate the battleground with Elite Gaming Hub.",
  keywords: [
    "Free Fire",
    "diamond top up",
    "FF tournaments",
    "Free Fire membership",
    "gaming hub",
    "elite gaming",
  ],
  authors: [{ name: "Elite Gaming Hub" }],
  applicationName: "Elite Gaming Hub",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Elite Gaming Hub — Free Fire Top-Up & Tournaments",
    description: "Instant diamond top-up + cash-prize tournaments. Dominate the battleground.",
    siteName: "Elite Gaming Hub",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Elite Gaming Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elite Gaming Hub — Free Fire Top-Up & Tournaments",
    description: "Instant diamond top-up + cash-prize tournaments. Dominate the battleground.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Elite Gaming Hub",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} antialiased bg-[#0A0A0A] text-white min-h-screen`}
      >
        {children}
        <SonnerToaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "bg-[#141414] border-[#27272A] text-white",
              description: "text-zinc-400",
              success: "border-green-500/40",
              error: "border-red-500/40",
            },
          }}
        />
      </body>
    </html>
  );
}

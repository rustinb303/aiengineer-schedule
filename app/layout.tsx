import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BookmarksAndStarsProvider } from "./contexts/BookmarksAndStarsContext";
import { Suspense } from "react";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "react-hot-toast";
import AccessibilityAudit from "./components/AccessibilityAudit";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://worlds-fair-schedule.agpallav.com/"),
  title: "AI Engineer World's Fair 2025 - Schedule",
  description: "Browse sessions for the 2025 AI Engineer World's Fair.",
  keywords: [
    "AI Engineer",
    "World's Fair",
    "2025",
    "Conference",
    "Schedule",
    "San Francisco",
    "AI",
    "Engineering",
  ],
  authors: [{ name: "AI Engineer World's Fair" }],
  creator: "@pallavmac",

  // Open Graph metadata
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://worlds-fair-schedule.agpallav.com/",
    siteName: "AI Engineer World's Fair 2025",
    title: "AI Engineer World's Fair 2025 - Schedule",
    description: "Browse sessions for the 2025 AI Engineer World's Fair.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Engineer World's Fair 2025",
      },
    ],
  },

  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: "AI Engineer World's Fair 2025 - Schedule",
    description: "Browse sessions for the 2025 AI Engineer World's Fair.",
    images: ["/twitter-image.png"],
    creator: "@pallavmac",
    site: "@pallavmac",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <BookmarksAndStarsProvider>
          <Toaster position="bottom-right" />
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
          <AccessibilityAudit />
        </BookmarksAndStarsProvider>
      </body>
    </html>
  );
}

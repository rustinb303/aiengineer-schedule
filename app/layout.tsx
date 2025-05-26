import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";
import { BookmarksAndStarsProvider } from "./contexts/BookmarksAndStarsContext";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Engineer World's Fair 2025 - Schedule",
  description:
    "Browse and bookmark sessions for the AI Engineer World's Fair 2025 in San Francisco",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased">
          <FirebaseAuthProvider>
            <BookmarksAndStarsProvider>
              {children}
              <Analytics />
            </BookmarksAndStarsProvider>
          </FirebaseAuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

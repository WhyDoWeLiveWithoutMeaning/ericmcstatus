import type { Metadata } from "next";
import { Geist, Geist_Mono, Finger_Paint } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fingerPaint = Finger_Paint({
  weight: "400",
  variable: "--font-finger-paint",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eric's Server Hub",
  description: "Real-time status of Eric's Minecraft servers. Powered by Pelican Panel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fingerPaint.className} antialiased`}>{children}</body>
    </html>
  );
}

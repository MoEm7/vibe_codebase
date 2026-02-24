import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Coffee Carriers | Mobile Brews",
  description:
    "Connecting coffee lovers with the nearest mobile coffee makers — fresh brews, just around the corner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans`}>
        <div className="bg-pattern" />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

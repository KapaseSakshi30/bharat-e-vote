import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { MockBanner } from "@/components/mock-banner";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Bharat E Vote",
  description:
    "Secure digital voting for Indian elections — voter ballot and election officer portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${fraunces.variable} font-sans antialiased`}>
        <div className="bg-atmosphere bg-grid min-h-screen">
          <MockBanner />
          <SiteHeader />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

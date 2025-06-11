import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Henvid", //◁
  description: "under utvikling av ROSARIO",
  keywords: ["henvid", "henvid.com"],
  openGraph: {
    title: "◁Henvid",
    description: "under utvikling av ROSARIO",
    url: "https://app.henvid.com",
    siteName: "Henvid",
    images: [
      {
        url: "https://app.henvid.com/metaimg.jpg",
        width: 1200,
        height: 630,
        alt: "Henvid",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Henvid",
    description: "under utvikling av ROSARIO",

    images: ["https://app.henvid.com/metaimg.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body
        id="scrollbar"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

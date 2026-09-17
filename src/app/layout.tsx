import type { Metadata } from "next";
import localFont from "next/font/local";
import { homeTitle, isIndexable, siteName, siteUrl } from "@/lib/site";
import { siteDescription } from "@/lib/seo";
import "./globals.css";
const sans = localFont({
  src: "../../public/fonts/dm-sans-latin.woff2",
  weight: "400 700",
  variable: "--font-dm-sans",
  display: "swap",
});
const serif = localFont({
  src: "../../public/fonts/fraunces-latin.woff2",
  weight: "400",
  variable: "--font-fraunces",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: { default: homeTitle, template: `%s | ${siteName}` },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    url: siteUrl,
    images: [
      {
        url: "/images/riverfront.webp",
        width: 1920,
        height: 1262,
        alt: "Fox River Recreation riverfront",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: isIndexable, follow: isIndexable },
  // Set once the property is claimed in Google Search Console.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import {
  Barlow_Condensed,
  IBM_Plex_Mono,
  Libre_Caslon_Display,
} from "next/font/google";
import "./globals.css";

const display = Libre_Caslon_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const condensed = Barlow_Condensed({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = "https://sherlock-cold-ember.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sherlock Holmes: The Cold Ember | Interactive Victorian Mystery",
    template: "%s | The Cold Ember",
  },
  description:
    "Ride through 1895 London in an interactive Sherlock Holmes mystery. Examine a hansom-cab route, tobacco ash, footprints, and casebooks to solve The Cold Ember.",
  applicationName: "The Cold Ember",
  authors: [{ name: "The Cold Ember Studio" }],
  creator: "The Cold Ember Studio",
  category: "interactive storytelling",
  keywords: [
    "Sherlock Holmes",
    "interactive mystery",
    "Victorian London",
    "hansom cab",
    "digital storytelling",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "The Cold Ember",
    title: "Sherlock Holmes: The Cold Ember",
    description:
      "A moving casebook in five observations. Ride through London, inspect the evidence, and reach your conclusion.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "The Cold Ember — A Sherlock Holmes Moving Casebook",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sherlock Holmes: The Cold Ember",
    description:
      "Ride through 1895 London in a cinematic, interactive mystery.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06090a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The Cold Ember",
    url: siteUrl,
    description:
      "An original interactive Victorian mystery presented as a moving casebook.",
    inLanguage: "en-US",
    genre: ["Mystery", "Interactive fiction", "Digital experience"],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="64x64" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body className={`${display.variable} ${condensed.variable} ${mono.variable}`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}

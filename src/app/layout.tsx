import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  metadataBase: new URL("https://www.yamlvalidator.pro"),
  title: {
    default: "YAML Config Validator Pro — Online YAML Parser, Formatter & Converter",
    template: "%s — YAML Config Validator Pro",
  },
  description: "Free online YAML validator, formatter, and converter. Parse YAML with live syntax checking, convert between YAML and JSON, and beautify config files instantly. Supports Kubernetes, Docker Compose, and GitHub Actions.",
  keywords: [
    "YAML validator",
    "YAML parser",
    "YAML formatter",
    "YAML to JSON",
    "JSON to YAML",
    "YAML converter",
    "online YAML tool",
    "YAML syntax checker",
    "YAML beautifier",
    "Kubernetes YAML validator",
    "Docker Compose validator",
    "GitHub Actions validator",
    "config validator",
    "YAML lint",
    "YAML editor online",
  ],
  authors: [{ name: "YAML Config Validator Pro", url: "https://www.yamlvalidator.pro" }],
  creator: "YAML Config Validator Pro",
  publisher: "YAML Config Validator Pro",
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
  openGraph: {
    title: "YAML Config Validator Pro",
    description: "Online YAML parser, formatter, and converter with live syntax checking. Validate Kubernetes, Docker Compose, and GitHub Actions YAML files.",
    type: "website",
    url: "https://www.yamlvalidator.pro",
    siteName: "YAML Config Validator Pro",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YAML Config Validator Pro — Online YAML Parser, Formatter & Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAML Config Validator Pro",
    description: "Online YAML parser, formatter, and converter with live syntax checking. Validate Kubernetes, Docker Compose, and GitHub Actions YAML files.",
    images: ["/og-image.png"],
    creator: "@yamlvalidator",
  },
  alternates: {
    canonical: "https://www.yamlvalidator.pro/",
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebApplication",
                  "name": "YAML Config Validator Pro",
                  "url": "https://www.yamlvalidator.pro",
                  "applicationCategory": "DeveloperApplication",
                  "operatingSystem": "Any",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                  },
                  "description": "Free online YAML validator, formatter, and converter with live syntax checking. Supports Kubernetes, Docker Compose, and GitHub Actions YAML files.",
                  "featureList": [
                    "Live YAML syntax validation with line and column error reporting",
                    "YAML to JSON and JSON to YAML conversion",
                    "YAML formatting and beautification",
                    "Kubernetes manifest validation",
                    "Docker Compose file validation",
                    "GitHub Actions workflow validation",
                    "Monaco Editor with syntax highlighting",
                    "Copy and download output",
                  ],
                  "softwareVersion": "1.0.0",
                  "author": {
                    "@type": "Organization",
                    "name": "YAML Config Validator Pro",
                    "url": "https://www.yamlvalidator.pro",
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "Home",
                      "item": "https://www.yamlvalidator.pro/",
                    },
                  ],
                },
              ],
            }),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

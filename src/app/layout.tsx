import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function stringifyJsonLd(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["WebApplication", "SoftwareApplication"],
                  "name": "YAML Config Validator Pro",
                  "url": "https://www.yamlvalidator.pro",
                  "applicationCategory": "DeveloperApplication",
                  "applicationSubCategory": "YAML validator, formatter, and converter",
                  "operatingSystem": "Any",
                  "browserRequirements": "Requires JavaScript. Runs in modern desktop and mobile browsers.",
                  "isAccessibleForFree": true,
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
                    "Load YAML from public URLs with ?url=",
                    "Open local .yaml, .yml, and .json files",
                    "Copy shareable links with YAML content encoded in the URL hash",
                    "Kubernetes manifest validation",
                    "Docker Compose file validation",
                    "GitHub Actions workflow validation",
                    "Monaco Editor with syntax highlighting",
                    "Copy and download output",
                  ],
                  "softwareVersion": "1.1.0",
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
      </body>
    </html>
  );
}

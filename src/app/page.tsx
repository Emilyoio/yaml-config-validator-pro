import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAML Config Validator Pro — Online YAML Parser, Formatter & Converter",
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
  openGraph: {
    title: "YAML Config Validator Pro",
    description: "Online YAML parser, formatter, and converter with live syntax checking. Validate Kubernetes, Docker Compose, and GitHub Actions YAML files.",
    type: "website",
    url: "https://www.yamlvalidator.pro",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAML Config Validator Pro",
    description: "Online YAML parser, formatter, and converter with live syntax checking. Validate Kubernetes, Docker Compose, and GitHub Actions YAML files.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://www.yamlvalidator.pro/",
  },
};

import YamlValidatorPage from "./yaml-validator-page";

export default function Page() {
  return <YamlValidatorPage />;
}

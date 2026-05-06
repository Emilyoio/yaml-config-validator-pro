import type { Metadata } from 'next';
import LegalPage from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for YAML Config Validator Pro. Core YAML validation, formatting, and conversion run locally in your browser; your YAML content is not uploaded to our servers.',
  alternates: {
    canonical: 'https://www.yamlvalidator.pro/privacy/',
  },
  openGraph: {
    title: 'Privacy Policy — YAML Config Validator Pro',
    description: 'Core YAML validation, formatting, and conversion run locally in your browser.',
    url: 'https://www.yamlvalidator.pro/privacy/',
    type: 'website',
    images: ['/og-image.png'],
  },
};

const sections = [
  {
    title: '1. What this policy covers',
    body: 'This Privacy Policy explains how YAML Config Validator Pro handles information when you use our online YAML parser, formatter, converter, and scenario validator pages.',
  },
  {
    title: '2. YAML and JSON content you enter',
    items: [
      'Core validation, formatting, YAML to JSON conversion, JSON to YAML conversion, copy, download, reset, drag-and-drop loading, and Tree View rendering run in your browser.',
      'We do not intentionally collect, upload, store, sell, or share the YAML or JSON content you paste, type, or drag into the editor for these core tool actions.',
      'You should still avoid pasting real secrets, API keys, passwords, private certificates, production tokens, or sensitive personal data into any online tool.',
    ],
  },
  {
    title: '3. Technical information',
    items: [
      'Like most websites, hosting and security infrastructure may process standard request information such as IP address, user agent, requested URL, timestamps, and error logs.',
      'We use this technical information to keep the site available, secure, and reliable, and to troubleshoot abuse or operational issues.',
      'We do not use technical logs to reconstruct or store the YAML or JSON text you process in the editor.',
    ],
  },
  {
    title: '4. Analytics and cookies',
    items: [
      'The current core tool does not require an account or payment to validate YAML.',
      'If we add analytics, performance measurement, advertising pixels, or cookie-based features, we will update this policy and provide the notices or choices required by applicable law.',
      'Your browser may still store ordinary site assets or preferences needed to load and render the website.',
    ],
  },
  {
    title: '5. Third-party services',
    items: [
      'Our website may be delivered through hosting, CDN, DNS, security, and monitoring providers that process ordinary web request metadata.',
      'The core YAML editor does not send your pasted YAML or JSON content to an AI API, storage bucket, payment provider, or email service.',
      'If future Pro features add AI repair, accounts, saved history, uploads, or payments, those features will receive a separate data-flow review before launch.',
    ],
  },
  {
    title: '6. Data retention',
    items: [
      'Editor content remains in your browser session and is not saved by us as part of the current free tool.',
      'Operational logs, if collected by infrastructure providers, are kept only as needed for security, abuse prevention, debugging, and legal compliance.',
    ],
  },
  {
    title: '7. Your choices',
    items: [
      'You can clear editor content with the Reset button or by closing the page.',
      'You can control browser storage, cache, and cookies through your browser settings.',
      'If you contact us about privacy, include enough detail for us to understand the request without sending sensitive YAML content.',
    ],
  },
  {
    title: '8. Children',
    body: 'YAML Config Validator Pro is a developer tool and is not directed to children. We do not knowingly collect personal information from children.',
  },
  {
    title: '9. Changes to this policy',
    body: 'We may update this policy as the product changes. Material changes will be reflected on this page with a new updated date.',
  },
  {
    title: '10. Contact',
    body: 'For privacy questions, open an issue or contact the site operator through the YAML Config Validator Pro repository: https://github.com/Emilyoio/yaml-config-validator-pro. Do not include sensitive YAML, API keys, private tokens, or personal data in public reports.',
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="Core YAML validation, formatting, conversion, and Tree View inspection run locally in your browser. This page documents the current low-risk, browser-local data handling model."
      updatedAt="May 6, 2026"
      sections={sections}
    />
  );
}

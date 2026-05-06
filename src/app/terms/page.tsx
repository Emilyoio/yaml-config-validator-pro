import type { Metadata } from 'next';
import LegalPage from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for YAML Config Validator Pro, a free browser-local YAML parser, formatter, and converter for developers.',
  alternates: {
    canonical: 'https://www.yamlvalidator.pro/terms/',
  },
  openGraph: {
    title: 'Terms of Service — YAML Config Validator Pro',
    description: 'Terms for using the free browser-local YAML validator, formatter, and converter.',
    url: 'https://www.yamlvalidator.pro/terms/',
    type: 'website',
    images: ['/og-image.png'],
  },
};

const sections = [
  {
    title: '1. Acceptance of terms',
    body: 'By using YAML Config Validator Pro, you agree to these Terms of Service. If you do not agree, do not use the site.',
  },
  {
    title: '2. Service description',
    items: [
      'YAML Config Validator Pro provides free browser-based YAML validation, formatting, conversion, and parsed Tree View inspection.',
      'The tool is intended for developers, DevOps teams, technical writers, and other users who need to inspect configuration files.',
      'The current free tool does not provide account storage, team collaboration, paid subscriptions, or guaranteed support-level agreements.',
    ],
  },
  {
    title: '3. Browser-local processing and sensitive content',
    items: [
      'Core tool actions run in your browser and are designed not to upload YAML or JSON editor content to our servers.',
      'You are responsible for the content you paste, type, drag, copy, or download.',
      'Do not paste real secrets, private keys, passwords, access tokens, personal data, confidential production configs, or regulated data unless you have verified that doing so is allowed by your organization.',
    ],
  },
  {
    title: '4. No professional or platform guarantee',
    items: [
      'Validation checks YAML syntax and parsed structure; it is not a substitute for platform-specific checks such as kubectl dry-run, docker compose config, GitHub workflow validation, or security review.',
      'The tool may not detect every semantic, schema, policy, or runtime issue in Kubernetes, Docker Compose, GitHub Actions, or other systems.',
      'You should test configuration files in the appropriate target environment before using them in production.',
    ],
  },
  {
    title: '5. Acceptable use',
    items: [
      'Do not use the site to attack, overload, reverse engineer, scrape abusively, or interfere with the service or its infrastructure.',
      'Do not attempt to bypass security controls or use the service in a way that violates applicable law or third-party rights.',
      'Do not misrepresent the tool as an official validator from Kubernetes, Docker, GitHub, or any other third-party platform.',
    ],
  },
  {
    title: '6. Availability and changes',
    items: [
      'The service is provided as available and may change, pause, or stop without prior notice.',
      'We may add, remove, or modify features, examples, scenario pages, metadata, or documentation as the product evolves.',
    ],
  },
  {
    title: '7. Disclaimer of warranties',
    body: 'The service is provided “as is” and “as available” without warranties of any kind. We do not guarantee that outputs are complete, correct, secure, or suitable for your production environment.',
  },
  {
    title: '8. Limitation of liability',
    body: 'To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, business, or goodwill arising from use of the site.',
  },
  {
    title: '9. Third-party names',
    body: 'Kubernetes, Docker, GitHub, and other third-party names are used descriptively to identify configuration scenarios. This site is not affiliated with or endorsed by those platforms unless explicitly stated.',
  },
  {
    title: '10. Future paid or AI features',
    body: 'If future features add accounts, saved history, AI-powered repair, uploads, payments, subscriptions, or credits, additional terms, privacy disclosures, refund rules, and usage limits may apply before those features launch.',
  },
  {
    title: '11. Contact',
    body: 'For questions about these terms, use the Contact link on this site or contact the site operator through the project channel where this tool is published.',
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms describe the current free, browser-local YAML validation tool and set boundaries for safe use."
      updatedAt="May 6, 2026"
      sections={sections}
    />
  );
}

import { Metadata } from 'next';
import YamlValidatorPage from '../../yaml-validator-page';

const canonical = 'https://www.yamlvalidator.pro/validator/github-actions/';
function stringifyJsonLd(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

const faqs = [
  {
    q: 'Does this run GitHub Actions validation?',
    a: 'No. It validates YAML syntax locally. GitHub still performs workflow-specific validation when the file is pushed.',
  },
  {
    q: 'Why does the on key matter?',
    a: 'Older YAML parsers may interpret on as a boolean. Inspecting parsed JSON helps confirm that the workflow trigger remains a string key.',
  },
  {
    q: 'Can I paste workflows with secrets references?',
    a: 'The tool runs in your browser and does not upload content. Still, avoid pasting real secret values; use GitHub secrets references instead.',
  },
];

export const metadata: Metadata = {
  title: 'GitHub Actions YAML Validator — Online Workflow Checker',
  description: 'Validate GitHub Actions workflow YAML before pushing to .github/workflows. Check triggers, jobs, steps, matrices, env, permissions, and reusable workflow inputs with live feedback.',
  keywords: ['GitHub Actions validator', 'GitHub Actions YAML checker', 'workflow file validator', 'CI YAML validator', 'GitHub Actions syntax check', 'GitHub workflow validator', '.github workflows checker', 'CI/CD YAML parser'],
  openGraph: {
    title: 'GitHub Actions YAML Validator — YAML Config Validator Pro',
    description: 'Validate GitHub Actions workflow YAML with live syntax checking, Tree View inspection, and precise error line numbers.',
    type: 'website',
    url: canonical,
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Actions YAML Validator',
    description: 'Validate GitHub Actions workflow YAML with live syntax checking, Tree View inspection, and precise error line numbers.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical,
  },
};

export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'GitHub Actions YAML Validator',
        url: canonical,
        description: metadata.description,
        isPartOf: { '@type': 'WebSite', name: 'YAML Config Validator Pro', url: 'https://www.yamlvalidator.pro/' },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'GitHub Actions YAML Validator',
        url: canonical,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Live YAML syntax validation',
          'Public URL loading with ?url=',
          'Open local YAML files',
          'Copy shareable YAML links',
          'Tree View parsed structure inspection',
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.yamlvalidator.pro/' },
          { '@type': 'ListItem', position: 2, name: 'GitHub Actions YAML Validator', item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: stringifyJsonLd(schema) }} />
      <YamlValidatorPage defaultScenario="github-actions" />
    </>
  );
}

import { Metadata } from 'next';
import YamlValidatorPage from '../../yaml-validator-page';

const canonical = 'https://www.yamlvalidator.pro/validator/helm-values/';
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
    q: 'Does this run helm lint or render templates?',
    a: 'No. This page validates YAML syntax and parsed structure only. Run helm lint or helm template for chart rendering, Go template, and Kubernetes semantic checks.',
  },
  {
    q: 'Can I validate rendered Helm output here?',
    a: 'Yes. Paste rendered YAML from helm template to catch syntax and indentation errors before applying it, but still use Kubernetes validation for API schema rules.',
  },
  {
    q: 'Are chart values uploaded to a server?',
    a: 'Core validation, formatting, conversion, and Tree View run in your browser. Avoid pasting real secrets; use placeholders or secret references for sensitive values.',
  },
];

export const metadata: Metadata = {
  title: 'Helm Values YAML Validator — Online values.yaml Checker',
  description: 'Validate Helm values.yaml syntax online before helm lint or helm template. Check indentation, nested maps, lists, and generated values files with live line and column feedback.',
  keywords: ['Helm values YAML validator', 'values.yaml checker', 'Helm values checker', 'validate values.yaml online', 'Helm YAML parser', 'Helm values syntax checker', 'helm template YAML checker', 'Helm chart values validator'],
  openGraph: {
    title: 'Helm Values YAML Validator — YAML Config Validator Pro',
    description: 'Validate values.yaml files with live syntax checking, Tree View inspection, and precise YAML error line numbers.',
    type: 'website',
    url: canonical,
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Helm Values YAML Validator',
    description: 'Validate values.yaml files with live syntax checking, Tree View inspection, and precise YAML error line numbers.',
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
        name: 'Helm Values YAML Validator',
        url: canonical,
        description: metadata.description,
        isPartOf: { '@type': 'WebSite', name: 'YAML Config Validator Pro', url: 'https://www.yamlvalidator.pro/' },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Helm Values YAML Validator',
        url: canonical,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Live YAML syntax validation',
          'values.yaml formatting and cleanup',
          'YAML to JSON conversion for parsed values review',
          'Open local YAML files',
          'Tree View parsed structure inspection',
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.yamlvalidator.pro/' },
          { '@type': 'ListItem', position: 2, name: 'Helm Values YAML Validator', item: canonical },
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
      <YamlValidatorPage defaultScenario="helm-values" />
    </>
  );
}

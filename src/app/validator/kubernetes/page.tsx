import { Metadata } from 'next';
import YamlValidatorPage from '../../yaml-validator-page';

const canonical = 'https://www.yamlvalidator.pro/validator/kubernetes/';
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
    q: 'Does this replace kubectl dry-run?',
    a: 'No. This page validates YAML syntax and parsed structure in the browser. Use kubectl --dry-run=server for Kubernetes API schema and admission checks.',
  },
  {
    q: 'Can it validate Helm or Kustomize output?',
    a: 'Yes. Render the chart or overlay first, then paste the generated YAML here to catch syntax and indentation issues before applying it.',
  },
  {
    q: 'Are Kubernetes secrets uploaded?',
    a: 'No. Validation runs locally in your browser, so pasted manifests are not sent to a server.',
  },
];

export const metadata: Metadata = {
  title: 'Kubernetes YAML Validator — Online K8s Manifest Checker',
  description: 'Validate Kubernetes YAML manifests online before kubectl apply. Check Deployments, Services, ConfigMaps, Secrets, Ingress, and Helm/Kustomize output with live line and column feedback.',
  keywords: ['Kubernetes YAML validator', 'K8s manifest validator', 'Kubernetes config checker', 'Deployment YAML validator', 'Kubernetes syntax check', 'kubectl apply YAML checker', 'Helm output validator', 'Kustomize YAML validator'],
  openGraph: {
    title: 'Kubernetes YAML Validator — YAML Config Validator Pro',
    description: 'Validate Kubernetes manifests with live syntax checking, Tree View inspection, and precise error line numbers.',
    type: 'website',
    url: canonical,
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kubernetes YAML Validator',
    description: 'Validate Kubernetes manifests with live syntax checking, Tree View inspection, and precise error line numbers.',
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
        name: 'Kubernetes YAML Validator',
        url: canonical,
        description: metadata.description,
        isPartOf: { '@type': 'WebSite', name: 'YAML Config Validator Pro', url: 'https://www.yamlvalidator.pro/' },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Kubernetes YAML Validator',
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
          { '@type': 'ListItem', position: 2, name: 'Kubernetes YAML Validator', item: canonical },
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
      <YamlValidatorPage defaultScenario="kubernetes" />
    </>
  );
}

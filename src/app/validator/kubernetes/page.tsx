import { Metadata } from 'next';
import YamlValidatorPage from '../../yaml-validator-page';

export const metadata: Metadata = {
  title: 'Kubernetes YAML Validator — Online K8s Manifest Checker',
  description: 'Validate Kubernetes YAML manifests online. Check Deployments, Services, ConfigMaps, and Pods for syntax errors with live validation and precise error line numbers.',
  keywords: ['Kubernetes YAML validator', 'K8s manifest validator', 'Kubernetes config checker', 'Deployment YAML validator', 'Kubernetes syntax check'],
  openGraph: {
    title: 'Kubernetes YAML Validator — YAML Config Validator Pro',
    description: 'Validate Kubernetes YAML manifests with live syntax checking and precise error line numbers.',
    type: 'website',
    url: 'https://yamlvalidator.pro/validator/kubernetes/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kubernetes YAML Validator',
    description: 'Validate Kubernetes YAML manifests with live syntax checking and precise error line numbers.',
  },
  alternates: {
    canonical: 'https://yamlvalidator.pro/validator/kubernetes/',
  },
};

export default function Page() {
  return <YamlValidatorPage defaultScenario="kubernetes" />;
}

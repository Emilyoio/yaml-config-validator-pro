import { Metadata } from 'next';
import YamlValidatorPage from '../../yaml-validator-page';

export const metadata: Metadata = {
  title: 'GitHub Actions YAML Validator — Online Workflow Checker',
  description: 'Validate GitHub Actions workflow YAML files online. Check .github/workflows syntax with live validation, precise error line numbers, and CI/CD config linting.',
  keywords: ['GitHub Actions validator', 'GitHub Actions YAML checker', 'workflow file validator', 'CI YAML validator', 'GitHub Actions syntax check'],
  openGraph: {
    title: 'GitHub Actions YAML Validator — YAML Config Validator Pro',
    description: 'Validate GitHub Actions workflow YAML files with live syntax checking and precise error line numbers.',
    type: 'website',
    url: 'https://yamlvalidator.pro/validator/github-actions/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Actions YAML Validator',
    description: 'Validate GitHub Actions workflow YAML files with live syntax checking and precise error line numbers.',
  },
  alternates: {
    canonical: 'https://yamlvalidator.pro/validator/github-actions/',
  },
};

export default function Page() {
  return <YamlValidatorPage defaultScenario="github-actions" />;
}

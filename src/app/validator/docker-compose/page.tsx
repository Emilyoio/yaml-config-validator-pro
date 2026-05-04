import { Metadata } from 'next';
import YamlValidatorPage from '../../yaml-validator-page';

export const metadata: Metadata = {
  title: 'Docker Compose YAML Validator — Online Compose File Checker',
  description: 'Validate Docker Compose YAML files online. Check docker-compose.yml syntax with live validation, service config linting, and precise error line numbers.',
  keywords: ['Docker Compose validator', 'docker-compose.yml checker', 'Docker Compose YAML validator', 'Docker config validator', 'Compose file syntax check'],
  openGraph: {
    title: 'Docker Compose YAML Validator — YAML Config Validator Pro',
    description: 'Validate Docker Compose YAML files with live syntax checking and precise error line numbers.',
    type: 'website',
    url: 'https://www.yamlvalidator.pro/validator/docker-compose/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Docker Compose YAML Validator',
    description: 'Validate Docker Compose YAML files with live syntax checking and precise error line numbers.',
  },
  alternates: {
    canonical: 'https://www.yamlvalidator.pro/validator/docker-compose/',
  },
};

export default function Page() {
  return <YamlValidatorPage defaultScenario="docker-compose" />;
}

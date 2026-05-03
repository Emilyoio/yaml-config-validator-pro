import { validateYaml } from '@/lib/yaml/engine';
import type { ScenarioConfig } from './types';

export const dockerComposeScenario: ScenarioConfig = {
  id: 'docker-compose',
  name: 'Docker Compose',
  description: 'Validate Docker Compose configuration files',
  icon: 'container',
  validateFn: (input: string) => {
    const base = validateYaml(input);
    return {
      valid: base.valid,
      errors: base.errors.map(e => ({ ...e, severity: 'error' as const })),
    };
  },
};

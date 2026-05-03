import { validateYaml } from '@/lib/yaml/engine';
import type { ScenarioConfig } from './types';

export const githubActionsScenario: ScenarioConfig = {
  id: 'github-actions',
  name: 'GitHub Actions',
  description: 'Validate GitHub Actions workflow files',
  icon: 'workflow',
  validateFn: (input: string) => {
    const base = validateYaml(input);
    // TODO: Add GHA-specific schema validation
    return {
      valid: base.valid,
      errors: base.errors.map(e => ({ ...e, severity: 'error' as const })),
    };
  },
};

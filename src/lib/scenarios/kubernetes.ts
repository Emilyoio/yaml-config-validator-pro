import { validateYaml } from '@/lib/yaml/engine';
import type { ScenarioConfig } from './types';

export const kubernetesScenario: ScenarioConfig = {
  id: 'kubernetes',
  name: 'Kubernetes',
  description: 'Validate Kubernetes manifests (Deployments, Services, ConfigMaps, etc.)',
  icon: 'box',
  validateFn: (input: string) => {
    const base = validateYaml(input);
    // TODO: Add k8s-specific schema validation
    return {
      valid: base.valid,
      errors: base.errors.map(e => ({ ...e, severity: 'error' as const })),
    };
  },
};

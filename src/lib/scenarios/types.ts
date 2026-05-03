export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  validateFn: (input: string) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    message: string;
    line?: number;
    column?: number;
    severity: 'error' | 'warning';
  }>;
}

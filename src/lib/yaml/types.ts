export type ValidationResult = {
  valid: boolean;
  errors: YamlError[];
  data: unknown | null;
};

export type YamlError = {
  message: string;
  line?: number;
  column?: number;
  reason?: string;
};

export type FormatResult = {
  formatted: string;
  valid: boolean;
  error?: string;
};

export type ConvertResult = {
  output: string;
  valid: boolean;
  error?: string;
};

export type EditorMode = 'yaml' | 'json';

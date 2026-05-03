import yaml from 'js-yaml';
import type { ValidationResult, YamlError, FormatResult, ConvertResult } from './types';

export function validateYaml(input: string): ValidationResult {
  if (!input.trim()) {
    return { valid: false, errors: [{ message: 'Empty input' }], data: null };
  }

  try {
    const doc = yaml.load(input);
    return { valid: true, errors: [], data: doc };
  } catch (err) {
    const errors: YamlError[] = [];
    if (err instanceof yaml.YAMLException) {
      const mark = err.mark;
      errors.push({
        message: err.message,
        line: mark?.line ? mark.line + 1 : undefined,
        column: mark?.column ? mark.column + 1 : undefined,
        reason: err.reason,
      });
    } else {
      errors.push({ message: err instanceof Error ? err.message : 'Unknown error' });
    }
    return { valid: false, errors, data: null };
  }
}

export function formatYaml(input: string): FormatResult {
  if (!input.trim()) {
    return { formatted: '', valid: false, error: 'Empty input' };
  }

  try {
    const doc = yaml.load(input);
    const formatted = yaml.dump(doc, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
    return { formatted, valid: true };
  } catch (err) {
    return {
      formatted: input,
      valid: false,
      error: err instanceof Error ? err.message : 'Format failed',
    };
  }
}

export function yamlToJson(input: string): ConvertResult {
  if (!input.trim()) {
    return { output: '', valid: false, error: 'Empty input' };
  }

  try {
    const doc = yaml.load(input);
    const output = JSON.stringify(doc, null, 2);
    return { output, valid: true };
  } catch (err) {
    return {
      output: '',
      valid: false,
      error: err instanceof Error ? err.message : 'Conversion failed',
    };
  }
}

export function jsonToYaml(input: string): ConvertResult {
  if (!input.trim()) {
    return { output: '', valid: false, error: 'Empty input' };
  }

  try {
    const doc = JSON.parse(input);
    const output = yaml.dump(doc, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
    return { output, valid: true };
  } catch (err) {
    return {
      output: '',
      valid: false,
      error: err instanceof Error ? err.message : 'Conversion failed',
    };
  }
}

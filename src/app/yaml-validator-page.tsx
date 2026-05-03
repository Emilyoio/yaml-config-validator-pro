'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { validateYaml, formatYaml, yamlToJson, jsonToYaml } from '@/lib/yaml/engine';
import type { ValidationResult, FormatResult, ConvertResult, EditorMode } from '@/lib/yaml/types';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode2,
  Copy,
  Download,
  RotateCcw,
} from 'lucide-react';

type ToolTab = 'validate' | 'format' | 'convert';
type ConvertDirection = 'yaml-to-json' | 'json-to-yaml';

const SCENARIOS: Record<string, string> = {
  default: `name: example-app
version: 1.0.0
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      NODE_ENV: production
      API_KEY: your-api-key-here
  db:
    image: postgres:15
    volumes:
      - db_data:/var/lib/postgresql/data
`,
  kubernetes: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.14.2
          ports:
            - containerPort: 80
`,
  'docker-compose': `version: "3.8"
services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - .:/code
      - logvolume01:/var/log
    links:
      - redis
  redis:
    image: redis
volumes:
  logvolume01: {}
`,
  'github-actions': `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
`,
};

interface YamlValidatorPageProps {
  defaultScenario?: string;
}

export default function YamlValidatorPage({ defaultScenario }: YamlValidatorPageProps) {
  const initialInput = defaultScenario && SCENARIOS[defaultScenario] ? SCENARIOS[defaultScenario] : SCENARIOS.default;
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState<ToolTab>('validate');
  const [convertDirection, setConvertDirection] = useState<ConvertDirection>('yaml-to-json');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [formatResult, setFormatResult] = useState<FormatResult | null>(null);
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [copied, setCopied] = useState(false);

  const inputMode: EditorMode = activeTab === 'convert' && convertDirection === 'json-to-yaml' ? 'json' : 'yaml';
  const outputMode: EditorMode = activeTab === 'convert' && convertDirection === 'yaml-to-json' ? 'json' : 'yaml';

  const runValidation = useCallback(() => {
    const result = validateYaml(input);
    setValidation(result);
    if (result.valid && result.data) {
      setOutput(JSON.stringify(result.data, null, 2));
    } else {
      setOutput('');
    }
  }, [input]);

  const runFormat = useCallback(() => {
    const result = formatYaml(input);
    setFormatResult(result);
    if (result.valid) {
      setOutput(result.formatted);
    } else {
      setOutput('');
    }
  }, [input]);

  const runConvert = useCallback(() => {
    const result =
      convertDirection === 'yaml-to-json'
        ? yamlToJson(input)
        : jsonToYaml(input);
    setConvertResult(result);
    if (result.valid) {
      setOutput(result.output);
    } else {
      setOutput('');
    }
  }, [input, convertDirection]);

  useEffect(() => {
    if (activeTab === 'validate') runValidation();
    if (activeTab === 'format') runFormat();
    if (activeTab === 'convert') runConvert();
  }, [input, activeTab, convertDirection, runValidation, runFormat, runConvert]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'convert' && convertDirection === 'json-to-yaml' ? 'output.yaml' : 'output.json';
    if (activeTab === 'format') a.download = 'formatted.yaml';
    if (activeTab === 'validate') a.download = 'parsed.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput(SCENARIOS.default);
  };

  const statusBadge = (valid: boolean) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        valid
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
          : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
      }`}
    >
      {valid ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {valid ? 'Valid' : 'Invalid'}
    </span>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-5 w-5 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">YAML Config Validator Pro</h1>
        </div>
        <div className="flex items-center gap-1.5">
          {(['validate', 'format', 'convert'] as ToolTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {tab === 'validate' && 'Validate'}
              {tab === 'format' && 'Format'}
              {tab === 'convert' && 'Convert'}
            </button>
          ))}
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2">
        <div className="flex items-center gap-2">
          {activeTab === 'convert' && (
            <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
              <button
                onClick={() => setConvertDirection('yaml-to-json')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  convertDirection === 'yaml-to-json'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                YAML → JSON
              </button>
              <button
                onClick={() => setConvertDirection('json-to-yaml')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  convertDirection === 'json-to-yaml'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                JSON → YAML
              </button>
            </div>
          )}
          {activeTab === 'validate' && validation && statusBadge(validation.valid)}
          {activeTab === 'format' && formatResult && statusBadge(formatResult.valid)}
          {activeTab === 'convert' && convertResult && statusBadge(convertResult.valid)}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output} className="h-7 gap-1 text-xs">
            <Copy className="h-3.5 w-3.5" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!output} className="h-7 gap-1 text-xs">
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 gap-1 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Input Panel */}
        <div className="flex flex-1 flex-col border-b lg:border-b-0 lg:border-r border-border min-h-[40vh] lg:min-h-0">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {inputMode === 'yaml' ? 'YAML Input' : 'JSON Input'}
            </span>
            <span className="text-xs text-muted-foreground">{input.length} chars</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={inputMode}
              value={input}
              onChange={(value) => setInput(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                folding: true,
                renderWhitespace: 'boundary',
                formatOnPaste: false,
                formatOnType: false,
              }}
              theme="vs-dark"
              loading={
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Loading editor...
                </div>
              }
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-1 flex-col min-h-[40vh] lg:min-h-0">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {activeTab === 'validate' ? 'Parsed Result (JSON)' : activeTab === 'format' ? 'Formatted YAML' : outputMode === 'json' ? 'JSON Output' : 'YAML Output'}
            </span>
            <span className="text-xs text-muted-foreground">{output.length} chars</span>
          </div>
          <div className="relative flex-1">
            {output ? (
              <Editor
                height="100%"
                language={outputMode}
                value={output}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  readOnly: true,
                  folding: true,
                  renderWhitespace: 'boundary',
                }}
                theme="vs-dark"
                loading={
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Loading editor...
                  </div>
                }
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 opacity-40" />
                <p className="text-sm">No output yet</p>
                <p className="text-xs opacity-60">
                  {activeTab === 'validate' && 'Enter valid YAML to see parsed result'}
                  {activeTab === 'format' && 'Enter YAML to see formatted output'}
                  {activeTab === 'convert' && 'Enter content to see converted output'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Panel */}
      {activeTab === 'validate' && validation && !validation.valid && validation.errors.length > 0 && (
        <div className="border-t border-border bg-red-50 dark:bg-red-950/20 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            Validation Errors ({validation.errors.length})
          </div>
          <ul className="mt-2 space-y-1.5">
            {validation.errors.map((err, idx) => (
              <li key={idx} className="text-xs text-red-600 dark:text-red-300">
                {err.line && <span className="font-mono font-medium">Line {err.line}</span>}
                {err.column && <span className="font-mono font-medium">, Col {err.column}</span>}
                {': '}
                {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'format' && formatResult && !formatResult.valid && (
        <div className="border-t border-border bg-red-50 dark:bg-red-950/20 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            Format Error
          </div>
          <p className="mt-1 text-xs text-red-600 dark:text-red-300">{formatResult.error}</p>
        </div>
      )}

      {activeTab === 'convert' && convertResult && !convertResult.valid && (
        <div className="border-t border-border bg-red-50 dark:bg-red-950/20 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            Conversion Error
          </div>
          <p className="mt-1 text-xs text-red-600 dark:text-red-300">{convertResult.error}</p>
        </div>
      )}
    </div>
  );
}

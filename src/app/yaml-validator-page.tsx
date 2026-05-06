'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import TreeView from '@/components/tree-view';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { validateYaml, formatYaml, yamlToJson, jsonToYaml } from '@/lib/yaml/engine';
import type { ValidationResult, FormatResult, ConvertResult, EditorMode } from '@/lib/yaml/types';
import { Button } from '@/components/ui/button';
import Hero from '@/components/hero';
import Features from '@/components/features';
import ScenarioSeoContent from '@/components/scenario-seo-content';
import FAQ from '@/components/faq';
import Footer from '@/components/footer';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode2,
  Copy,
  Download,
  RotateCcw,
  Moon,
  Sun,
  SplitSquareHorizontal,
} from 'lucide-react';

type ToolTab = 'validate' | 'format' | 'convert';
type ConvertDirection = 'yaml-to-json' | 'json-to-yaml';
type OutputView = 'raw' | 'tree';

type MonacoEditorRef = {
  getModel: () => unknown;
  setValue: (value: string) => void;
};

type MonacoApiRef = {
  editor: {
    setModelMarkers: (model: unknown, owner: string, markers: Array<{
      severity: number;
      message: string;
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    }>) => void;
  };
  MarkerSeverity?: { Error: number };
};

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

// Debounce hook to prevent editor freeze on rapid typing
function useDebouncedCallback<T extends (text: string, tab: ToolTab, direction: ConvertDirection) => void>(
  callback: T,
  delay: number
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(
    (text: string, tab: ToolTab, direction: ConvertDirection) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        callback(text, tab, direction);
      }, delay);
    },
    [callback, delay]
  );
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
  const [statusMessage, setStatusMessage] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [outputView, setOutputView] = useState<OutputView>('raw');
  const editorRef = useRef<MonacoEditorRef | null>(null);
  const [monaco, setMonaco] = useState<MonacoApiRef | null>(null);

  const inputMode: EditorMode = activeTab === 'convert' && convertDirection === 'json-to-yaml' ? 'json' : 'yaml';
  const outputMode: EditorMode = activeTab === 'convert' && convertDirection === 'yaml-to-json' ? 'json' : 'yaml';

  const applyValidationMarkers = useCallback((result: ValidationResult) => {
    if (!monaco || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;
    const severity = monaco.MarkerSeverity?.Error ?? 8;
    const markers = result.valid
      ? []
      : result.errors.map((err) => {
          const line = err.line ?? 1;
          const column = err.column ?? 1;
          return {
            severity,
            message: err.reason || err.message,
            startLineNumber: line,
            startColumn: column,
            endLineNumber: line,
            endColumn: column + 1,
          };
        });
    monaco.editor.setModelMarkers(model, 'yaml-validator', markers);
  }, [monaco]);

  const handleEditorMount = useCallback((editor: MonacoEditorRef, monacoInstance: MonacoApiRef) => {
    editorRef.current = editor;
    setMonaco(monacoInstance);
  }, []);

  // Live processing functions
  const runValidation = useCallback((text: string) => {
    const result = validateYaml(text);
    setValidation(result);
    applyValidationMarkers(result);
    if (result.valid && result.data !== null && result.data !== undefined) {
      setOutput(JSON.stringify(result.data, null, 2));
    } else {
      setOutput('');
    }
  }, [applyValidationMarkers]);

  const runFormat = useCallback((text: string) => {
    const result = formatYaml(text);
    setFormatResult(result);
    if (result.valid) {
      setOutput(result.formatted);
    } else {
      setOutput('');
    }
  }, []);

  const runConvert = useCallback((text: string, direction: ConvertDirection) => {
    if (monaco && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) monaco.editor.setModelMarkers(model, 'yaml-validator', []);
    }
    const result =
      direction === 'yaml-to-json'
        ? yamlToJson(text)
        : jsonToYaml(text);
    setConvertResult(result);
    if (result.valid) {
      setOutput(result.output);
      if(direction === 'yaml-to-json') {
          try {
              const validationResult = validateYaml(text);
              setValidation(validationResult);
          } catch {
              setValidation({ valid: false, errors: [], data: null });
          }
      } else {
          try {
            setValidation({ valid: true, errors: [], data: JSON.parse(text) });
          } catch {
            setValidation({ valid: false, errors: [], data: null });
          }
          setOutputView('raw');
      }
    } else {
      setOutput('');
      setOutputView('raw');
      setValidation({ valid: false, errors: [], data: null });
    }
  }, [monaco]);

  const processInput = useCallback((text: string, tab: ToolTab, direction: ConvertDirection) => {
    if (tab === 'validate') runValidation(text);
    if (tab === 'format') runFormat(text);
    if (tab === 'convert') runConvert(text, direction);
  }, [runValidation, runFormat, runConvert]);

  // Debounced live update to prevent editor freeze
  const debouncedUpdate = useDebouncedCallback(processInput, 300);

  // Immediate update on tab/direction change
  useEffect(() => {
    const id = setTimeout(() => {
      processInput(input, activeTab, convertDirection);
    }, 0);
    return () => clearTimeout(id);
  }, [activeTab, convertDirection, processInput, input]);

  // Live render on input change (debounced)
  useEffect(() => {
    debouncedUpdate(input, activeTab, convertDirection);
  }, [input, activeTab, convertDirection, debouncedUpdate]);

  const { isDragging, handleDragEnter, handleDragLeave, handleDragOver, handleDrop } = useDragAndDrop(
    (content) => {
      setInput(content);
      editorRef.current?.setValue(content);
      setStatusMessage('File loaded into editor');
      setTimeout(() => setStatusMessage(''), 1800);
    },
    () => {
      setStatusMessage('Drop a .yaml, .yml, or .json file');
      setTimeout(() => setStatusMessage(''), 2200);
    }
  );

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setStatusMessage('Output copied to clipboard');
    setTimeout(() => {
      setCopied(false);
      setStatusMessage('');
    }, 1500);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'convert' && convertDirection === 'json-to-yaml' ? 'output.yaml' : 'output.json';
    if (activeTab === 'format') a.download = 'formatted.yaml';
    if (activeTab === 'validate') a.download = 'validation-result.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage(`Downloaded ${a.download}`);
    setTimeout(() => setStatusMessage(''), 1800);
  };

  const handleReset = () => {
    const scenarioKey = defaultScenario && SCENARIOS[defaultScenario] ? defaultScenario : 'default';
    const newValue = SCENARIOS[scenarioKey];
    setInput(newValue);
    editorRef.current?.setValue(newValue);
    setOutput('');
    setValidation(null);
    setFormatResult(null);
    setConvertResult(null);
    setOutputView('raw');
    if (monaco && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) monaco.editor.setModelMarkers(model, 'yaml-validator', []);
    }
    setStatusMessage('Editor reset');
    setTimeout(() => setStatusMessage(''), 1500);
  };

  const statusBadge = (valid: boolean) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        valid
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
          : 'bg-red-500/15 text-red-400 border border-red-500/25'
      }`}
    >
      {valid ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {valid ? 'Valid' : 'Invalid'}
    </span>
  );

  const editorTheme = isDark ? 'vs-dark' : 'vs';
  const bgClass = isDark ? 'bg-[#0d1117]' : 'bg-white';
  const headerBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-50 border-gray-200';
  const toolbarBg = isDark ? 'bg-[#0d1117]/80 border-[#30363d]' : 'bg-white/80 border-gray-200';
  const textMuted = isDark ? 'text-[#8b949e]' : 'text-gray-500';
  const textNormal = isDark ? 'text-[#c9d1d9]' : 'text-gray-900';
  const panelBg = isDark ? 'bg-[#0d1117]' : 'bg-gray-50';
  const activeTabBg = isDark ? 'bg-[#238636] text-white' : 'bg-emerald-600 text-white';
  const inactiveTabBg = isDark
    ? 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900';
  const errorBg = isDark ? 'bg-red-950/30 border-red-900/50' : 'bg-red-50 border-red-200';
  const errorText = isDark ? 'text-red-400' : 'text-red-600';
  const errorTitle = isDark ? 'text-red-300' : 'text-red-700';

  return (
    <div className={`flex flex-col ${bgClass} transition-colors duration-300`}>
      {/* Hero */}
      <Hero />

      {/* Editor Section */}
      <div
        id="editor"
        className={`relative flex flex-col ${isDragging ? 'ring-2 ring-emerald-400 ring-offset-0' : ''}`}
        style={{ height: 'calc(100vh - 64px)' }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Header */}
        <header className={`border-b px-4 py-3 flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25">
              <FileCode2 className="h-4 w-4 text-emerald-400" />
            </div>
            <h1 className={`text-sm font-semibold tracking-tight ${textNormal}`}>YAML Config Validator Pro</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center rounded-lg border border-border/50 p-0.5 mr-2">
              {(['validate', 'format', 'convert'] as ToolTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    activeTab === tab ? activeTabBg : inactiveTabBg
                  }`}
                >
                  {tab === 'validate' && 'Validate'}
                  {tab === 'format' && 'Format'}
                  {tab === 'convert' && 'Convert'}
                </button>
              ))}
            </div>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`rounded-lg p-2 transition-colors ${
                isDark
                  ? 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className={`flex items-center justify-between border-b px-4 py-2 ${toolbarBg} backdrop-blur-sm`}>
          <div className="flex items-center gap-3">
            {activeTab === 'convert' && (
              <div className={`flex items-center rounded-lg border p-0.5 ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-gray-200 bg-white'}`}>
                <button
                  onClick={() => setConvertDirection('yaml-to-json')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                    convertDirection === 'yaml-to-json'
                      ? activeTabBg
                      : inactiveTabBg
                  }`}
                >
                  YAML → JSON
                </button>
                <button
                  onClick={() => setConvertDirection('json-to-yaml')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                    convertDirection === 'json-to-yaml'
                      ? activeTabBg
                      : inactiveTabBg
                  }`}
                >
                  JSON → YAML
                </button>
              </div>
            )}
            {activeTab === 'validate' && validation && statusBadge(validation.valid)}
            {activeTab === 'format' && formatResult && statusBadge(formatResult.valid)}
            {activeTab === 'convert' && convertResult && statusBadge(convertResult.valid)}
            <div className={`flex items-center gap-1 text-xs ${textMuted}`}>
              <SplitSquareHorizontal className="h-3.5 w-3.5" />
              <span>Live</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!output}
              className={`h-7 gap-1 text-xs ${isDark ? 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={!output}
              className={`h-7 gap-1 text-xs ${isDark ? 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className={`h-7 gap-1 text-xs ${isDark ? 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>

        {statusMessage && (
          <div className="absolute right-4 top-[92px] z-20 rounded-lg border border-emerald-500/25 bg-emerald-950/90 px-3 py-2 text-xs text-emerald-100 shadow-lg shadow-emerald-950/30">
            {statusMessage}
          </div>
        )}

        {isDragging && (
          <div className="pointer-events-none absolute inset-3 z-10 flex items-center justify-center rounded-2xl border border-dashed border-emerald-400/70 bg-emerald-950/55 text-sm font-medium text-emerald-100 backdrop-blur-sm">
            Drop a YAML or JSON file to load it into the editor
          </div>
        )}

        {/* Main Content — Split Screen */}
        <div className="flex flex-1 overflow-hidden">
          {/* Input Panel */}
          <div className={`flex flex-1 flex-col border-r ${isDark ? 'border-[#30363d]' : 'border-gray-200'}`}>
            <div className={`flex items-center justify-between border-b px-3 py-1.5 ${panelBg} ${isDark ? 'border-[#30363d]' : 'border-gray-200'}`}>
              <span className={`text-xs font-medium ${textMuted}`}>
                {inputMode === 'yaml' ? 'YAML Input' : 'JSON Input'}
              </span>
              <span className={`text-xs ${textMuted}`}>{input.length} chars</span>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={inputMode}
                value={input}
                onChange={(value) => setInput(value || '')}
                onMount={handleEditorMount}
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
                  quickSuggestions: false,
                  suggestOnTriggerCharacters: false,
                  parameterHints: { enabled: false },
                  hover: { enabled: false },
                }}
                theme={editorTheme}
                loading={
                  <div className={`flex h-full items-center justify-center text-xs ${textMuted}`}>
                    Loading editor...
                  </div>
                }
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-1 flex-col">
            <div className={`flex items-center justify-between border-b px-3 py-1.5 ${panelBg} ${isDark ? 'border-[#30363d]' : 'border-gray-200'}`}>
              <span className={`text-xs font-medium ${textMuted}`}>
                {activeTab === 'validate' ? 'Parsed Result (JSON)' : activeTab === 'format' ? 'Formatted YAML' : outputMode === 'json' ? 'JSON Output' : 'YAML Output'}
              </span>
              <div className="flex items-center gap-2">
                {activeTab === 'validate' && validation?.valid && validation.data !== null && validation.data !== undefined && (
                  <div className={`flex items-center rounded-md border p-0.5 ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-gray-200 bg-white'}`}>
                    {(['raw', 'tree'] as OutputView[]).map((view) => (
                      <button
                        key={view}
                        onClick={() => setOutputView(view)}
                        className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                          outputView === view ? activeTabBg : inactiveTabBg
                        }`}
                      >
                        {view === 'raw' ? 'Raw' : 'Tree'}
                      </button>
                    ))}
                  </div>
                )}
                <span className={`text-xs ${textMuted}`}>{output.length} chars</span>
              </div>
            </div>
            <div className="relative flex-1 min-h-0">
              {output && outputView === 'tree' && activeTab === 'validate' && validation?.valid ? (
                <TreeView data={validation.data} isDark={isDark} />
              ) : output ? (
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
                  theme={editorTheme}
                  loading={
                    <div className={`flex h-full items-center justify-center text-xs ${textMuted}`}>
                      Loading editor...
                    </div>
                  }
                />
              ) : (
                <div className={`flex h-full flex-col items-center justify-center gap-3 ${textMuted}`}>
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
          <div className={`border-t px-4 py-3 ${errorBg} ${isDark ? 'border-[#30363d]' : 'border-red-200'}`}>
            <div className={`flex items-center gap-2 text-xs font-semibold ${errorTitle}`}>
              <XCircle className="h-4 w-4" />
              Validation Errors ({validation.errors.length})
            </div>
            <ul className="mt-2 space-y-1.5">
              {validation.errors.map((err, idx) => (
                <li key={idx} className={`text-xs ${errorText}`}>
                  {err.line !== undefined && <span className="font-mono font-medium">Line {err.line}</span>}
                  {err.column !== undefined && <span className="font-mono font-medium">, Col {err.column}</span>}
                  {': '}
                  {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'format' && formatResult && !formatResult.valid && (
          <div className={`border-t px-4 py-3 ${errorBg} ${isDark ? 'border-[#30363d]' : 'border-red-200'}`}>
            <div className={`flex items-center gap-2 text-xs font-semibold ${errorTitle}`}>
              <XCircle className="h-4 w-4" />
              Format Error
            </div>
            <p className={`mt-1 text-xs ${errorText}`}>{formatResult.error}</p>
          </div>
        )}

        {activeTab === 'convert' && convertResult && !convertResult.valid && (
          <div className={`border-t px-4 py-3 ${errorBg} ${isDark ? 'border-[#30363d]' : 'border-red-200'}`}>
            <div className={`flex items-center gap-2 text-xs font-semibold ${errorTitle}`}>
              <XCircle className="h-4 w-4" />
              Conversion Error
            </div>
            <p className={`mt-1 text-xs ${errorText}`}>{convertResult.error}</p>
          </div>
        )}
      </div>

      {/* Features */}
      <Features />

      {/* Scenario SEO content */}
      <ScenarioSeoContent scenario={defaultScenario} />

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </div>
  );
}

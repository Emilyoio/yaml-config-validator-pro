'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import TreeView from '@/components/tree-view';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { trackEvent } from '@/lib/analytics';
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
  Link2,
  Upload,
  Download,
  RotateCcw,
  Moon,
  Sun,
  SplitSquareHorizontal,
} from 'lucide-react';

type ToolTab = 'validate' | 'format' | 'convert';
type ConvertDirection = 'yaml-to-json' | 'json-to-yaml';
type OutputView = 'raw' | 'tree';
type ProcessingReason = 'initial' | 'input' | 'tab_change' | 'direction_change' | 'file_load' | 'shared_link' | 'remote_url';

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

  'helm-values': `replicaCount: 2

image:
  repository: ghcr.io/example/catalog-service
  tag: "1.8.4"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8080

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: catalog.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

extraEnv:
  - name: LOG_LEVEL
    value: info
  - name: FEATURE_FLAGS
    value: "checkout-v2,recommendations"
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
function useDebouncedCallback<T extends (text: string, tab: ToolTab, direction: ConvertDirection, reason: ProcessingReason) => void>(
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
    (text: string, tab: ToolTab, direction: ConvertDirection, reason: ProcessingReason) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        callback(text, tab, direction, reason);
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [outputView, setOutputView] = useState<OutputView>('raw');
  const editorRef = useRef<MonacoEditorRef | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasLoadedSharedInputRef = useRef(false);
  const lastValidationEventRef = useRef<string | null>(null);
  const [monaco, setMonaco] = useState<MonacoApiRef | null>(null);
  const previousTabRef = useRef<ToolTab>(activeTab);
  const previousDirectionRef = useRef<ConvertDirection>(convertDirection);
  const previousInputRef = useRef(input);
  const hasProcessedInitialInputRef = useRef(false);

  const inputMode: EditorMode = activeTab === 'convert' && convertDirection === 'json-to-yaml' ? 'json' : 'yaml';
  const outputMode: EditorMode = activeTab === 'convert' && convertDirection === 'yaml-to-json' ? 'json' : 'yaml';


  const loadContentIntoEditor = useCallback((content: string, message: string) => {
    setInput(content);
    editorRef.current?.setValue(content);
    setActiveTab('validate');
    setOutputView('raw');
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 2200);
  }, []);

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
  const runValidation = useCallback((text: string, reason: ProcessingReason) => {
    const result = validateYaml(text);
    setValidation(result);
    applyValidationMarkers(result);
    const eventKey = `validate:${reason}:${result.valid}:${result.errors[0]?.message ?? ''}:${text.length}`;
    if (text.trim() && lastValidationEventRef.current !== eventKey) {
      lastValidationEventRef.current = eventKey;
      trackEvent(result.valid ? 'auto_validate_success' : 'auto_validate_error', {
        input_chars: text.length,
        error_count: result.valid ? 0 : result.errors.length,
        tool_tab: 'validate',
        source: reason,
      });
    }
    if (result.valid && result.data !== null && result.data !== undefined) {
      setOutput(JSON.stringify(result.data, null, 2));
    } else {
      setOutput('');
    }
  }, [applyValidationMarkers]);

  const runFormat = useCallback((text: string, reason: ProcessingReason) => {
    const result = formatYaml(text);
    setFormatResult(result);
    if (result.valid) {
      setOutput(result.formatted);
      trackEvent('auto_format_success', {
        input_chars: text.length,
        output_chars: result.formatted.length,
        tool_tab: 'format',
        source: reason,
      });
    } else {
      setOutput('');
      trackEvent('auto_format_error', {
        input_chars: text.length,
        tool_tab: 'format',
        source: reason,
      });
    }
  }, []);

  const runConvert = useCallback((text: string, direction: ConvertDirection, reason: ProcessingReason) => {
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
      trackEvent('auto_convert_success', {
        input_chars: text.length,
        output_chars: result.output.length,
        convert_direction: direction,
        tool_tab: 'convert',
        source: reason,
      });
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
      trackEvent('auto_convert_error', {
        input_chars: text.length,
        convert_direction: direction,
        tool_tab: 'convert',
        source: reason,
      });
    }
  }, [monaco]);

  const processInput = useCallback((text: string, tab: ToolTab, direction: ConvertDirection, reason: ProcessingReason) => {
    if (tab === 'validate') runValidation(text, reason);
    if (tab === 'format') runFormat(text, reason);
    if (tab === 'convert') runConvert(text, direction, reason);
  }, [runValidation, runFormat, runConvert]);

  // Debounced live update to prevent editor freeze
  const debouncedUpdate = useDebouncedCallback(processInput, 300);

  // Load shared YAML from #yaml=... or remote content from ?url=...
  useEffect(() => {
    if (hasLoadedSharedInputRef.current || typeof window === 'undefined') return;
    hasLoadedSharedInputRef.current = true;

    const id = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const remoteUrl = params.get('url');
      const yamlHash = window.location.hash.startsWith('#')
        ? new URLSearchParams(window.location.hash.slice(1)).get('yaml')
        : null;

      if (remoteUrl) {
        setIsLoadingRemote(true);
        setStatusMessage('Loading YAML from URL...');
        fetch(`/api/load-url/?url=${encodeURIComponent(remoteUrl)}`)
          .then(async (response) => {
            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload?.content) {
              throw new Error(payload?.error || 'Unable to load remote YAML');
            }
            loadContentIntoEditor(payload.content, `Loaded remote YAML from ${new URL(remoteUrl).hostname}`);
            trackEvent('manual_load_url_success', {
              source_host: new URL(remoteUrl).hostname,
              input_chars: payload.content.length,
              source: 'remote_url',
              tool_tab: 'validate',
            });
          })
          .catch((error) => {
            setStatusMessage(error instanceof Error ? error.message : 'Unable to load remote YAML');
            trackEvent('manual_load_url_error', {
              source_host: (() => {
                try { return new URL(remoteUrl).hostname; } catch { return 'invalid_url'; }
              })(),
              source: 'remote_url',
              tool_tab: 'validate',
            });
            setTimeout(() => setStatusMessage(''), 3200);
          })
          .finally(() => setIsLoadingRemote(false));
        return;
      }

      if (yamlHash) {
        loadContentIntoEditor(yamlHash, 'Loaded YAML from shared link');
        trackEvent('manual_shared_link_loaded', {
          input_chars: yamlHash.length,
          source: 'shared_link',
          tool_tab: 'validate',
        });
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [loadContentIntoEditor]);

  // Process editor content once per meaningful source change, and tag analytics source explicitly.
  useEffect(() => {
    const previousTab = previousTabRef.current;
    const previousDirection = previousDirectionRef.current;
    const previousInput = previousInputRef.current;
    const isInitial = !hasProcessedInitialInputRef.current;

    previousTabRef.current = activeTab;
    previousDirectionRef.current = convertDirection;
    previousInputRef.current = input;
    hasProcessedInitialInputRef.current = true;

    if (isInitial) {
      processInput(input, activeTab, convertDirection, 'initial');
      return;
    }

    if (previousTab !== activeTab) {
      processInput(input, activeTab, convertDirection, 'tab_change');
      return;
    }

    if (previousDirection !== convertDirection) {
      processInput(input, activeTab, convertDirection, 'direction_change');
      return;
    }

    if (previousInput !== input) {
      debouncedUpdate(input, activeTab, convertDirection, 'input');
    }
  }, [input, activeTab, convertDirection, processInput, debouncedUpdate]);

  const { isDragging, handleDragEnter, handleDragLeave, handleDragOver, handleDrop } = useDragAndDrop(
    (content) => {
      loadContentIntoEditor(content, 'File loaded into editor');
      trackEvent('manual_drag_file_loaded', {
        input_chars: content.length,
        source: 'file_load',
        tool_tab: activeTab,
      });
    },
    () => {
      setStatusMessage('Drop a .yaml, .yml, or .json file');
      setTimeout(() => setStatusMessage(''), 2200);
    }
  );

  const handleOpenFile = () => {
    trackEvent('manual_open_file_click', {
      tool_tab: activeTab,
      source: 'toolbar',
    });
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.name.endsWith('.yml') && !file.name.endsWith('.yaml') && !file.name.endsWith('.json')) {
      setStatusMessage('Choose a .yaml, .yml, or .json file');
      setTimeout(() => setStatusMessage(''), 2200);
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const content = loadEvent.target?.result;
      if (typeof content === 'string') {
        loadContentIntoEditor(content, `Opened ${file.name}`);
        trackEvent('manual_open_file_loaded', {
          input_chars: content.length,
          file_extension: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          source: 'file_load',
          tool_tab: activeTab,
        });
      }
    };
    reader.onerror = () => {
      setStatusMessage('Unable to read selected file');
      setTimeout(() => setStatusMessage(''), 2200);
    };
    reader.readAsText(file);
  };

  const handleCopyLink = async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.search = '';
    shareUrl.hash = `yaml=${encodeURIComponent(input)}`;
    await navigator.clipboard.writeText(shareUrl.toString());
    window.history.replaceState(null, '', shareUrl.toString());
    setLinkCopied(true);
    trackEvent('manual_copy_link_click', {
      input_chars: input.length,
      tool_tab: activeTab,
      source: 'toolbar',
    });
    setStatusMessage('Share link copied to clipboard');
    setTimeout(() => {
      setLinkCopied(false);
      setStatusMessage('');
    }, 1800);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    trackEvent('manual_copy_output_click', {
      output_chars: output.length,
      tool_tab: activeTab,
      output_view: outputView,
      source: 'toolbar',
    });
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
    trackEvent('manual_download_output_click', {
      output_chars: output.length,
      tool_tab: activeTab,
      file_name: a.download,
      source: 'toolbar',
    });
    setStatusMessage(`Downloaded ${a.download}`);
    setTimeout(() => setStatusMessage(''), 1800);
  };

  const handleReset = () => {
    trackEvent('manual_reset_click', {
      input_chars: input.length,
      tool_tab: activeTab,
      source: 'toolbar',
    });
    setInput('');
    editorRef.current?.setValue('');
    setOutput('');
    setValidation(null);
    setFormatResult(null);
    setConvertResult(null);
    setOutputView('raw');
    if (monaco && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) monaco.editor.setModelMarkers(model, 'yaml-validator', []);
    }
    setStatusMessage('Editor cleared');
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
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml,.json,application/x-yaml,text/yaml,application/json"
          className="hidden"
          onChange={handleFileInputChange}
        />

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
                  onClick={() => {
                    trackEvent('manual_tab_switch_click', {
                      from_tab: activeTab,
                      to_tab: tab,
                      source: 'toolbar',
                    });
                    setActiveTab(tab);
                  }}
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
                  onClick={() => {
                    trackEvent('manual_convert_direction_click', {
                      from_direction: convertDirection,
                      to_direction: 'yaml-to-json',
                      tool_tab: 'convert',
                      source: 'toolbar',
                    });
                    setConvertDirection('yaml-to-json');
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                    convertDirection === 'yaml-to-json'
                      ? activeTabBg
                      : inactiveTabBg
                  }`}
                >
                  YAML → JSON
                </button>
                <button
                  onClick={() => {
                    trackEvent('manual_convert_direction_click', {
                      from_direction: convertDirection,
                      to_direction: 'json-to-yaml',
                      tool_tab: 'convert',
                      source: 'toolbar',
                    });
                    setConvertDirection('json-to-yaml');
                  }}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFile}
              className={`h-7 gap-1 text-xs ${isDark ? 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <Upload className="h-3.5 w-3.5" />
              Open File
            </Button>
            <div className={`flex items-center gap-1 text-xs ${textMuted}`}>
              <SplitSquareHorizontal className="h-3.5 w-3.5" />
              <span>{isLoadingRemote ? 'Loading URL' : 'Live'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className={`h-7 gap-1 text-xs ${isDark ? 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <Link2 className="h-3.5 w-3.5" />
              {linkCopied ? 'Link Copied!' : 'Copy Link'}
            </Button>
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
                        onClick={() => {
                          setOutputView(view);
                          if (view === 'tree') {
                            trackEvent('manual_tree_view_click', {
                              input_chars: input.length,
                              output_chars: output.length,
                              tool_tab: activeTab,
                              source: 'output_view_toggle',
                            });
                          }
                        }}
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

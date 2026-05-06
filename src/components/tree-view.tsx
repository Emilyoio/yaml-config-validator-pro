'use client';

interface TreeViewProps {
  data: unknown;
  isDark: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatPrimitive(value: unknown) {
  if (typeof value === 'string') return `"${value}"`;
  if (value === null) return 'null';
  return String(value);
}

function TreeNode({ name, value, depth = 0 }: { name: string; value: unknown; depth?: number }) {
  const nested = Array.isArray(value) || isRecord(value);
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : isRecord(value)
      ? Object.entries(value)
      : [];

  return (
    <div className="font-mono text-[12px] leading-6">
      <div className="flex items-start gap-2" style={{ paddingLeft: depth * 14 }}>
        <span className="min-w-4 select-none text-[#6e7681]">{nested ? '▾' : '•'}</span>
        <span className="text-[#79c0ff]">{name}</span>
        <span className="text-[#6e7681]">:</span>
        {!nested && <span className="break-all text-[#a5d6ff]">{formatPrimitive(value)}</span>}
        {nested && (
          <span className="text-[#8b949e]">
            {Array.isArray(value) ? `[${value.length}]` : `{${entries.length}}`}
          </span>
        )}
      </div>
      {nested && (
        <div>
          {entries.map(([childName, childValue]) => (
            <TreeNode key={`${depth}-${name}-${childName}`} name={childName} value={childValue} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ data, isDark }: TreeViewProps) {
  if (data === null || data === undefined) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-[#8b949e]">
        No valid data to display in Tree View.
      </div>
    );
  }

  const entries = Array.isArray(data)
    ? data.map((item, index) => [String(index), item] as const)
    : isRecord(data)
      ? Object.entries(data)
      : [['value', data]] as const;

  return (
    <div className={`h-full overflow-auto p-4 ${isDark ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
      <div className={`rounded-xl border p-4 ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-gray-200 bg-white'}`}>
        <div className="mb-3 flex items-center justify-between border-b border-[#30363d] pb-2 text-xs">
          <span className="font-semibold text-[#c9d1d9]">Parsed tree</span>
          <span className="text-[#8b949e]">{entries.length} root entries</span>
        </div>
        {entries.map(([name, value]) => (
          <TreeNode key={name} name={name} value={value} />
        ))}
      </div>
    </div>
  );
}

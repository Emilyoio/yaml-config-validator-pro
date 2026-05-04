'use client'

import JsonView, { allExpanded, darkStyles } from 'react18-json-view'
import 'react18-json-view/src/style.css'

interface TreeViewProps {
  data: object | null;
  isDark: boolean;
}

export default function TreeView({ data, isDark }: TreeViewProps) {
  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        No valid data to display in Tree View.
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto text-sm">
      <JsonView
        data={data}
        shouldExpandNode={allExpanded}
        style={isDark ? darkStyles : {}}
      />
    </div>
  );
}

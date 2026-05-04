'use client';

import { useState } from 'react';
import {
  Zap,
  ArrowLeftRight,
  LayoutTemplate,
  Moon,
  ClipboardCopy,
  Bot,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Live Validation',
    description: 'Real-time syntax checking with precise line and column error reporting. Catch YAML mistakes instantly as you type.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Format & Convert',
    description: 'Bidirectional YAML↔JSON conversion with one-click beautification. Preserve comments and structure.',
  },
  {
    icon: LayoutTemplate,
    title: 'Scenario Templates',
    description: 'Pre-loaded presets for Kubernetes, Docker Compose, and GitHub Actions. Start from a real-world example.',
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    description: 'GitHub Dark-inspired theme that is easy on the eyes during long config editing sessions.',
  },
  {
    icon: ClipboardCopy,
    title: 'One-Click Copy',
    description: 'Copy or download your results instantly. No sign-up, no friction — just clean output.',
  },
  {
    icon: Bot,
    title: 'AI Fix (Pro)',
    description: 'Coming soon: AI-powered YAML repair that suggests fixes for common configuration errors.',
    comingSoon: true,
  },
];

export default function Features() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="w-full border-t border-[#30363d] bg-[#0d1117] py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[#c9d1d9] md:text-3xl">
            Everything you need for YAML
          </h2>
          <p className="mt-3 text-base text-[#8b949e] max-w-[65ch] mx-auto">
            A focused toolset for developers who work with configuration files daily.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={feat.title}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`group relative rounded-xl border p-6 transition-all duration-300 ${
                  isHovered
                    ? 'border-[#238636]/40 bg-[#161b22]'
                    : 'border-[#30363d] bg-[#0d1117]'
                }`}
              >
                {feat.comingSoon && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#238636]/15 px-2 py-0.5 text-[10px] font-medium text-[#238636] border border-[#238636]/20">
                    Coming Soon
                  </span>
                )}

                <div
                  className={`mb-4 inline-flex items-center justify-center rounded-lg p-2.5 transition-colors duration-300 ${
                    isHovered
                      ? 'bg-[#238636]/15 text-[#3fb950]'
                      : 'bg-[#21262d] text-[#8b949e]'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>

                <h3 className="text-sm font-semibold text-[#c9d1d9]">
                  {feat.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[#8b949e]">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

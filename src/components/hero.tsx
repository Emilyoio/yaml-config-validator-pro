'use client';

import { FileCode2, ArrowDown } from 'lucide-react';

export default function Hero() {
  const scrollToEditor = () => {
    const el = document.getElementById('editor');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full overflow-hidden border-b border-[#30363d] bg-[#0d1117]">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#c9d1d9 1px, transparent 1px), linear-gradient(90deg, #c9d1d9 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center text-center">
          {/* Brand icon */}
          <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-[#238636]/15 p-3.5 ring-1 ring-[#238636]/25">
            <FileCode2 className="h-7 w-7 text-[#3fb950]" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-[#c9d1d9] sm:text-4xl md:text-5xl">
            YAML Config Validator Pro
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-lg text-[#8b949e] sm:text-xl">
            Free Online YAML Parser, Formatter & Converter
          </p>

          {/* Description */}
          <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-[#8b949e]">
            Validate Kubernetes, Docker Compose, and GitHub Actions YAML files
            with live syntax checking. No sign-up required.
          </p>

          {/* Mini feature pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {['Validate', 'Format', 'Convert', 'AI Fix'].map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-[#30363d] bg-[#161b22] px-3.5 py-1.5 text-xs font-medium text-[#8b949e]"
              >
                {label === 'AI Fix' && (
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#238636]" />
                )}
                {label}
              </span>
            ))}
          </div>

          {/* CTA scroll */}
          <button
            onClick={scrollToEditor}
            className="mt-10 inline-flex items-center gap-2 rounded-lg bg-[#238636] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2ea043]"
          >
            Start Validating
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom gradient fade into editor */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d1117] to-transparent" />
    </section>
  );
}

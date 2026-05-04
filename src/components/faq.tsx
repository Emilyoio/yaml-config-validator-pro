'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Is this tool completely free?',
    a: 'Yes. All core features — validation, formatting, and conversion — are free to use without any sign-up or account required.',
  },
  {
    q: 'Does it support multi-document YAML?',
    a: 'Currently the validator processes the first document. Multi-document support is on the roadmap.',
  },
  {
    q: 'Can I use it offline?',
    a: 'The tool runs entirely in your browser. Once loaded, it does not need an internet connection to validate or format YAML.',
  },
  {
    q: 'Is my data sent to a server?',
    a: 'No. All processing happens locally in your browser. Your YAML content never leaves your device.',
  },
  {
    q: 'What YAML versions are supported?',
    a: 'We support YAML 1.2 via the js-yaml parser, which covers the vast majority of Kubernetes, Docker Compose, and CI/CD configs.',
  },
  {
    q: 'How accurate is the error reporting?',
    a: 'Errors include exact line and column numbers, plus a descriptive message. This makes debugging large config files significantly faster.',
  },
  {
    q: 'Will there be an AI-powered fix feature?',
    a: 'AI Fix (Pro) is on the roadmap. It will suggest corrections for common YAML mistakes directly in the editor.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="w-full border-t border-[#30363d] bg-[#0d1117] py-16 md:py-24">
      <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[#c9d1d9] md:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-[#8b949e]">
            Quick answers to common questions.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div
                key={idx}
                className={`rounded-lg border transition-colors duration-200 ${
                  isOpen
                    ? 'border-[#30363d] bg-[#161b22]'
                    : 'border-[#21262d] bg-[#0d1117] hover:border-[#30363d]'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-[#c9d1d9]">
                    <HelpCircle className="h-4 w-4 shrink-0 text-[#8b949e]" strokeWidth={1.5} />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#8b949e] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="pl-7 text-sm leading-relaxed text-[#8b949e]">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import { FileCode2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#30363d] bg-[#0d1117]">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-lg bg-[#238636]/15 p-1.5">
              <FileCode2 className="h-4 w-4 text-[#3fb950]" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium text-[#8b949e]">
              YAML Config Validator Pro
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-[#8b949e] transition-colors hover:text-[#c9d1d9]"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-[#8b949e] transition-colors hover:text-[#c9d1d9]"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-xs text-[#8b949e] transition-colors hover:text-[#c9d1d9]"
            >
              Contact
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-[#6e7681]">
            &copy; {new Date().getFullYear()} YAML Config Validator Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

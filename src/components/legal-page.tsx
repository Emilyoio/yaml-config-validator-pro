import Link from 'next/link';

export type LegalSection = {
  title: string;
  body?: string;
  items?: string[];
};

export default function LegalPage({
  title,
  description,
  updatedAt,
  sections,
}: {
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <section className="border-b border-[#30363d]">
        <div className="mx-auto max-w-[960px] px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-medium text-[#3fb950] hover:text-[#56d364]">
            ← Back to YAML Validator
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-[#3fb950]">
            YAML Config Validator Pro
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#f0f6fc] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#8b949e]">
            {description}
          </p>
          <p className="mt-4 text-sm text-[#6e7681]">Last updated: {updatedAt}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#238636]/30 bg-[#238636]/10 p-5 text-sm leading-6 text-[#c9d1d9]">
          <strong className="text-[#f0f6fc]">Browser-local processing:</strong>{' '}
          the YAML or JSON text you paste, type, drag, format, validate, or convert is processed in your browser.
          We do not upload your configuration content to our servers for these core tool actions.
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section) => {
            const sectionId = section.title.toLowerCase().includes('contact') ? 'contact' : undefined;
            return (
              <article key={section.title} id={sectionId} className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6">
              <h2 className="text-xl font-semibold tracking-tight text-[#f0f6fc]">{section.title}</h2>
              {section.body && <p className="mt-3 text-sm leading-7 text-[#8b949e]">{section.body}</p>}
              {section.items && (
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#8b949e]">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3fb950]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

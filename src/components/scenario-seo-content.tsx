type ScenarioKey = 'kubernetes' | 'docker-compose' | 'github-actions';

type ScenarioContent = {
  eyebrow: string;
  title: string;
  intro: string;
  checks: string[];
  mistakes: Array<{ title: string; body: string }>;
  workflow: string[];
  faqs: Array<{ q: string; a: string }>;
};

const CONTENT: Record<ScenarioKey, ScenarioContent> = {
  kubernetes: {
    eyebrow: 'Kubernetes manifest checker',
    title: 'Validate Kubernetes YAML before it reaches kubectl',
    intro:
      'Kubernetes YAML is indentation-sensitive and usually spans Deployments, Services, ConfigMaps, Secrets, Ingress, and CronJobs. Use this page to catch YAML syntax problems before running kubectl apply or opening a production pull request.',
    checks: [
      'Deployment, StatefulSet, DaemonSet, Job, and CronJob manifests',
      'Service, Ingress, ConfigMap, Secret, Namespace, and RBAC YAML',
      'Multi-level arrays such as containers, env, ports, volumes, and volumeMounts',
      'Copy-ready JSON output for debugging generated manifests and CI pipelines',
    ],
    mistakes: [
      {
        title: 'Wrong indentation under containers or env',
        body: 'A single missing space can move an env var, port, or volumeMount to the wrong level. The editor highlights the parser line so you can jump directly to the broken block.',
      },
      {
        title: 'Unquoted values that YAML treats as booleans or numbers',
        body: 'Values such as on, off, yes, no, 0123, or image tags with colons can parse differently than expected. Convert to JSON to inspect what Kubernetes will receive.',
      },
      {
        title: 'Broken generated manifests in GitOps flows',
        body: 'Helm, Kustomize, and template engines often fail because the rendered YAML is invalid. Paste the rendered output here before committing it to a GitOps repository.',
      },
    ],
    workflow: [
      'Paste or drag a Kubernetes YAML manifest into the editor.',
      'Use Validate to catch syntax errors with line and column feedback.',
      'Switch to Tree View to inspect parsed keys, arrays, and nested objects.',
      'Copy or download the parsed JSON when reviewing generated manifests.',
    ],
    faqs: [
      {
        q: 'Does this replace kubectl dry-run?',
        a: 'No. This page validates YAML syntax and parsed structure in the browser. Use kubectl --dry-run=server for Kubernetes API schema and admission checks.',
      },
      {
        q: 'Can it validate Helm or Kustomize output?',
        a: 'Yes. Render the chart or overlay first, then paste the generated YAML here to catch syntax and indentation issues before applying it.',
      },
      {
        q: 'Are Kubernetes secrets uploaded?',
        a: 'No. Validation runs locally in your browser, so pasted manifests are not sent to a server.',
      },
    ],
  },
  'docker-compose': {
    eyebrow: 'Docker Compose file checker',
    title: 'Validate docker-compose.yml before containers fail to start',
    intro:
      'Docker Compose files are compact but easy to break when services, volumes, networks, environment variables, and healthchecks grow. Use this page to catch YAML syntax errors before docker compose up.',
    checks: [
      'Services, images, build contexts, commands, entrypoints, and depends_on blocks',
      'Environment variable maps and arrays, ports, volumes, networks, and profiles',
      'Healthchecks, restart policies, labels, logging, and extension fields',
      'YAML to JSON conversion for debugging CI-generated Compose configs',
    ],
    mistakes: [
      {
        title: 'Mixing list and map syntax in environment blocks',
        body: 'Compose accepts both FOO=bar lists and FOO: bar maps, but mixing indentation styles often creates invalid YAML. The parser points to the line that breaks the structure.',
      },
      {
        title: 'Ports and volume mappings parsed unexpectedly',
        body: 'Strings such as 8080:80 or ./data:/var/lib/data should usually be quoted when a parser or generator changes meaning. Convert to JSON to inspect the parsed result.',
      },
      {
        title: 'Broken generated Compose files in deploy scripts',
        body: 'CI templates and env substitution can output invalid Compose YAML. Paste the final generated file here before deploying to staging or production.',
      },
    ],
    workflow: [
      'Paste or drag your docker-compose.yml file into the editor.',
      'Validate the YAML structure and fix any highlighted parser errors.',
      'Use Format to normalize indentation before committing the file.',
      'Copy or download the cleaned output for your repository or deploy script.',
    ],
    faqs: [
      {
        q: 'Does this check Docker Compose schema rules?',
        a: 'This page focuses on YAML syntax and parsed structure. Run docker compose config for Compose-specific schema and interpolation checks.',
      },
      {
        q: 'Should I quote port mappings?',
        a: 'Quoting port and volume mappings is often safer, especially when files are generated by templates or processed by multiple parsers.',
      },
      {
        q: 'Is my Compose file stored?',
        a: 'No. The tool runs in your browser and does not upload Compose content to a server.',
      },
    ],
  },
  'github-actions': {
    eyebrow: 'GitHub Actions workflow checker',
    title: 'Validate workflow YAML before a CI run fails',
    intro:
      'GitHub Actions workflows combine YAML syntax, event triggers, jobs, steps, expressions, and secrets references. Use this page to catch YAML parser errors before pushing a broken file to .github/workflows.',
    checks: [
      'Workflow files under .github/workflows/*.yml and *.yaml',
      'on, jobs, steps, uses, run, with, env, permissions, and concurrency blocks',
      'Nested matrices, services, caches, and reusable workflow inputs',
      'Copy-ready parsed JSON for reviewing generated CI/CD workflow files',
    ],
    mistakes: [
      {
        title: 'The on key parsed incorrectly by YAML tooling',
        body: 'Some YAML parsers treat on as a boolean in older YAML modes. This tool uses YAML 1.2 behavior, and JSON output helps verify the parsed workflow keys.',
      },
      {
        title: 'Bad indentation inside jobs and steps',
        body: 'A misplaced run, uses, with, or env block can make a workflow fail before any job starts. Validate the file before pushing to avoid noisy CI failures.',
      },
      {
        title: 'Generated workflow files with malformed arrays',
        body: 'Matrix jobs and reusable workflow inputs are often generated from templates. Paste generated YAML here to inspect arrays and nested objects in Tree View.',
      },
    ],
    workflow: [
      'Paste or drag a workflow YAML file into the editor.',
      'Validate syntax and resolve line/column errors before committing.',
      'Use Tree View to inspect jobs, steps, matrices, env, and permissions.',
      'Copy or download parsed output when reviewing generated workflow files.',
    ],
    faqs: [
      {
        q: 'Does this run GitHub Actions validation?',
        a: 'No. It validates YAML syntax locally. GitHub still performs workflow-specific validation when the file is pushed.',
      },
      {
        q: 'Why does the on key matter?',
        a: 'Older YAML parsers may interpret on as a boolean. Inspecting parsed JSON helps confirm that the workflow trigger remains a string key.',
      },
      {
        q: 'Can I paste workflows with secrets references?',
        a: 'The tool runs in your browser and does not upload content. Still, avoid pasting real secret values; use GitHub secrets references instead.',
      },
    ],
  },
};

export const scenarioFaqs = Object.fromEntries(
  Object.entries(CONTENT).map(([key, value]) => [key, value.faqs])
) as Record<ScenarioKey, Array<{ q: string; a: string }>>;

export default function ScenarioSeoContent({ scenario }: { scenario?: string }) {
  if (!scenario || !(scenario in CONTENT)) return null;

  const content = CONTENT[scenario as ScenarioKey];

  return (
    <section className="w-full border-t border-[#30363d] bg-[#0d1117] py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#3fb950]">
            {content.eyebrow}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#c9d1d9] md:text-3xl">
            {content.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-[#8b949e]">
            {content.intro}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6">
            <h3 className="text-sm font-semibold text-[#c9d1d9]">What this validator helps check</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#8b949e]">
              {content.checks.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3fb950]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {content.mistakes.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-5">
                <h3 className="text-sm font-semibold text-[#c9d1d9]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#8b949e]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#30363d] bg-[#161b22] p-6">
          <h3 className="text-sm font-semibold text-[#c9d1d9]">Recommended workflow</h3>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-[#8b949e] md:grid-cols-4">
            {content.workflow.map((step, index) => (
              <li key={step} className="rounded-xl border border-[#30363d] bg-[#0d1117] p-4">
                <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#238636]/15 text-xs font-semibold text-[#3fb950]">
                  {index + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {content.faqs.map((faq) => (
            <article key={faq.q} className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-5">
              <h3 className="text-sm font-semibold text-[#c9d1d9]">{faq.q}</h3>
              <p className="mt-3 text-sm leading-6 text-[#8b949e]">{faq.a}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

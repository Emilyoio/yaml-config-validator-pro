# Deployment Source of Truth — YAML Config Validator Pro

Last verified: 2026-05-25

## Production

- Canonical site: `https://www.yamlvalidator.pro/`
- Apex redirects to canonical: `https://yamlvalidator.pro/` -> `https://www.yamlvalidator.pro/`
- Current production host: **Vercel**
- Evidence: live headers report `server: Vercel`; DNS/custom-domain behavior points to Vercel; `vercel.json` exists.

## Repository / deploy path

- GitHub repo: `Emilyoio/yaml-config-validator-pro`
- Local repo: `/root/aichu_projects/yaml-config-validator-pro/code/`
- Branch: `main`
- Operational model: push to `main`, then verify the Vercel production deployment on `https://www.yamlvalidator.pro/`.

## Not Cloudflare Pages right now

Do not treat this as a Cloudflare Pages deployment unless the live evidence changes. A Cloudflare migration would need separate DNS, build, and API-route checks because the app uses dynamic Next.js routes such as `/api/load-url/`.

## Verification checklist after each production patch

1. Run local gates:
   - `npm run type-check`
   - `npm run lint`
   - `npm run build`
2. Revert local generated artifacts if they changed only because of verification, especially `tsconfig.tsbuildinfo`.
3. Commit and push `main`.
4. Verify production, not just local build:
   - `https://www.yamlvalidator.pro/` returns 200.
   - `/api/load-url/?url=<encoded test URL>` returns 200 JSON and does not hit a 308 redirect.
   - Current JS chunks contain expected analytics markers for any event instrumentation patch.
5. For analytics changes, open production with a verification UTM and confirm GA4 Realtime receives a hit.

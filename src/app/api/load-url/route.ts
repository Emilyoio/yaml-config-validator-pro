import { NextRequest, NextResponse } from 'next/server';

const MAX_REMOTE_BYTES = 512 * 1024;
const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^::1$/,
];

function isPrivateHost(hostname: string) {
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('url');

  if (!source) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(source);
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol) || isPrivateHost(parsed.hostname)) {
    return NextResponse.json({ error: 'Only public http(s) URLs are supported' }, { status: 400 });
  }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let finalUrl = parsed.toString();
    let redirectCount = 0;
    const MAX_REDIRECTS = 3;

    try {
      while (redirectCount < MAX_REDIRECTS) {
        const response = await fetch(finalUrl, {
          signal: controller.signal,
          headers: {
            accept: 'text/yaml, application/yaml, application/x-yaml, text/plain, application/json, */*;q=0.5',
            'user-agent': 'YAMLConfigValidatorPro/1.0 (+https://www.yamlvalidator.pro)',
          },
          redirect: 'manual',
        });

        if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
          const location = response.headers.get('location')!;
          finalUrl = new URL(location, finalUrl).toString();
          redirectCount++;
          continue;
        }

        if (!response.ok) {
          return NextResponse.json({ error: `Remote URL returned ${response.status}` }, { status: 502 });
        }

        const contentLength = response.headers.get('content-length');
        if (contentLength && Number(contentLength) > MAX_REMOTE_BYTES) {
          return NextResponse.json({ error: 'Remote file is larger than 512KB' }, { status: 413 });
        }

        const text = await response.text();
        if (new Blob([text]).size > MAX_REMOTE_BYTES) {
          return NextResponse.json({ error: 'Remote file is larger than 512KB' }, { status: 413 });
        }

        return NextResponse.json({ content: text, source: finalUrl });
      }

      return NextResponse.json({ error: 'Too many redirects' }, { status: 502 });
    } catch (error) {
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'Remote URL request timed out'
        : 'Unable to load remote URL';
      return NextResponse.json({ error: message }, { status: 502 });
    } finally {
      clearTimeout(timeout);
    }
}

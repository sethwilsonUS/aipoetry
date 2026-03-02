import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

export const alt = 'Poem preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Converts AI Gateway model strings like "anthropic/claude-opus-4-6" into
// readable display names like "Claude Opus 4.6".
function formatModel(raw: string): string {
  // Strip provider prefix (e.g. "anthropic/", "google/")
  const model = raw.includes('/') ? (raw.split('/').pop() ?? raw) : raw;

  if (model.startsWith('claude')) {
    const parts = model.split('-').filter((p) => p !== 'claude');
    // Strip 8-digit date suffixes (e.g. "20241022")
    const meaningful = parts.filter((p) => !/^\d{8}$/.test(p));

    // Group consecutive digit segments as a version number (e.g. ["4","6"] → "4.6")
    let result = 'Claude ';
    let numBuf: string[] = [];
    for (const p of meaningful) {
      if (/^\d+$/.test(p)) {
        numBuf.push(p);
      } else {
        if (numBuf.length) {
          result += numBuf.join('.') + ' ';
          numBuf = [];
        }
        result += p.charAt(0).toUpperCase() + p.slice(1) + ' ';
      }
    }
    if (numBuf.length) result += numBuf.join('.');
    return result.trim();
  }

  if (model.startsWith('gemini')) {
    // gemini-2.0-flash → Gemini 2.0 Flash
    return model
      .split('-')
      .filter((p) => p !== 'exp') // strip experiment suffix
      .map((p) => (/^\d/.test(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
      .join(' ');
  }

  if (model.startsWith('gpt')) {
    return 'GPT-' + model.slice(4);
  }

  return model
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

// Trim a poem line to fit in the preview, appending an ellipsis if needed.
function trimLine(line: string, max = 52): string {
  return line.length > max ? line.slice(0, max - 1) + '…' : line;
}

// ── Design tokens (mirrors globals.css dark theme) ─────────────────────────
const BG = '#111a14';
const TEXT_PRIMARY = '#f0ede6';
const TEXT_MUTED = '#6b7a64';
const TEXT_PREVIEW = '#8a9e84';
const ACCENT = '#34d399';
const ACCENT_BG = 'rgba(52, 211, 153, 0.10)';
const ACCENT_BORDER = 'rgba(52, 211, 153, 0.28)';
const ACCENT_DIVIDER = 'rgba(52, 211, 153, 0.20)';
const IMAGE_PANEL_W = 500;
const PAD = 56;

export default async function OgImage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch poem data server-side
  let poem: Awaited<ReturnType<typeof fetchQuery<typeof api.poems.getById>>> | null = null;
  try {
    poem = await fetchQuery(api.poems.getById, { id: id as Id<'poems'> });
  } catch {
    // fall through to generic fallback
  }

  // ── Generic Infinite Poetry fallback ─────────────────────────────────────
  if (!poem || poem.status !== 'complete') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: BG,
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 96, color: ACCENT, lineHeight: 1, marginBottom: 20, fontFamily: 'sans-serif' }}>∞</div>
          <div
            style={{
              fontSize: 32,
              color: TEXT_PRIMARY,
              letterSpacing: '0.12em',
              fontFamily: 'serif',
              textTransform: 'uppercase',
            }}
          >
            Infinite Poetry
          </div>
          <div
            style={{ fontSize: 15, color: TEXT_MUTED, marginTop: 14, fontFamily: 'sans-serif' }}
          >
            AI-generated verse
          </div>
        </div>
      ),
      { ...size },
    );
  }

  // ── Load Fraunces font (WOFF v1 from @fontsource, bundled locally) ─────────
  // Using a local file avoids the runtime network request and the WOFF2
  // incompatibility with Satori's font parser.
  let fontData: ArrayBuffer | undefined;
  try {
    const fontPath = join(
      process.cwd(),
      'node_modules/@fontsource/fraunces/files/fraunces-latin-700-normal.woff',
    );
    fontData = readFileSync(fontPath).buffer as ArrayBuffer;
  } catch {
    // fall back to system serif
  }

  const titleFont = fontData ? 'Fraunces' : 'serif';

  const title = poem.title || 'Untitled';
  const styleName = poem.styleName || '';
  const modelDisplay = formatModel(poem.model || '');
  const imageUrl = poem.imageUrl;
  const hasImage = !!(imageUrl && poem.imageStatus === 'complete');

  // Show more lines and use longer trim when there's no image to fill the space
  const maxPreviewLines = hasImage ? 3 : 4;
  const previewLines = (poem.lines || []).slice(0, maxPreviewLines).filter(Boolean);

  // Title scales down for long titles; also slightly larger when filling full width
  const titleFontSize = hasImage
    ? title.length > 40 ? 38 : title.length > 28 ? 46 : title.length > 18 ? 54 : 62
    : title.length > 40 ? 44 : title.length > 28 ? 54 : title.length > 18 ? 64 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: BG,
          fontFamily: 'sans-serif',
        }}
      >
        {/* ── Text Panel ──────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: `${PAD}px`,
            flex: 1,
            height: '100%',
          }}
        >
          {/* Brand mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26, color: ACCENT, lineHeight: 1, fontFamily: 'sans-serif' }}>∞</span>
            <span
              style={{
                fontSize: 12,
                color: TEXT_MUTED,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
              }}
            >
              Infinite Poetry
            </span>
          </div>

          {/* Main poem identity */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: titleFontSize,
                fontFamily: titleFont,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                lineHeight: 1.15,
                marginBottom: 22,
              }}
            >
              {title}
            </div>

            {/* Style badge + model attribution */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: ACCENT,
                  backgroundColor: ACCENT_BG,
                  border: `1px solid ${ACCENT_BORDER}`,
                  borderRadius: 20,
                  padding: '4px 14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  fontFamily: 'sans-serif',
                }}
              >
                {styleName}
              </div>
              <div style={{ fontSize: 13, color: TEXT_MUTED, fontFamily: 'sans-serif' }}>
                {`generated by ${modelDisplay}`}
              </div>
            </div>

            {/* Poem preview lines */}
            {previewLines.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 7,
                  borderLeft: `2px solid ${ACCENT_DIVIDER}`,
                  paddingLeft: 18,
                }}
              >
                {previewLines.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 17,
                      color: TEXT_PREVIEW,
                      fontStyle: 'italic',
                      fontFamily: titleFont,
                      lineHeight: 1.55,
                    }}
                  >
                    {trimLine(line, hasImage ? 46 : 68)}
                  </div>
                ))}
                {poem.lines.length > 3 && (
                  <div
                    style={{
                      fontSize: 14,
                      color: 'rgba(138, 158, 132, 0.45)',
                      fontFamily: 'sans-serif',
                      marginTop: 2,
                    }}
                  >
                    · · ·
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              fontSize: 12,
              color: 'rgba(107, 122, 100, 0.55)',
              letterSpacing: '0.06em',
              fontFamily: 'sans-serif',
            }}
          >
            infinitepoetry.ai
          </div>
        </div>

        {/* ── Image Panel ─────────────────────────────────────────────────── */}
        {hasImage && (
          <div
            style={{
              width: `${IMAGE_PANEL_W}px`,
              height: '100%',
              display: 'flex',
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 40px 40px 0',
              borderLeft: '1px solid rgba(52, 211, 153, 0.08)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl!}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center center',
              }}
              alt=""
            />
          </div>
        )}
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Fraunces', data: fontData, style: 'normal' as const, weight: 700 }]
        : [],
    },
  );
}

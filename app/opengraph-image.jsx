import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '스피드체크 — 인터넷 속도 측정';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FONT_URL =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf';

export default async function Image() {
  const fontData = await fetch(FONT_URL).then((res) => res.arrayBuffer());

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
          background: 'linear-gradient(135deg, #0066FF 0%, #0047b3 100%)',
          fontFamily: 'Pretendard',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              background: 'rgba(255,255,255,0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#fff" />
            </svg>
          </div>
          <div style={{ display: 'flex', fontSize: 92, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>
            스피드체크
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 38, color: 'rgba(255,255,255,0.94)', letterSpacing: '-0.01em' }}>
          인터넷 속도, 접속하면 바로 측정
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: 'rgba(255,255,255,0.75)', marginTop: 18 }}>
          무료 · 무가입 · 무설치 — speed-value.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Pretendard', data: fontData, weight: 700, style: 'normal' }],
    },
  );
}

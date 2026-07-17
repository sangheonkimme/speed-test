import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://speedcheck.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '인터넷 속도 측정 — 스피드체크 | 3초 무료 측정',
    template: '%s — 스피드체크',
  },
  description:
    '접속 즉시 자동 측정. 무료·무가입·무설치 인터넷 속도 테스트 — 다운로드·업로드·핑·지터를 수 초 안에 확인하고 용도별 적합도까지 진단해 보세요.',
  keywords: [
    '인터넷 속도 측정', '인터넷 속도 테스트', '스피드테스트', '와이파이 속도 측정',
    '인터넷 느림', 'KT 속도 측정', 'SK브로드밴드 속도', 'LG유플러스 속도',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: '스피드체크',
    title: '인터넷 속도 측정 — 스피드체크',
    description: '접속 즉시 자동 측정. 무료·무가입·무설치.',
  },
  twitter: {
    card: 'summary',
    title: '인터넷 속도 측정 — 스피드체크',
    description: '접속 즉시 자동 측정. 무료·무가입·무설치.',
  },
  robots: { index: true, follow: true },
  verification: {
    other: {
      'naver-site-verification': '20068b7154c22a139ce0059aedda3372ef568b9d',
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0066FF',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='7' fill='%230066FF'/%3E%3Cpath d='M13 4 6.5 13H11l-.8 7L17 11h-4.5L13 4Z' fill='%23fff'/%3E%3C/svg%3E"
        />
        <link rel="preconnect" href="https://speed.cloudflare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.4/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

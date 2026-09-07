import Script from "next/script";
import { SiteFooter } from "./_components/SiteFooter";
import { SITE_URL, siteJsonLd } from "@/content/site";
import "./globals.css";

const RAW_GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GTM_ID = /^GTM-[A-Z0-9]+$/.test(RAW_GTM_ID || "") ? RAW_GTM_ID : null;
const RAW_ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;
const ADSENSE_ID = /^ca-pub-\d+$/.test(RAW_ADSENSE_ID || "")
  ? RAW_ADSENSE_ID
  : null;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "인터넷 속도 측정 — 스피드체크 | 무료 속도 테스트",
    template: "%s — 스피드체크",
  },
  description:
    "접속 즉시 자동 측정. 무료·무가입·무설치 인터넷 속도 테스트 — 다운로드·업로드·핑·지터를 한 번에 확인하고 용도별 적합도까지 살펴보세요.",
  keywords: [
    "인터넷 속도 측정",
    "인터넷 속도 테스트",
    "스피드테스트",
    "와이파이 속도 측정",
    "인터넷 느림",
    "KT 속도 측정",
    "SK브로드밴드 속도",
    "LG유플러스 속도",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "스피드체크",
    title: "인터넷 속도 측정 — 스피드체크",
    description: "접속 즉시 자동 측정. 무료·무가입·무설치.",
  },
  twitter: {
    card: "summary_large_image",
    title: "인터넷 속도 측정 — 스피드체크",
    description: "접속 즉시 자동 측정. 무료·무가입·무설치.",
  },
  robots: { index: true, follow: true },
  verification: {
    other: {
      "naver-site-verification": "20068b7154c22a139ce0059aedda3372ef568b9d",
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0066FF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* 전역 엔티티 선언 — 사이트 전체에서 이 @id 하나만 참조한다 (LLMO 엔티티 분열 방지) */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}

        />

        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='7' fill='%230066FF'/%3E%3Cpath d='M13 4 6.5 13H11l-.8 7L17 11h-4.5L13 4Z' fill='%23fff'/%3E%3C/svg%3E"
        />
        <link
          rel="preconnect"
          href="https://speed.cloudflare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        {/* 폰트 CSS 비동기 로드 — 렌더 블로킹 제거(LCP 개선). 시스템 폰트로 먼저 그리고 swap */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){["https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css","https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.css"].forEach(function(h){var l=document.createElement("link");l.rel="stylesheet";l.href=h;document.head.appendChild(l)})})();',
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.css"
          />
        </noscript>
        {/*
          AdSense 스니펫 — 사이트 연결·심사용. next/script 대신 raw 태그를 쓰는 이유는
          서버 렌더링된 HTML에 그대로 실려야 AdSense 크롤러가 확실히 인식하기 때문.
          자동 광고는 대시보드에서 OFF 유지 (측정 화면을 덮으면 완료율 가드레일 위반).
          승인 후 실제 광고 단위를 붙일 때는 측정 중 대역폭 경합을 피하도록
          측정 완료 이후 렌더되게 할 것 — AdSlot의 measuring 지면 주의.
        */}
        {ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        {GTM_ID && (
          <>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
          </>
        )}
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

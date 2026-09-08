// 사이트 전역 상수 · 엔티티 선언 단일 소스.
// 원칙: 여기 없는 사실을 페이지가 말하게 하지 않는다. 미확인 값은 빈 문자열로 두고,
// 비어 있으면 해당 마크업·구조화 데이터를 아예 렌더하지 않는다 (거짓 신호 방지).

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://speedcheck.vercel.app";

export const SITE_NAME = "스피드체크";

// LLMO: 엔티티 분열 방지용 고정 @id. 사이트 전체에서 이 값만 참조한다.
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

// ── 운영 주체 (확인된 사실) ────────────────────────────────────────────────
// 비워 두면 /about의 해당 블록과 Organization.contactPoint·sameAs가 렌더되지 않는다.
// 확인되지 않은 값을 채우지 않는다 — 지어낸 값은 인용 신뢰를 잃는다.
export const CONTACT_EMAIL = "sangheon1646@gmail.com";
export const OPERATOR_NAME = "김상헌";
export const SAME_AS = [
  "https://github.com/sangheonkimme/speed-test", // 공개 저장소. README가 speed-value.com을 가리킨다
];
// ───────────────────────────────────────────────────────────────────────────

/** 사이트 전역에서 한 번만 선언되는 Organization + WebSite 엔티티. */
export function siteJsonLd() {
  const organization = {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "무료·무가입·무설치 인터넷 속도 측정 서비스. 다운로드·업로드·핑·지터를 측정하고 측정 방법론을 공개한다.",
    inLanguage: "ko",
    areaServed: { "@type": "Country", name: "대한민국" },
  };

  if (SAME_AS.length > 0) organization.sameAs = SAME_AS;
  if (CONTACT_EMAIL) {
    organization.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      availableLanguage: ["ko"],
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "ko",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

/** 페이지 LD에서 쓰는 참조 — 중복 선언 대신 @id로 가리킨다. */
export const orgRef = { "@id": ORG_ID };

/** 빵부스러기 — 화면 UI와 반드시 같은 내용으로 유지한다. */
export function breadcrumbJsonLd(trail) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      // 마지막 항목(현재 페이지)에는 item을 넣지 않는 것이 schema.org 권장이다.
      ...(item.url ? { item: `${SITE_URL}${item.url}` } : {}),
    })),
  };
}

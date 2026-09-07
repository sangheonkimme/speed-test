import { SITE_URL } from "@/content/site";

// AI 크롤러는 용도가 세 종류(학습 / 검색 색인 / 실시간 fetch)이고 정책을 용도별로 나눠 짠다.
// 인용 유입이 목표이므로 전부 Allow가 기본값이다.
//
// ⚠️ robots.txt 규칙: 특정 User-agent 그룹을 선언하면 그 크롤러는 `*` 그룹을 무시하고
// 자기 그룹만 읽는다. 따라서 각 그룹에 Allow를 명시해야 한다.
// Sitemap 지시어는 그룹과 무관하게 전역 적용된다.
const AI_CRAWLERS = [
  // 학습 (LLMO: 미래 모델의 브랜드 인지)
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  // AI 검색 색인 (GEO: 검색 인용)
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
  // 실시간 fetch (답변 시점 직접 인용)
  "ChatGPT-User",
  "Claude-User",
  "Perplexity-User",
];

// 국내 검색 (NEO): Yeti=네이버, Daum=카카오
const KR_CRAWLERS = ["Yeti", "Daum"];

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...KR_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

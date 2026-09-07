import Link from "next/link";
import { guides } from "@/content/guides";

/**
 * 사이트 전역 푸터 — 서버 컴포넌트.
 *
 * SEO 근거: 이전에는 내부 링크가 ResultPanel(측정 완료 후에만 렌더되는 클라이언트 트리)
 * 안에만 있어서, 측정을 수행하지 않는 크롤러가 받는 홈 HTML의 <a> 태그가 0개였다.
 * 가이드 문서들이 사이트맵으로만 발견되고 홈의 권위를 전혀 물려받지 못했다.
 * 따라서 이 컴포넌트는 반드시 서버 렌더링 경로에 있어야 하며,
 * 클라이언트 상태(측정 완료 여부 등)에 조건부로 렌더해서는 안 된다.
 */
export function SiteFooter() {
  return (
    <footer className="site-foot">
      <h2>인터넷 속도 가이드</h2>
      <ul>
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={`/guide/${g.slug}`}>{g.title}</Link>
          </li>
        ))}
      </ul>
      <div className="foot-meta">
        측정은 언제나 무료·무가입·무설치예요
        <br />
        <Link href="/guide">가이드 전체 보기</Link>
        {" · "}
        <Link href="/methodology">측정 방법론</Link>
        {" · "}
        <Link href="/about">서비스 소개</Link>
        {" · "}
        <Link href="/privacy">개인정보 처리방침</Link>
      </div>
    </footer>
  );
}

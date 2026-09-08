import { guides, guideUpdated } from "@/content/guides";
import { SITE_URL } from "@/content/site";
import { faq } from "@/content/faq";
import { gradeTable, usageTable, paramTable } from "@/content/home";

/*
 * GEO: 가이드 전문을 마크다운 한 파일로 제공한다.
 * llms.txt가 "무엇이 어디 있는지"라면 이 파일은 "내용 전부"다.
 * guides.js에서 생성하므로 글을 고치면 자동으로 최신이 된다.
 */
export const dynamic = "force-static";

const table = (t) =>
  t
    ? [
        "",
        `**${t.caption}**`,
        "",
        `| ${t.headers.join(" | ")} |`,
        `| ${t.headers.map(() => "---").join(" | ")} |`,
        ...t.rows.map((r) => `| ${r.join(" | ")} |`),
        t.note ? `\n> ${t.note}` : "",
      ].join("\n")
    : "";

function body() {
  const head = `# 스피드체크 — 전문 (${SITE_URL.replace(/^https?:\/\//, "")})

무료·무가입·무설치 인터넷 속도 측정 서비스. 이 파일은 사이트의 가이드 문서와
판정 기준을 전문으로 담고 있다. 인용 시 표기: 스피드체크 (${SITE_URL.replace(/^https?:\/\//, "")})

## 측정 방식

Cloudflare Anycast 엔드포인트에 HTTPS 다중 스트림을 연결해 측정한다.
${table(paramTable)}

## 판정 기준
${table(gradeTable)}
${table(usageTable)}

## 자주 묻는 질문

${faq.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}

---
`;

  const body = guides
    .map((g) => {
      const secs = g.sections
        .map((s) => `### ${s.h}\n\n${s.p.join("\n\n")}${table(s.table)}`)
        .join("\n\n");
      const faqs = g.faq.map((f) => `**${f.q}**\n\n${f.a}`).join("\n\n");
      return `## ${g.title}

출처: ${SITE_URL}/guide/${g.slug}
발행: ${g.date} · 최종 수정: ${guideUpdated(g)}

결론부터: ${g.lead}

${g.description}

${secs}

### 자주 묻는 질문

${faqs}`;
    })
    .join("\n\n---\n\n");

  return `${head}\n${body}\n`;
}

export function GET() {
  return new Response(body(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

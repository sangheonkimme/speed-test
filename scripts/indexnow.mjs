#!/usr/bin/env node
/*
 * IndexNow 핑 — 발행·갱신을 Bing·네이버·Yandex 계열에 즉시 알린다.
 * Google은 IndexNow를 지원하지 않으므로 사이트맵 lastmod 정확성으로 승부한다.
 *
 * 배포 파이프라인에 넣어야 한다. 손으로 하는 핑은 반드시 끊긴다.
 *   npm run indexnow
 */
const KEY = "5290a22d868a944fd08049620faecd09";
const HOST = "speed-value.com";
const SITE = `https://${HOST}`;

async function urlsFromSitemap() {
  const res = await fetch(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`사이트맵을 못 읽었습니다: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const urlList = await urlsFromSitemap();
console.log(`제출할 URL ${urlList.length}개`);

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList,
  }),
});

// 200/202 는 접수됨. 그 외는 본문에 사유가 담긴다.
console.log(`IndexNow 응답: ${res.status} ${res.statusText}`);
if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}

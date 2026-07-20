// 결과 이미지 카드 생성 (FR-8) — 캔버스로 공유용 PNG를 만든다.
// 카카오톡 등 메신저에 이미지+링크로 공유되는 바이럴 루프의 핵심.

const CARD = 1080;
const FONT_STACK = '"Pretendard Variable", Pretendard, -apple-system, "Segoe UI", sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderResultImage({ speedValue, speedUnit, gradeTitle, isp, region }) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD;
  canvas.height = CARD;
  const ctx = canvas.getContext("2d");

  // 배경
  ctx.fillStyle = "#101113";
  ctx.fillRect(0, 0, CARD, CARD);

  // 상단 브랜드: 로고(번개) + 워드마크
  const logoSize = 88;
  const logoX = CARD / 2 - 150;
  const logoY = 120;
  ctx.fillStyle = "#0066FF";
  roundRect(ctx, logoX, logoY, logoSize, logoSize, 26);
  ctx.fill();
  // 번개 (SVG path 스케일: 24 → logoSize의 60%)
  const bolt = new Path2D("M13 2 4 14h6l-1 8 9-12h-6l1-8Z");
  ctx.save();
  const boltScale = (logoSize * 0.62) / 24;
  ctx.translate(logoX + logoSize / 2 - 12 * boltScale, logoY + logoSize / 2 - 12 * boltScale);
  ctx.scale(boltScale, boltScale);
  ctx.fillStyle = "#fff";
  ctx.fill(bolt);
  ctx.restore();

  ctx.fillStyle = "#fff";
  ctx.font = `700 64px ${FONT_STACK}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("스피드체크", logoX + logoSize + 28, logoY + logoSize / 2 + 2);

  // 중앙 큰 숫자
  ctx.textAlign = "center";
  ctx.font = `700 300px ${FONT_STACK}`;
  ctx.fillStyle = "#fff";
  ctx.fillText(String(speedValue), CARD / 2, 500);

  ctx.font = `600 52px ${FONT_STACK}`;
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillText(`${speedUnit} · 다운로드`, CARD / 2, 660);

  // 등급 배지
  if (gradeTitle) {
    ctx.font = `600 42px ${FONT_STACK}`;
    const padX = 44;
    const textW = ctx.measureText(gradeTitle).width;
    const pillW = textW + padX * 2;
    const pillH = 92;
    ctx.fillStyle = "rgba(255,255,255,0.13)";
    roundRect(ctx, CARD / 2 - pillW / 2, 730, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(gradeTitle, CARD / 2, 730 + pillH / 2 + 2);
  }

  // 환경 정보 (지역은 IP 추정치라 표기 최소화)
  const meta = [isp, region ? `${region} 추정` : null].filter(Boolean).join(" · ");
  if (meta) {
    ctx.font = `500 36px ${FONT_STACK}`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(meta, CARD / 2, 890);
  }

  // 하단 URL
  ctx.font = `600 38px ${FONT_STACK}`;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("speed-value.com · 무료 · 무가입 · 무설치", CARD / 2, 990);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/png");
  });
}

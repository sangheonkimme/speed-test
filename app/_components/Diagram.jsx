/*
 * 본문 도해 — 외부 이미지 없이 인라인 SVG로 그린다.
 *
 * 왜 인라인인가: 추가 요청이 없어 측정 화면의 대역폭을 뺏지 않고, 색을 CSS 변수로 쓰므로
 * 테마에 맞춰 변한다. 확대해도 깨지지 않는다.
 * 접근성: 장식이 아니라 내용이므로 role="img"과 title·desc를 반드시 준다.
 */

const C = {
  line: "var(--line)",
  ink: "var(--label-strong)",
  dim: "var(--label-assist)",
  body: "var(--label-neutral)",
  primary: "var(--primary)",
};

function Box({ x, y, w, h, label, sub, accent }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        fill={accent ? "rgba(0,102,255,0.08)" : "transparent"}
        stroke={accent ? C.primary : C.line}
        strokeWidth="1.5"
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 4 : y + h / 2 + 5}
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill={C.ink}
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize="11" fill={C.dim}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.line} strokeWidth="1.5" markerEnd="url(#dg-arrow)" />;
}

const Defs = () => (
  <defs>
    <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill={C.line} />
    </marker>
  </defs>
);

/** 회선에서 기기까지의 경로와 병목 지점 */
function Bottleneck() {
  return (
    <svg viewBox="0 0 640 180" role="img" aria-labelledby="dg-bn-t dg-bn-d">
      <title id="dg-bn-t">인터넷 회선에서 기기까지의 경로</title>
      <desc id="dg-bn-d">
        통신사 회선, 모뎀, 공유기, 기기 순서로 연결되며 각 구간이 속도를 제한할 수 있습니다. 유선 측정은
        공유기 앞까지, 와이파이 측정은 무선 구간까지 함께 잽니다.
      </desc>
      <Defs />
      <Box x="8" y="30" w="120" h="52" label="통신사 회선" sub="요금제 상한" />
      <Box x="168" y="30" w="100" h="52" label="모뎀" />
      <Box x="308" y="30" w="110" h="52" label="공유기" sub="무선 구간" accent />
      <Box x="458" y="30" w="120" h="52" label="내 기기" sub="노트북·휴대폰" />
      <Arrow x1="130" y1="56" x2="166" y2="56" />
      <Arrow x1="270" y1="56" x2="306" y2="56" />
      <Arrow x1="420" y1="56" x2="456" y2="56" />
      <line x1="63" y1="96" x2="63" y2="126" stroke={C.line} strokeDasharray="3 3" />
      <line x1="363" y1="96" x2="363" y2="126" stroke={C.line} strokeDasharray="3 3" />
      <line x1="518" y1="96" x2="518" y2="126" stroke={C.line} strokeDasharray="3 3" />
      <text x="63" y="142" textAnchor="middle" fontSize="11" fill={C.body}>
        회선 문제
      </text>
      <text x="363" y="142" textAnchor="middle" fontSize="11" fill={C.body}>
        공유기·전파 문제
      </text>
      <text x="518" y="142" textAnchor="middle" fontSize="11" fill={C.body}>
        기기 문제
      </text>
      <text x="8" y="170" fontSize="11" fill={C.dim}>
        유선으로 재면 공유기 앞까지, 와이파이로 재면 무선 구간까지 포함해 측정됩니다.
      </text>
    </svg>
  );
}

/** 2.4GHz와 5GHz의 도달 거리·속도 차이 */
function WifiBands() {
  return (
    <svg viewBox="0 0 640 210" role="img" aria-labelledby="dg-wb-t dg-wb-d">
      <title id="dg-wb-t">2.4GHz와 5GHz의 차이</title>
      <desc id="dg-wb-d">
        5GHz는 속도가 높지만 도달 거리가 짧고 벽에 약합니다. 2.4GHz는 느리지만 멀리 가고 벽을 비교적 잘
        통과합니다.
      </desc>
      <circle cx="96" cy="104" r="140" fill="none" stroke={C.line} strokeWidth="1.5" strokeDasharray="5 4" />
      <circle cx="96" cy="104" r="62" fill="rgba(0,102,255,0.10)" stroke={C.primary} strokeWidth="1.5" />
      <circle cx="96" cy="104" r="8" fill={C.primary} />
      <text x="96" y="130" textAnchor="middle" fontSize="11" fill={C.dim}>
        공유기
      </text>
      <text x="150" y="72" fontSize="12" fontWeight="700" fill={C.primary}>
        5GHz
      </text>
      <text x="150" y="88" fontSize="11" fill={C.dim}>
        빠르지만 가까이만
      </text>
      <text x="196" y="190" fontSize="12" fontWeight="700" fill={C.ink}>
        2.4GHz
      </text>
      <text x="196" y="206" fontSize="11" fill={C.dim}>
        느리지만 멀리·벽 너머까지
      </text>
      <rect x="330" y="40" width="300" height="126" rx="10" fill="transparent" stroke={C.line} />
      <text x="350" y="64" fontSize="12" fontWeight="700" fill={C.ink}>
        고를 때
      </text>
      <text x="350" y="88" fontSize="12" fill={C.body}>
        · 공유기와 같은 방이면 5GHz
      </text>
      <text x="350" y="110" fontSize="12" fill={C.body}>
        · 벽을 하나 이상 건너면 2.4GHz
      </text>
      <text x="350" y="132" fontSize="12" fill={C.body}>
        · 회선 속도 확인은 유선이 가장 정확
      </text>
      <text x="350" y="154" fontSize="11" fill={C.dim}>
        전자레인지·블루투스는 2.4GHz를 간섭합니다.
      </text>
    </svg>
  );
}

/** 핑과 지터의 차이 */
function PingJitter() {
  const steady = [40, 44, 41, 45, 40, 43, 41];
  const jumpy = [40, 95, 38, 120, 45, 88, 41];
  const toPath = (arr, baseY) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"} ${44 + i * 86} ${baseY - v * 0.42}`).join(" ");
  return (
    <svg viewBox="0 0 640 230" role="img" aria-labelledby="dg-pj-t dg-pj-d">
      <title id="dg-pj-t">핑이 같아도 지터가 다르면 체감이 다르다</title>
      <desc id="dg-pj-d">
        위쪽은 응답 시간이 고르게 유지되는 경우, 아래쪽은 평균이 비슷해도 응답 시간이 크게 튀는 경우입니다.
        아래쪽에서 캐릭터가 순간이동하거나 판정이 밀립니다.
      </desc>
      <text x="8" y="26" fontSize="12" fontWeight="700" fill={C.ink}>
        지터가 작을 때
      </text>
      <text x="8" y="44" fontSize="11" fill={C.dim}>
        응답 시간이 고르다 — 판정이 밀리지 않는다
      </text>
      <line x1="44" y1="96" x2="600" y2="96" stroke={C.line} strokeDasharray="3 3" />
      <path d={toPath(steady, 96)} fill="none" stroke={C.primary} strokeWidth="2" />
      <text x="8" y="140" fontSize="12" fontWeight="700" fill={C.ink}>
        지터가 클 때
      </text>
      <text x="8" y="158" fontSize="11" fill={C.dim}>
        평균은 비슷해도 순간적으로 튄다 — 순간이동·판정 밀림
      </text>
      <line x1="44" y1="212" x2="600" y2="212" stroke={C.line} strokeDasharray="3 3" />
      <path d={toPath(jumpy, 212)} fill="none" stroke={C.ink} strokeWidth="2" />
    </svg>
  );
}

/** 용도별 필요 대역폭 막대 */
function BandwidthBars() {
  const rows = [
    ["4K 스트리밍", 25, "약 15~25Mbps"],
    ["풀HD 스트리밍", 8, "약 5~8Mbps"],
    ["화상회의", 10, "약 4~10Mbps"],
    ["온라인 게임", 5, "대역폭보다 핑·지터"],
    ["웹서핑·SNS", 5, "약 5Mbps"],
  ];
  const scale = (v) => (v / 25) * 260;
  return (
    <svg viewBox="0 0 640 210" role="img" aria-labelledby="dg-bw-t dg-bw-d">
      <title id="dg-bw-t">용도별 권장 대역폭</title>
      <desc id="dg-bw-d">
        4K 스트리밍이 약 15에서 25Mbps로 가장 높고 나머지는 그보다 낮습니다. 100Mbps 회선이면 대부분의
        조합을 동시에 감당합니다.
      </desc>
      {rows.map(([name, v, note], i) => {
        const y = 20 + i * 34;
        return (
          <g key={name}>
            <text x="8" y={y + 14} fontSize="12" fill={C.body}>
              {name}
            </text>
            <rect
              x="140"
              y={y}
              width={scale(v)}
              height="20"
              rx="5"
              fill={i === 0 ? "rgba(0,102,255,0.35)" : "rgba(0,102,255,0.14)"}
              stroke={i === 0 ? C.primary : "transparent"}
            />
            <text x={150 + scale(v)} y={y + 14} fontSize="11" fill={C.dim}>
              {note}
            </text>
          </g>
        );
      })}
      <text x="8" y="200" fontSize="11" fill={C.dim}>
        동시에 쓰는 작업의 합으로 계산합니다. 4K 두 대와 화상회의 하나면 대략 40~60Mbps입니다.
      </text>
    </svg>
  );
}

/** 측정이 이루어지는 방식 */
function MeasureFlow() {
  return (
    <svg viewBox="0 0 640 190" role="img" aria-labelledby="dg-mf-t dg-mf-d">
      <title id="dg-mf-t">속도를 측정하는 방식</title>
      <desc id="dg-mf-d">
        브라우저가 가까운 Cloudflare 접속 지점에 연결 다섯 개를 동시에 열어 회선을 채우고, 0.2초마다 순간
        속도를 기록합니다. 값이 안정되면 상한 시간을 채우지 않고 끝냅니다.
      </desc>
      <Box x="8" y="56" w="130" h="56" label="내 브라우저" />
      <Box x="470" y="56" w="162" h="56" label="Cloudflare 엣지" sub="가까운 접속 지점" accent />
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1="140"
          y1={62 + i * 12}
          x2="468"
          y2={62 + i * 12}
          stroke={C.primary}
          strokeWidth="1.5"
          opacity="0.5"
        />
      ))}
      <text x="304" y="44" textAnchor="middle" fontSize="11" fill={C.dim}>
        연결 5개를 동시에 — 회선을 가득 채워야 최대 속도가 보인다
      </text>
      <text x="8" y="150" fontSize="11" fill={C.body}>
        0.2초마다 순간 속도를 기록하고, 값이 안정되면 조기 종료합니다 (최소 8초, 최대 15초).
      </text>
      <text x="8" y="172" fontSize="11" fill={C.dim}>
        핑은 다운로드를 시작하기 전에 따로 잽니다 — 함께 재면 서로 방해합니다.
      </text>
    </svg>
  );
}

/** 가입 총 납부액의 구성 */
function CostStack() {
  return (
    <svg viewBox="0 0 640 200" role="img" aria-labelledby="dg-cs-t dg-cs-d">
      <title id="dg-cs-t">실제로 내는 돈의 구성</title>
      <desc id="dg-cs-d">
        월 요금에 약정 개월을 곱한 금액과 설치비를 더하고, 현금 사은품과 결합 할인을 빼면 총 납부액이
        됩니다.
      </desc>
      <rect x="20" y="40" width="150" height="40" rx="8" fill="rgba(0,102,255,0.14)" stroke={C.line} />
      <text x="95" y="65" textAnchor="middle" fontSize="12" fill={C.ink}>
        월 요금 × 개월
      </text>
      <text x="184" y="66" fontSize="16" fill={C.dim}>
        +
      </text>
      <rect x="208" y="40" width="96" height="40" rx="8" fill="rgba(0,102,255,0.14)" stroke={C.line} />
      <text x="256" y="65" textAnchor="middle" fontSize="12" fill={C.ink}>
        설치비
      </text>
      <text x="318" y="66" fontSize="16" fill={C.dim}>
        −
      </text>
      <rect x="342" y="40" width="110" height="40" rx="8" fill="transparent" stroke={C.line} strokeDasharray="4 3" />
      <text x="397" y="65" textAnchor="middle" fontSize="12" fill={C.ink}>
        현금 사은품
      </text>
      <text x="466" y="66" fontSize="16" fill={C.dim}>
        −
      </text>
      <rect x="490" y="40" width="110" height="40" rx="8" fill="transparent" stroke={C.line} strokeDasharray="4 3" />
      <text x="545" y="65" textAnchor="middle" fontSize="12" fill={C.ink}>
        결합 할인
      </text>
      <line x1="20" y1="104" x2="600" y2="104" stroke={C.line} />
      <rect x="20" y="120" width="300" height="44" rx="10" fill="rgba(0,102,255,0.10)" stroke={C.primary} strokeWidth="1.5" />
      <text x="170" y="147" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink}>
        = 총 납부액 (비교 기준)
      </text>
      <text x="336" y="140" fontSize="11" fill={C.body}>
        사은품만 비교하면 약정이 길거나
      </text>
      <text x="336" y="158" fontSize="11" fill={C.body}>
        월 요금이 높은 조건을 놓칩니다.
      </text>
      <text x="20" y="188" fontSize="11" fill={C.dim}>
        중도 해지하면 남은 약정만큼 할인반환금과 사은품 반환금이 더해집니다.
      </text>
    </svg>
  );
}

const KINDS = {
  bottleneck: Bottleneck,
  "wifi-bands": WifiBands,
  "ping-jitter": PingJitter,
  bandwidth: BandwidthBars,
  "measure-flow": MeasureFlow,
  "cost-stack": CostStack,
};

export function Diagram({ kind, caption }) {
  const Svg = KINDS[kind];
  if (!Svg) return null;
  return (
    <figure className="figure">
      <Svg />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export const DIAGRAM_KINDS = Object.keys(KINDS);

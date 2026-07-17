export function ConversionCta({ variant, onClick }) {
  if (variant === "weak") return (
    <section className="cta-weak"><div className="grow"><div className="t">더 빠른 요금제가 궁금하다면</div><div className="d">현재 통신사·측정 속도 기준 현금 사은품 비교 · 광고</div></div><button className="btn btn-md btn-outline-primary" onClick={onClick}>비교하기</button></section>
  );

  return (
    <section className="cta-strong"><div className="eyebrow">측정 결과 기반 추천</div><div className="t">이 요금제면 최대 2배 빨라져요</div><div className="d">방금 측정한 속도 기준 추천이에요. 지금 개통 시 현금 사은품을 비교해 보세요.</div><button className="btn btn-lg btn-solid-white btn-full" onClick={onClick}>현금 사은품 비교하기</button><div className="legal">현재 통신사·측정 속도가 제휴 대리점에 전달돼요 · 광고</div></section>
  );
}

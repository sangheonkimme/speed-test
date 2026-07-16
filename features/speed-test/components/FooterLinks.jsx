export function FooterLinks() {
  const prevent = (event) => event.preventDefault();
  return <div className="foot">측정은 언제나 무료·무가입·무설치예요 · 개인정보는 수집하지 않아요<br /><a href="#" onClick={prevent}>측정 방법론</a>{" · "}<a href="#" onClick={prevent}>개인정보 처리방침</a>{" · "}<a href="#" onClick={prevent}>제휴 링크 고지</a></div>;
}

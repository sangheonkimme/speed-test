import Link from "next/link";

export function FooterLinks() {
  return (
    <div className="foot">
      측정은 언제나 무료·무가입·무설치예요
      <br />
      <Link href="/methodology">측정 방법론</Link>
      {" · "}
      <Link href="/privacy">개인정보 처리방침</Link>
    </div>
  );
}

/* ============================================================
 * SpeedCheck 측정 엔진 (FR-1 ~ FR-4) — 공개 API
 * - 브라우저 기반 HTTPS 멀티스트림 측정 (설치·가입 없음)
 * - 엔드포인트: Cloudflare Speed (Anycast, 서울 PoP)
 * - 자동 시작, 첫 추정치 3초 내, 상한 15초, 수렴 시 조기 종료
 * ============================================================ */

export { measurePing } from "./ping";
export { measureDownload } from "./download";
export { measureUpload } from "./upload";
export { detectEnvironment } from "./environment";

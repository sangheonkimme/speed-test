import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MethodologyPage from "./page";

describe("측정 방법론", () => {
  it("Cloudflare Anycast 특성을 실제 서버 위치보다 강하게 표현하지 않는다", () => {
    render(<MethodologyPage />);

    expect(screen.getByText(/가까운 Cloudflare 엣지/)).toBeInTheDocument();
    expect(screen.getByText(/실제 접속 서버와 네트워크 경로는.*달라질 수/)).toBeInTheDocument();
    expect(screen.queryByText(/국내 구간에서 측정/)).not.toBeInTheDocument();
  });
});

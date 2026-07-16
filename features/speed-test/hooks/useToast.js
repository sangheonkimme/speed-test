"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// toast 메시지 표시·교체·자동 소거 타이머만 담당
export function useToast(durationMs = 2200) {
  const [toastMsg, setToastMsg] = useState("");
  const timerRef = useRef(null);

  const toast = useCallback(
    (msg) => {
      setToastMsg(msg);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setToastMsg(""), durationMs);
    },
    [durationMs],
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { toastMsg, toast };
}

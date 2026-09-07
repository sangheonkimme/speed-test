/**
 * 가이드 본문 표.
 *
 * 답변엔진과 네이버 AI 브리핑은 표를 구조화된 사실로 안정 파싱하며, 산문 덩어리보다
 * 라벨-값 구조를 인용한다. 좁은 화면에서 가로 스크롤되도록 감싼다 (본문은 가로 스크롤 금지).
 */
export function GuideTable({ caption, headers, rows, note }) {
  return (
    <div className="table-wrap">
      <table>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={i}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="table-note">{note}</p>}
    </div>
  );
}

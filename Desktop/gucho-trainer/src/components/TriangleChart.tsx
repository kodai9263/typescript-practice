interface Props {
  triangleScore: number
  abstractRatio: number
}

export default function TriangleChart({ triangleScore, abstractRatio }: Props) {
  const concreteRatio = 100 - abstractRatio

  // スコアに応じて三角形の大きさを変える（最小20%〜最大100%）
  const scale = 0.2 + (triangleScore / 100) * 0.8

  // ベースとなる最大三角形の頂点
  const cx = 110
  const topY = 20
  const bottomY = 190
  const leftX = 20
  const rightX = 200

  // スコア三角形（中心から拡縮）
  const midX = cx
  const midY = (topY + bottomY) / 2

  const sTop = { x: midX + (cx - midX) * scale, y: midY + (topY - midY) * scale }
  const sLeft = { x: midX + (leftX - midX) * scale, y: midY + (bottomY - midY) * scale }
  const sRight = { x: midX + (rightX - midX) * scale, y: midY + (bottomY - midY) * scale }

  const scorePoints = `${sTop.x},${sTop.y} ${sRight.x},${sRight.y} ${sLeft.x},${sLeft.y}`
  const maxPoints = `${cx},${topY} ${rightX},${bottomY} ${leftX},${bottomY}`

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="220" height="230" className="overflow-visible">
          {/* 軸ラベル */}
          <text x="110" y="10" textAnchor="middle" fontSize="11" fill="#9ca3af">抽象</text>
          <text x="210" y="205" textAnchor="middle" fontSize="11" fill="#9ca3af">情報量</text>

          {/* 軸の矢印 */}
          <line x1="110" y1="195" x2="110" y2="22" stroke="#e5e7eb" strokeWidth="1.5" />
          <line x1="18" y1="195" x2="205" y2="195" stroke="#e5e7eb" strokeWidth="1.5" />
          <polygon points="110,18 107,26 113,26" fill="#e5e7eb" />
          <polygon points="208,195 200,192 200,198" fill="#e5e7eb" />

          {/* 最大三角形（背景） */}
          <polygon
            points={maxPoints}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 3"
          />

          {/* スコア三角形 */}
          <polygon
            points={scorePoints}
            fill="rgba(99,102,241,0.12)"
            stroke="#6366f1"
            strokeWidth="2"
          />

          {/* スコアテキスト */}
          <text x="110" y="115" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#6366f1">
            {triangleScore}
          </text>
          <text x="110" y="132" textAnchor="middle" fontSize="11" fill="#9ca3af">
            点
          </text>
        </svg>
      </div>

      {/* 抽象・具体の割合バー */}
      <div className="w-48">
        <div className="flex rounded-full overflow-hidden h-3">
          <div
            className="bg-indigo-500 transition-all duration-500"
            style={{ width: `${abstractRatio}%` }}
          />
          <div
            className="bg-orange-400 transition-all duration-500"
            style={{ width: `${concreteRatio}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-indigo-500 font-bold">抽象 {abstractRatio}%</span>
          <span className="text-orange-400 font-bold">具体 {concreteRatio}%</span>
        </div>
      </div>
    </div>
  )
}

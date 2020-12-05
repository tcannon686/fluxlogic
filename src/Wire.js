import React from 'react'

function Wire (props) {
  const x0 = Number(props.x0)
  const y0 = Number(props.y0)
  const x1 = Number(props.x1)
  const y1 = Number(props.y1)

  const curve = Math.min(Math.abs(y1 - y0), Math.abs(x1 - x0))
  const padding = 0.1 + (x1 < x0 ? curve * 0.25 : 0)

  const l = Math.min(x0, x1) - padding
  const t = Math.min(y0, y1) - padding

  const c0 = x0 - l + curve
  const c1 = x1 - l - curve

  const width = Math.abs(x1 - x0) + padding * 2
  const height = Math.abs(y1 - y0) + padding * 2

  const d = `M ${x0 - l} ${y0 - t} ` +
            `C ${c0} ${y0 - t}, ${c1} ${y1 - t}, ${x1 - l} ${y1 - t}`

  return (
    <svg
      width={`${width}in`}
      height={`${height}in`}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: 'absolute',
        left: `${l}in`,
        top: `${t}in`,
        pointerEvents: 'none'
      }}
    >
      <path
        d={d}
        stroke='black' strokeWidth='0.01' fill='transparent'
      />
    </svg>
  )
}

export default Wire

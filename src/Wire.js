import React from 'react'

/* A wire component. */
function Wire (props) {
  let x0 = Number(props.x0)
  let y0 = Number(props.y0)
  let x1 = Number(props.x1)
  let y1 = Number(props.y1)

  /* Swap if x0 > x1. */
  if (x0 > x1) {
    [x0, x1, y0, y1] = [x1, x0, y1, y0]
  }

  /* The styles for each of the two divs that make up the wire. */
  let style0
  let style1

  /* Calculate the border radius. */
  const borderRadius = Math.min(0.05, Math.abs(y1 - y0) / 2)

  /* Styles for if y0 is on top. */
  if (y1 > y0) {
    style0 = {
      borderLeft: 'none',
      borderBottom: 'none',
      left: `${x0}in`,
      top: `${y0}in`,
      width: `${(x1 - x0) / 2}in`,
      height: `${(y1 - y0) / 2}in`,
      borderRadius: `0 ${borderRadius}in 0 0`
    }

    style1 = {
      borderRight: 'none',
      borderTop: 'none',
      left: `${(x0 + x1) / 2}in`,
      top: `${(y0 + y1) / 2}in`,
      width: `${(x1 - x0) / 2}in`,
      height: `${(y1 - y0) / 2}in`,
      borderRadius: `0 0 0 ${borderRadius}in`
    }

  /* Styles for if y1 is on top. */
  } else {
    style0 = {
      borderLeft: 'none',
      borderTop: 'none',
      left: `${x0}in`,
      top: `${(y1 + y0) / 2}in`,
      width: `${(x1 - x0) / 2}in`,
      height: `${(y0 - y1) / 2}in`,
      borderRadius: `0 0 ${borderRadius}in 0`
    }

    style1 = {
      borderRight: 'none',
      borderBottom: 'none',
      left: `${(x0 + x1) / 2}in`,
      top: `${y1}in`,
      width: `${(x1 - x0) / 2}in`,
      height: `${-(y1 - y0) / 2}in`,
      borderRadius: `${borderRadius}in 0 0 0`
    }
  }

  return (
    <div>
      <div className='wire' style={style0} />
      <div className='wire' style={style1} />
    </div>
  )
}

export default Wire

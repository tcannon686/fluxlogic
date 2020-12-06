import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'

const useStyles = makeStyles((theme) => ({
  selectionBox: {
    position: 'fixed',
    border: `1px solid ${theme.palette.primary.main}`,
    background: fade(theme.palette.primary.main, 0.25),
    pointerEvents: 'none'
  }
}))

/*
 * A react component for a selection box dragged by the user.
 */
function SelectionBox (props) {
  const [selectionEnd, setSelectionEnd] = useState(props.selectionStart)

  const classes = useStyles()

  const onMouseMove = (e) => {
    setSelectionEnd([e.clientX, e.clientY])
    props.onSelectionChanged(
      [
        Math.min(props.selectionStart[0], selectionEnd[0]),
        Math.min(props.selectionStart[1], selectionEnd[1])
      ],
      [
        Math.max(props.selectionStart[0], selectionEnd[0]),
        Math.max(props.selectionStart[1], selectionEnd[1])
      ])
  }

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
    }
  })

  const hasMoved = (
    selectionEnd[0] !== props.selectionStart[0] &&
    selectionEnd[1] !== props.selectionStart[1])

  /*
   * The selection box should only be visible after the user moves their mouse.
   */
  return hasMoved && (
    <div
      className={classes.selectionBox} style={{
        left: Math.min(props.selectionStart[0], selectionEnd[0]),
        top: Math.min(props.selectionStart[1], selectionEnd[1]),
        width: Math.abs(selectionEnd[0] - props.selectionStart[0]),
        height: Math.abs(selectionEnd[1] - props.selectionStart[1])
      }}
    />
  )
}

export default SelectionBox

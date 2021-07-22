import React, { useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'

const useStyles = makeStyles((theme) => ({
  selectionBox: {
    position: 'fixed',
    background: fade(theme.palette.primary.main, 0.3),
    pointerEvents: 'none'
  }
}))

/*
 * A react component for a selection box dragged by the user.
 */
function SelectionBox (props) {
  const selectionStart = props.selectionStart
  const onSelectionChanged = props.onSelectionChanged
  const ref = useRef()

  const classes = useStyles()

  useEffect(() => {
    const onMouseMove = (e) => {
      const end = [e.clientX, e.clientY]
      if (ref.current) {
        const box = ref.current
        box.style.left = Math.min(selectionStart[0], end[0]) + 'px'
        box.style.top = Math.min(selectionStart[1], end[1]) + 'px'
        box.style.width = Math.abs(end[0] - selectionStart[0]) + 'px'
        box.style.height = Math.abs(end[1] - selectionStart[1]) + 'px'
        box.style.display = 'inline'
      }
      onSelectionChanged(
        [
          Math.min(selectionStart[0], end[0]),
          Math.min(selectionStart[1], end[1])
        ],
        [
          Math.max(selectionStart[0], end[0]),
          Math.max(selectionStart[1], end[1])
        ])
    }

    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [selectionStart, onSelectionChanged])

  /*
   * The selection box should only be visible after the user moves their mouse.
   */
  return (
    <div
      ref={ref}
      className={classes.selectionBox}
      style={{ display: 'none' }}
    />
  )
}

export default SelectionBox

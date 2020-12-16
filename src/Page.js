import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Wire from './Wire'
import Circuit from './Circuit'
import SelectionBox from './SelectionBox'

const useStyles = makeStyles((theme) => ({
  page: {
    width: '8.5in',
    height: '11in',
    background: 'white',
    position: 'relative',
    margin: 'auto',
    boxShadow: '0 0 .05in #aaa',
    marginBottom: '0.1in'
  }
}))

/*
 * A react component for the wire currently being dragged by the user.
 */
function PreviewWire (props) {
  const [end, setEnd] = useState([props.x0, props.y0])

  const clientToPage = props.clientToPage

  useEffect(() => {
    const onMouseMove = (e) => {
      setEnd(clientToPage([e.clientX, e.clientY]))
    }
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [clientToPage])

  if (props.isOutputPin) {
    return (
      <Wire x0={props.x0} y0={props.y0} x1={end[0]} y1={end[1]} />
    )
  } else {
    return (
      <Wire x1={props.x0} y1={props.y0} x0={end[0]} y0={end[1]} />
    )
  }
}

const Page = React.forwardRef((props, ref) => {
  const selection = props.selection
  const theme = props.theme

  const isEditable = props.editable
  const circuit = props.circuit

  const onSelectionChanged = props.onSelectionChanged
  const onWireAdded = props.onWireAdded

  const classes = useStyles()

  const [selectionStart, setSelectionStart] = useState(null)

  /* Object containing IDs of gates currently being selected. */
  const [toBeAddedToSelection, setToBeAddedToSelection] = useState({})

  /* Whether or not the selected items are being dragged. */
  const [isDragging, setIsDragging] = useState(false)

  /*
   * Whether or not the selected items were dragged (to prevent the click event
   * from being fired after a drag.
   */
  const [didDrag, setDidDrag] = useState(false)

  /* The start and end positions of the drag in client coordinates. */
  const [moveStart, setMoveStart] = useState([0, 0])
  const [moveEnd, setMoveEnd] = useState([0, 0])

  const [wireStartPin, setWireStartPin] = useState(null)

  /* Whether or not the pin being dragged from is an output pin. */
  const [wireStartPinIsOutput, setWireStartPinIsOutput] = useState(false)

  /* The amount to move teh selected components in page coordinates. */
  const moveAmount = isDragging
    ? [
      (moveEnd[0] - moveStart[0]) / 96,
      (moveEnd[1] - moveStart[1]) / 96
    ]
    : [0, 0]

  /*
   * Function to convert from client coordianates to coordinates on the page.
   */
  const clientToPage = (coord) => {
    const bounds = ref.current.getBoundingClientRect()
    return [
      (coord[0] - bounds.left) / 96,
      (coord[1] - bounds.top) / 96
    ]
  }

  /* Called when the bounds of the selection box changes. */
  const onSelectionBoxChanged = (ul, br) => {
    /* Calculate the selection on the page. */

    const a = clientToPage(ul)
    const b = clientToPage(br)

    let clone = null

    /* Determine if any items were added to the selection. */
    circuit.gates.forEach((gate) => {
      const width = props.theme.getWidth(gate)
      const height = props.theme.getHeight(gate)

      const isOverlapping = (
        gate.x >= a[0] && gate.y >= a[1] &&
        gate.x + width <= b[0] && gate.y + height <= b[1])

      if (isOverlapping && !toBeAddedToSelection[gate.id]) {
        if (!clone) {
          clone = Object.assign({}, toBeAddedToSelection)
        }
        clone[gate.id] = true
      } else if (!isOverlapping && toBeAddedToSelection[gate.id]) {
        if (!clone) {
          clone = Object.assign({}, toBeAddedToSelection)
        }
        delete clone[gate.id]
      }
    })

    if (clone) {
      setToBeAddedToSelection(clone)
    }
  }

  const onGateClick = useCallback((e, id) => {
    if (isEditable) {
      if (!didDrag) {
        const newSelection = {}
        if (e.shiftKey) {
          Object.assign(newSelection, selection)
        }
        newSelection[id] = !newSelection[id]
        onSelectionChanged(newSelection)
        e.stopPropagation()
      }
    }
  }, [selection, isEditable, didDrag, onSelectionChanged])

  const onGateMouseDown = useCallback((e, id) => {
    if (isEditable) {
      setMoveStart([e.clientX, e.clientY])
      setMoveEnd([e.clientX, e.clientY])
      setDidDrag(false)
      if (selection[id]) {
        setIsDragging(true)
      }
      e.stopPropagation()
    }
    e.preventDefault()
  }, [isEditable, selection, setMoveStart, setMoveEnd, setDidDrag])

  const onPinMouseDown = useCallback((e, id, isOutputPin) => {
    if (isEditable) {
      setWireStartPin(id)
      setWireStartPinIsOutput(isOutputPin)
      e.stopPropagation()
    }
    e.preventDefault()
  }, [setWireStartPin, setWireStartPinIsOutput, isEditable])

  const onPinMouseUp = useCallback((e, id, isOutputPin) => {
    if (isEditable) {
      /*
       * Add a wire if the wire start pin is different from the wire
       * end pin, and both of the pins are not output pins
       */
      if (wireStartPin !== null &&
          wireStartPin !== id &&
          isOutputPin ^ wireStartPinIsOutput) {
        onWireAdded(wireStartPin, id)
        e.stopPropagation()
        e.preventDefault()
      }
      setWireStartPin(null)
    }
  }, [isEditable, wireStartPin, wireStartPinIsOutput, onWireAdded])

  /*
   * The total selection, including elements currently being selected as well as
   * the previously selected elements.
   */
  const totalSelection = { ...props.selection, ...toBeAddedToSelection }

  /* An object that maps each pin to its position. */
  const pinPositions = useMemo(() => {
    const positions = {}

    /* Calculate the pin positions. */
    circuit.gates.forEach((gate) => {
      const x = (gate.x || 0) + (selection[gate.id] ? moveAmount[0] : 0)
      const y = (gate.y || 0) + (selection[gate.id] ? moveAmount[1] : 0)

      Object.assign(positions, theme.getPinPositions(gate, x, y))
    })

    return positions
  }, [selection, theme, moveAmount, circuit])

  /*
   * Add a mouseup event listener to the window. We need to do this in case the
   * user drags outside the window.
   */
  useEffect(() => {
    const onMouseUp = (e) => {
      if (!isEditable) {
        e.preventDefault()
      } else {
        if (isDragging) {
          props.onMove(moveAmount)
          setIsDragging(false)
          e.stopPropagation()
        } else if (selectionStart) {
          setToBeAddedToSelection({})
          onSelectionChanged(totalSelection)
        }
        setSelectionStart(null)

        if (wireStartPin !== null) {
          setWireStartPin(null)
        }
        e.preventDefault()
      }
    }

    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  })

  useEffect(() => {
    if (isEditable) {
      const onMouseMove = (e) => {
        if (isDragging) {
          setMoveEnd([
            e.clientX,
            e.clientY
          ])
        }

        if (!didDrag) {
          setDidDrag(true)
        }
      }
      window.addEventListener('mousemove', onMouseMove)
      return () => window.removeEventListener('mousemove', onMouseMove)
    }
  }, [isDragging, didDrag, isEditable])

  return (
    <div
      className={classes.page} ref={ref}
      onMouseDown={(e) => {
        if (isEditable) {
          setSelectionStart([e.clientX, e.clientY])

          /* Reset the selection if the user did not click shift. */
          if (!e.shiftKey) {
            onSelectionChanged({})
          }
        }

        e.preventDefault()
      }}
    >
      <Circuit
        circuit={circuit}
        editable={isEditable}
        selection={totalSelection}
        theme={theme}
        moveAmount={moveAmount}
        onPinMouseDown={onPinMouseDown}
        onPinMouseUp={onPinMouseUp}
        onGateClick={onGateClick}
        onGateMouseDown={onGateMouseDown}
        simState={props.simState}
      />
      {
        isEditable && selectionStart && (
          <SelectionBox
            selectionStart={selectionStart}
            onSelectionChanged={onSelectionBoxChanged}
          />
        )
      }

      {
        isEditable && wireStartPin !== null && (
          <PreviewWire
            x0={pinPositions[wireStartPin].x}
            y0={pinPositions[wireStartPin].y}
            clientToPage={clientToPage}
            isOutputPin={wireStartPinIsOutput}
          />
        )
      }
    </div>
  )
})

export default Page

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import logic from './logic'

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

  const simState = props.simState

  const isEditable = props.editable
  const circuit = props.circuit
  const page = props.page

  const onCircuitChanged = props.onCircuitChanged

  const onSelectionChanged = props.onSelectionChanged
  const onUserInputChanged = props.onUserInputChanged

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

  /* The gates on the current page. */
  const gates = useMemo(() => page !== undefined
    ? circuit.gates.filter((gate) => (gate.page || 0) === page)
    : circuit.gates,
  [circuit, page]
  )

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
    gates.forEach((gate) => {
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

  const onGateClick = useCallback((e, gate) => {
    if (isEditable && e.button === 0) {
      if (!didDrag) {
        const newSelection = {}
        if (e.shiftKey) {
          Object.assign(newSelection, selection)
        }
        newSelection[gate.id] = !newSelection[gate.id]
        onSelectionChanged(newSelection)
        e.stopPropagation()
      }
    } else if (simState != null) {
      if (gate.type === 'switch') {
        onUserInputChanged(gate, !logic.getUserInput(gate, simState))
      }
    }
  }, [
    selection,
    isEditable,
    didDrag,
    onSelectionChanged,
    onUserInputChanged,
    simState
  ])

  const onGateMouseDown = useCallback((e, gate) => {
    if (isEditable && e.button === 0) {
      setMoveStart([e.clientX, e.clientY])
      setMoveEnd([e.clientX, e.clientY])
      setDidDrag(false)
      if (selection[gate.id]) {
        setIsDragging(true)
      }
      e.stopPropagation()
    }
    e.preventDefault()
  }, [isEditable, selection, setMoveStart, setMoveEnd, setDidDrag])

  const onMove = useCallback((moveAmount) => {
    const clone = { ...circuit }
    clone.gates = clone.gates.map((gate) => {
      if (selection[gate.id]) {
        /* Copy the gate. */
        gate = { ...gate }
        gate.x += moveAmount[0]
        gate.y += moveAmount[1]
      }
      return gate
    })
    onCircuitChanged(clone)
  }, [circuit, selection, onCircuitChanged])

  const addWire = useCallback((from, to) => {
    const clone = { ...circuit }

    /*
     * Function that takes in a pin, clones it and adds a connection if it is
     * the from or to pin. Returns the pin otherwise.
     */
    const updatePin = (pin, isOutputPin) => {
      if (isOutputPin || pin.connections.length === 0) {
        if (pin.id === from) {
          return { ...pin, connections: [...pin.connections, to] }
        } else if (pin.id === to) {
          return { ...pin, connections: [...pin.connections, from] }
        }
      }
      return pin
    }

    /* Only update if the input pin has no connections. */
    let shouldUpdate = false

    clone.gates = clone.gates.map((gate) => {
      let hasPin = false
      const inputs = gate.inputs.map((pin) => {
        const r = updatePin(pin)
        if (r !== pin) {
          hasPin = true
        }
        return r
      })

      /* If the gate has the pin, clone the gate. */
      if (hasPin) {
        shouldUpdate = true
        return { ...gate, inputs }
      } else {
        return gate
      }
    })

    if (shouldUpdate) {
      /* Update output pin. */
      clone.gates = clone.gates.map((gate) => {
        let hasPin = false
        const outputs = gate.outputs.map((pin) => {
          const r = updatePin(pin, true)
          if (r !== pin) {
            hasPin = true
          }
          return r
        })

        /* If the gate has the pin, clone it. */
        if (hasPin) {
          return { ...gate, outputs }
        } else {
          return gate
        }
      })

      onCircuitChanged(clone)
    }
  }, [circuit, onCircuitChanged])

  const onPinMouseDown = useCallback((e, pin, isOutputPin) => {
    if (isEditable && e.button === 0) {
      /* If the pin is an output pin, start dragging a wire from it. */
      if (isOutputPin) {
        setWireStartPin(pin.id)
        setWireStartPinIsOutput(isOutputPin)
      } else {
        /*
         * If the pin is an input pin and already has a connection, remove the
         * connection and start dragging from the connected pin.
         */
        if (pin.connections.length > 0) {
          const clone = { ...circuit }
          clone.gates = clone.gates.map((gate) => {
            const inIndex = gate.inputs.indexOf(pin)
            const outIndex = gate.outputs.findIndex(
              (output) => output.id === pin.connections[0])

            if (inIndex !== -1) {
              const gateClone = {
                ...gate,
                inputs: [...gate.inputs]
              }

              /* Remove the connection. */
              gateClone.inputs[inIndex] = { ...pin, connections: [] }

              return gateClone
            } else if (outIndex !== -1) {
              const output = gate.outputs[outIndex]
              const gateClone = {
                ...gate,
                outputs: [...gate.outputs]
              }

              /* Remove the connection. */
              gateClone.outputs[outIndex] = {
                ...output,
                connections: output.connections.filter((id) => id !== pin.id)
              }

              return gateClone
            } else {
              return gate
            }
          })

          /* Update the circuit */
          onCircuitChanged(clone)

          setWireStartPin(pin.connections[0])
          setWireStartPinIsOutput(true)
        } else {
          setWireStartPin(pin.id)
          setWireStartPinIsOutput(isOutputPin)
        }
      }
    }
    e.stopPropagation()
    e.preventDefault()
  }, [
    circuit,
    isEditable,
    setWireStartPin,
    setWireStartPinIsOutput,
    onCircuitChanged
  ])

  const onPinMouseUp = useCallback((e, pin, isOutputPin) => {
    if (isEditable) {
      /*
       * Add a wire if the wire start pin is different from the wire
       * end pin, and both of the pins are not output pins
       */
      if (wireStartPin !== null &&
          wireStartPin !== pin.id &&
          isOutputPin ^ wireStartPinIsOutput) {
        addWire(wireStartPin, pin.id)
        e.stopPropagation()
        e.preventDefault()
      }
      setWireStartPin(null)
    }
  }, [isEditable, wireStartPin, wireStartPinIsOutput, addWire])

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
      } else if (e.button === 0) {
        if (isDragging) {
          onMove(moveAmount)
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
        if (isEditable && e.button === 0) {
          setSelectionStart([e.clientX, e.clientY])

          /* Reset the selection if the user did not click shift. */
          if (!e.shiftKey) {
            onSelectionChanged({})
          }
        }

        e.preventDefault()
      }}
    >
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
      <Circuit
        page={props.page}
        circuit={circuit}
        editable={isEditable}
        selection={totalSelection}
        theme={theme}
        moveAmount={moveAmount}
        onPinMouseDown={onPinMouseDown}
        onPinMouseUp={onPinMouseUp}
        onGateClick={onGateClick}
        onGateMouseDown={onGateMouseDown}
        simState={simState}
      />
      {
        isEditable && selectionStart && (
          <SelectionBox
            selectionStart={selectionStart}
            onSelectionChanged={onSelectionBoxChanged}
          />
        )
      }
    </div>
  )
})

export default Page

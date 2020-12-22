import React, { useMemo } from 'react'
import { useRefCallback } from './hooks'

import Wire from './Wire'
import LogicGate from './LogicGate'

/**
 * React component used to hold a circuit.
 */
export default function Circuit (props) {
  const theme = props.theme

  const isEditable = props.editable
  const circuit = props.circuit

  const selection = props.selection
  const moveAmount = props.moveAmount

  const simState = props.simState

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

  const onGateClick = useRefCallback(props.onGateClick, [])
  const onGateMouseDown = useRefCallback(props.onGateMouseDown, [])

  const onPinMouseUp = useRefCallback(props.onPinMouseUp, [])
  const onPinMouseDown = useRefCallback(props.onPinMouseDown, [])

  return (
    <>
      {
        /* Wires */
        circuit.gates.map(
          (gate) => gate.inputs
            .filter((pin) => pin.connections[0])
            .map((pin) =>
              <Wire
                key={`${pin.id}-${pin.connections[0].id}`}
                x0={pinPositions[pin.connections[0]].x}
                y0={pinPositions[pin.connections[0]].y}
                x1={pinPositions[pin.id].x}
                y1={pinPositions[pin.id].y}
              />))
      }

      {
        /* Gates */
        circuit.gates.map((gate) => {
          const x = (gate.x || 0) +
            (props.selection[gate.id] ? moveAmount[0] : 0)
          const y = (gate.y || 0) +
            (props.selection[gate.id] ? moveAmount[1] : 0)

          return (
            <LogicGate
              gate={gate}
              svg={theme.getGateSvg(gate, simState)}
              x={x}
              y={y}
              key={gate.id}
              theme={theme}
              selected={selection[gate.id]}
              editable={isEditable}
              onGateClick={onGateClick}
              onGateMouseDown={onGateMouseDown}
              onPinMouseDown={onPinMouseDown}
              onPinMouseUp={onPinMouseUp}
            />
          )
        })
      }
    </>
  )
}

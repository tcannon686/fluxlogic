import React from 'react'

import Wire from './Wire'

function LogicGate (props) {
  /* The object responsible for placing the pins and chooising the style. */
  const theme = props.theme

  /* The position of the gate. */
  const x = props.gate.x
  const y = props.gate.y

  /* The positions of the pins. */
  const pinPositions = theme.getPinPositions(props.gate, x, y)

  return (
    <div
      style={{ left: `${x}in`, top: `${y}in` }}
      className='gate'
    >

      {
        /* Input pin wires */
        props.gate.outputs.map((pin) =>
          <Wire
            key={`${pin.id}-`}
            x0={pinPositions[pin.id].x - x}
            y0={pinPositions[pin.id].y - y}
            x1={pinPositions[pin.id].x - x - 0.25}
            y1={pinPositions[pin.id].y - y}
          />)
      }

      {
        /* Output pin wires */
        props.gate.inputs.map((pin) =>
          <Wire
            key={`${pin.id}-`}
            x0={pinPositions[pin.id].x - x}
            y0={pinPositions[pin.id].y - y}
            x1={pinPositions[pin.id].x - x + 0.25}
            y1={pinPositions[pin.id].y - y}
          />)
      }

      {/* The gate itself */}
      <img
        alt={props.gate.type}
        src={theme.getGateSvg(props.gate)}
        style={{
          position: 'absolute'
        }}
      />

      {
        /* Input pins */
        props.gate.inputs.map((pin, i) =>
          <img
            alt={`input ${i}`}
            src={theme.getPinSvg(pin)}
            key={pin.id}
            style={{
              left: `${pinPositions[pin.id].x - x - 0.0625}in`,
              top: `${pinPositions[pin.id].y - y - 0.0625}in`,
              position: 'absolute'
            }}
          />
        )
      }

      {
        /* Output pins */
        props.gate.outputs.map((pin, i) =>
          <img
            alt={`output ${i}`}
            src={theme.getPinSvg(pin)}
            key={pin.id}
            style={{
              left: `${0.5 - 0.0625}in`,
              top: `${0.25 - 0.0625}in`,
              position: 'absolute'
            }}
          />
        )
      }
    </div>
  )
}

const Page = React.forwardRef((props, ref) => {
  const circuit = props.circuit

  /* An object that maps each pin to its position. */
  const pinPositions = (() => {
    const initialState = {}
    circuit.gates.forEach((gate) => {
      Object.assign(initialState,
        props.theme.getPinPositions(
          gate,
          gate.x || 0,
          gate.y || 0))
    })
    return initialState
  })()

  return (
    <div className='page' ref={ref}>
      {
        /* Wires */
        circuit.gates.map(
          (gate) => gate.inputs
            .filter((pin) => pin.connections[0])
            .map((pin) =>
              <Wire
                key={`${pin.id}-${pin.connections[0].id}`}
                x0={pinPositions[pin.id].x}
                y0={pinPositions[pin.id].y}
                x1={pinPositions[pin.connections[0]].x}
                y1={pinPositions[pin.connections[0]].y}
              />))
      }

      {
        /* Gates */
        circuit.gates.map((gate) =>
          (
            <LogicGate
              gate={gate}
              key={gate.id}
              theme={props.theme}
            />
          )
        )
      }
    </div>
  )
})

export default Page

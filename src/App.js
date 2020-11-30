import React from 'react'
import './App.css'
import Page from './Page'
import logic from './logic'
import { defaultTheme } from './themes'

function App () {
  /* TODO allow for editing, etc... */
  const circuit = logic.circuit([
    logic.constantGate(),
    logic.buffer(),
    logic.andGate(),
    logic.andGate(),
    logic.orGate()
  ])

  logic.connect(circuit.gates[0].outputs[0], circuit.gates[1].inputs[0])
  logic.connect(circuit.gates[1].outputs[0], circuit.gates[2].inputs[0])
  logic.connect(circuit.gates[2].outputs[0], circuit.gates[3].inputs[1])
  logic.connect(circuit.gates[3].outputs[0], circuit.gates[4].inputs[0])
  logic.connect(circuit.gates[3].outputs[0], circuit.gates[4].inputs[1])

  circuit.gates[0].outputs[0].isInverted = true

  circuit.gates.forEach((gate, i) => {
    gate.x = 1 + i
    gate.y = 1
  })

  return (
    <div className='App'>
      <Page circuit={circuit} theme={defaultTheme} />
    </div>
  )
}

export default App

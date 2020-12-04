/* eslint-env jest */

import React from 'react'
import { render } from '@testing-library/react'
import Page from './Page'
import logic from './logic'
import { defaultTheme } from './themes'

test('renders logic components', () => {
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

  const { getAllByAltText } = render(
    <Page selection={{}} circuit={circuit} theme={defaultTheme} />)

  expect(getAllByAltText('buffer').length).toEqual(1)
  expect(getAllByAltText('or').length).toEqual(1)
  expect(getAllByAltText('constant').length).toEqual(1)
  expect(getAllByAltText('and').length).toEqual(2)
})

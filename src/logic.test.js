/* eslint-env jest */

import logic from './logic'

test('simulates constant gate', () => {
  const gate = logic.constantGate(true)
  const circuit = logic.circuit([gate])

  let state = logic.nextState(circuit)
  expect(state.getOutputs(gate)).toEqual([false])

  state = logic.nextState(circuit, state)

  expect(state.getOutputs(gate)).toEqual([true])
})

test('simulates and-gate', () => {
  const gates = [
    logic.constantGate(false),
    logic.constantGate(false),
    logic.andGate()
  ]

  const circuit = logic.circuit(gates)

  logic.connect(gates[0].outputs[0], gates[2].inputs[0])
  logic.connect(gates[1].outputs[0], gates[2].inputs[1])

  for (let i = 0; i < 4; i++) {
    const a = (i & 1) === 1
    const b = (i & 2) === 2

    gates[0].value = a
    gates[1].value = b

    const state = logic.fastForward(circuit, 10)
    expect(state.getOutputs(gates[2])).toEqual([a && b])
  }
})

test('simulates or-gate', () => {
  const gates = [
    logic.constantGate(false),
    logic.constantGate(false),
    logic.orGate()
  ]

  const circuit = logic.circuit(gates)

  logic.connect(gates[0].outputs[0], gates[2].inputs[0])
  logic.connect(gates[1].outputs[0], gates[2].inputs[1])

  for (let i = 0; i < 4; i++) {
    const a = (i & 1) === 1
    const b = (i & 2) === 2

    gates[0].value = a
    gates[1].value = b

    const state = logic.fastForward(circuit, 10)
    expect(state.getOutputs(gates[2])).toEqual([a || b])
  }
})

test('simulates (a or b) and c', () => {
  const gates = [
    logic.constantGate(false),
    logic.constantGate(false),
    logic.constantGate(false),
    logic.orGate(),
    logic.andGate()
  ]

  const circuit = logic.circuit(gates)

  logic.connect(gates[0].outputs[0], gates[3].inputs[0])
  logic.connect(gates[1].outputs[0], gates[3].inputs[1])
  logic.connect(gates[2].outputs[0], gates[4].inputs[1])
  logic.connect(gates[3].outputs[0], gates[4].inputs[0])

  for (let i = 0; i < 8; i++) {
    const a = (i & 1) === 1
    const b = (i & 2) === 2
    const c = (i & 4) === 4

    gates[0].value = a
    gates[1].value = b
    gates[2].value = c

    const state = logic.fastForward(circuit, 10)
    expect(state.getOutputs(gates[4])).toEqual([(a || b) && c])
  }
})

test('simulates (a and b) or c', () => {
  const gates = [
    logic.constantGate(false),
    logic.constantGate(false),
    logic.constantGate(false),
    logic.andGate(),
    logic.orGate()
  ]

  const circuit = logic.circuit(gates)

  logic.connect(gates[0].outputs[0], gates[3].inputs[0])
  logic.connect(gates[1].outputs[0], gates[3].inputs[1])
  logic.connect(gates[2].outputs[0], gates[4].inputs[1])
  logic.connect(gates[3].outputs[0], gates[4].inputs[0])

  for (let i = 0; i < 8; i++) {
    const a = (i & 1) === 1
    const b = (i & 2) === 2
    const c = (i & 4) === 4

    gates[0].value = a
    gates[1].value = b
    gates[2].value = c

    const state = logic.fastForward(circuit, 10)
    expect(state.getOutputs(gates[4])).toEqual([(a && b) || c])
  }
})

test('simulates !(a and b) or c', () => {
  const gates = [
    logic.constantGate(false),
    logic.constantGate(false),
    logic.constantGate(false),
    logic.andGate(),
    logic.orGate()
  ]

  const circuit = logic.circuit(gates)

  logic.connect(gates[0].outputs[0], gates[3].inputs[0])
  logic.connect(gates[1].outputs[0], gates[3].inputs[1])
  logic.connect(gates[2].outputs[0], gates[4].inputs[1])
  logic.connect(gates[3].outputs[0], gates[4].inputs[0])

  gates[3].outputs[0].isInverted = true

  for (let i = 0; i < 8; i++) {
    const a = (i & 1) === 1
    const b = (i & 2) === 2
    const c = (i & 4) === 4

    gates[0].value = a
    gates[1].value = b
    gates[2].value = c

    const state = logic.fastForward(circuit, 10)
    expect(state.getOutputs(gates[4])).toEqual([!(a && b) || c])
  }
})

test('simulates !!(!a and !b) or c', () => {
  const gates = [
    logic.constantGate(false),
    logic.constantGate(false),
    logic.constantGate(false),
    logic.andGate(),
    logic.orGate()
  ]

  const circuit = logic.circuit(gates)

  logic.connect(gates[0].outputs[0], gates[3].inputs[0])
  logic.connect(gates[1].outputs[0], gates[3].inputs[1])
  logic.connect(gates[2].outputs[0], gates[4].inputs[1])
  logic.connect(gates[3].outputs[0], gates[4].inputs[0])

  gates[0].outputs[0].isInverted = true
  gates[1].outputs[0].isInverted = true
  gates[3].outputs[0].isInverted = true
  gates[4].inputs[0].isInverted = true

  for (let i = 0; i < 8; i++) {
    const a = (i & 1) === 1
    const b = (i & 2) === 2
    const c = (i & 4) === 4

    gates[0].value = a
    gates[1].value = b
    gates[2].value = c

    const state = logic.fastForward(circuit, 10)
    expect(state.getOutputs(gates[4])).toEqual([(!a && !b) || c])
  }
})

test('simulates SR-latch', () => {
  const gates = [
    logic.constantGate(false), /* Set */
    logic.constantGate(false), /* Reset */
    logic.orGate(), /* !Q */
    logic.orGate() /* Q */
  ]

  gates[2].outputs[0].isInverted = true
  gates[3].outputs[0].isInverted = true

  logic.connect(gates[0].outputs[0], gates[2].inputs[0])
  logic.connect(gates[1].outputs[0], gates[3].inputs[1])
  logic.connect(gates[2].outputs[0], gates[3].inputs[0])
  logic.connect(gates[3].outputs[0], gates[2].inputs[1])

  const circuit = logic.circuit(gates)

  let state = logic.nextState(circuit)
  gates[0].value = true

  state = logic.fastForward(circuit, 10, state)
  expect(state.getOutputs(gates[2])).toEqual([false])
  expect(state.getOutputs(gates[3])).toEqual([true])

  gates[0].value = false

  state = logic.fastForward(circuit, 10, state)
  expect(state.getOutputs(gates[2])).toEqual([false])
  expect(state.getOutputs(gates[3])).toEqual([true])

  gates[1].value = true

  state = logic.fastForward(circuit, 10, state)
  expect(state.getOutputs(gates[2])).toEqual([true])
  expect(state.getOutputs(gates[3])).toEqual([false])

  gates[1].value = false
  state = logic.fastForward(circuit, 10, state)
  expect(state.getOutputs(gates[2])).toEqual([true])
  expect(state.getOutputs(gates[3])).toEqual([false])
})

test('simulates LED', () => {
  const gates = [logic.led()]
  const circuit = logic.circuit(gates)

  const state = logic.fastForward(circuit, 10)
  expect(state.getInputs(gates[0])).toEqual([false])
})

test('simulates buffer', () => {
  const gates = [
    logic.constantGate(false),
    logic.buffer()
  ]

  const circuit = logic.circuit(gates)
  logic.connect(gates[0].outputs[0], gates[1].inputs[0])

  let state = logic.fastForward(circuit, 10)
  expect(state.getOutputs(gates[1])).toEqual([false])

  gates[0].value = true
  state = logic.fastForward(circuit, 10)
  expect(state.getOutputs(gates[1])).toEqual([true])
})

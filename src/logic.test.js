/* eslint-env jest */

import logic from './logic'

test('simulates constant gate', () => {
  const gate = logic.constantGate(true)
  const circuit = logic.circuit([gate])

  let state = logic.nextState(circuit)
  expect(logic.getOutputs(gate, state)).toEqual([false])

  state = logic.nextState(circuit, state)

  expect(logic.getOutputs(gate, state)).toEqual([true])
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
    expect(logic.getOutputs(gates[2], state)).toEqual([a && b])
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
    expect(logic.getOutputs(gates[2], state)).toEqual([a || b])
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
    expect(logic.getOutputs(gates[4], state)).toEqual([(a || b) && c])
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
    expect(logic.getOutputs(gates[4], state)).toEqual([(a && b) || c])
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
    expect(logic.getOutputs(gates[4], state)).toEqual([!(a && b) || c])
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
    expect(logic.getOutputs(gates[4], state)).toEqual([(!a && !b) || c])
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
  expect(logic.getOutputs(gates[2], state)).toEqual([false])
  expect(logic.getOutputs(gates[3], state)).toEqual([true])

  gates[0].value = false

  state = logic.fastForward(circuit, 10, state)
  expect(logic.getOutputs(gates[2], state)).toEqual([false])
  expect(logic.getOutputs(gates[3], state)).toEqual([true])

  gates[1].value = true

  state = logic.fastForward(circuit, 10, state)
  expect(logic.getOutputs(gates[2], state)).toEqual([true])
  expect(logic.getOutputs(gates[3], state)).toEqual([false])

  gates[1].value = false
  state = logic.fastForward(circuit, 10, state)
  expect(logic.getOutputs(gates[2], state)).toEqual([true])
  expect(logic.getOutputs(gates[3], state)).toEqual([false])
})

test('simulates LED', () => {
  const gates = [logic.led()]
  const circuit = logic.circuit(gates)

  const state = logic.fastForward(circuit, 10)
  expect(logic.getInputs(gates[0], state)).toEqual([false])
})

test('simulates buffer', () => {
  const gates = [
    logic.constantGate(false),
    logic.buffer()
  ]

  const circuit = logic.circuit(gates)
  logic.connect(gates[0].outputs[0], gates[1].inputs[0])

  let state = logic.fastForward(circuit, 10)
  expect(logic.getOutputs(gates[1], state)).toEqual([false])

  gates[0].value = true
  state = logic.fastForward(circuit, 10)
  expect(logic.getOutputs(gates[1], state)).toEqual([true])
})

test('simulates switch', () => {
  const gates = [
    logic.switchGate(),
    logic.led()
  ]

  logic.connect(gates[0].outputs[0], gates[1].inputs[0])

  const circuit = logic.circuit(gates)
  let state = logic.fastForward(circuit, 10)
  expect(logic.getOutputs(gates[0], state)).toEqual([false])
  expect(logic.getInputs(gates[1], state)).toEqual([false])

  logic.setUserInput(gates[0], state, true)
  state = logic.fastForward(circuit, 10, state)
  expect(logic.getOutputs(gates[0], state)).toEqual([true])
  expect(logic.getInputs(gates[1], state)).toEqual([true])
})

test('can serialize state', () => {
  const gates = [
    logic.constantGate(false),
    logic.buffer()
  ]

  const circuit = logic.circuit(gates)
  logic.connect(gates[0].outputs[0], gates[1].inputs[0])

  const state = logic.fastForward(circuit, 10)
  expect(state).toHaveProperty('outputs')

  const json = JSON.stringify(state)
  expect(typeof json).toBe('string')
  expect(json.length).toBeGreaterThan(10)
})

test('can serialize circuit', () => {
  const gates = [
    logic.constantGate(false),
    logic.constantGate(true),
    logic.buffer(),
    logic.andGate(),
    logic.orGate(),
    logic.led()
  ]

  const circuit = logic.circuit(gates)
  logic.connect(gates[0].outputs[0], gates[2].inputs[0])

  const json = JSON.stringify(circuit)
  expect(json.length).toBeGreaterThan(10)
})

test('renumbers circuit', () => {
  const gates = [
    logic.constantGate(false),
    logic.constantGate(true),
    logic.buffer(),
    logic.andGate(),
    logic.orGate(),
    logic.led()
  ]

  const circuit = logic.circuit(gates)

  const json = JSON.stringify(circuit)
  const circuit2 = logic.renumber(JSON.parse(json))

  /* Verify that the IDs for the circuits are different. */
  const usedIds = {}
  circuit.gates.forEach((gate) => {
    usedIds[gate.id] = true
    gate.inputs.forEach((pin) => { usedIds[pin.id] = true })
    gate.outputs.forEach((pin) => { usedIds[pin.id] = true })
  })

  circuit2.gates.forEach((gate) => {
    expect(usedIds[gate.id]).toBeUndefined()
    gate.inputs.forEach((pin) => { expect(usedIds[pin.id]).toBeUndefined() })
    gate.outputs.forEach((pin) => { expect(usedIds[pin.id]).toBeUndefined() })
  })

  /* Verify that all pins have valid outputs. */
  const validPins = {}
  circuit2.gates.forEach((gate) => {
    gate.inputs.forEach((pin) => { validPins[pin.id] = true })
    gate.outputs.forEach((pin) => { validPins[pin.id] = true })
  })

  circuit2.gates.forEach((gate) => {
    gate.inputs.forEach((pin) => { expect(validPins[pin.id]).toBeTruthy() })
    gate.outputs.forEach((pin) => { expect(validPins[pin.id]).toBeTruthy() })
  })
})

test('getValidPins returns valid pins', () => {
  const gates = [
    logic.switchGate(),
    logic.andGate(),
    logic.led()
  ]

  expect(logic.getValidPins(gates)).toEqual({
    [gates[0].outputs[0].id]: true,
    [gates[1].inputs[0].id]: true,
    [gates[1].inputs[1].id]: true,
    [gates[1].outputs[0].id]: true,
    [gates[2].inputs[0].id]: true
  })
})

test('removeInvalidConnections removes invalid connections', () => {
  const gates = [
    logic.switchGate(),
    logic.andGate(),
    logic.led()
  ]

  logic.connect(gates[0].outputs[0], gates[1].inputs[0])
  gates[1].inputs[1].connections.push(-1)
  gates[2].inputs[0].connections.push(-2)

  const newGates = logic.removeInvalidConnections(gates)

  expect(newGates[1].inputs[1].connections).toEqual([])
  expect(newGates[2].inputs[0].connections).toEqual([])
  expect(newGates[0].outputs[0].connections).toEqual([newGates[1].inputs[0].id])
  expect(newGates[1].inputs[0].connections).toEqual([newGates[0].outputs[0].id])
})

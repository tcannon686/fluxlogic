/* eslint-env jest */

import {
  Project,
  Page,
  ConstantGate,
  LedGate,
  AndGate,
  OrGate,
  SwitchGate
} from './logicComponents'

test('simulates constant high LED', () => {
  const project = new Project()
  const page = new Page()
  const source = new ConstantGate(0, 0, true)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source)
  source.output.add(led.input)

  expect(source.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from source onto wire
  project.simulate()

  // Signal propagates from wire onto LED
  project.simulate()

  expect(source.output.isHigh()).toBe(true)
  expect(led.isBright()).toBe(true)
})

test('simulates 0 and 0 and-gate connected to LED', () => {
  const project = new Project()
  const page = new Page()
  const source0 = new ConstantGate(0, 0, false)
  const source1 = new ConstantGate(0, 0, false)
  const gate = new AndGate(0, 0)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source0)
  page.add(source1)
  page.add(gate)

  gate.inputs[0].add(source0.output)
  gate.inputs[1].add(source1.output)
  gate.output.add(led.input)

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from sources to wires
  project.simulate()

  // Signal propagates from wires to and gate
  project.simulate()

  // Signal propagates from and gate to wire
  project.simulate()

  // Signal propagates from wire to led
  project.simulate()

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)
})

test('simulates 1 and 0 and-gate connected to LED', () => {
  const project = new Project()
  const page = new Page()
  const source0 = new ConstantGate(0, 0, true)
  const source1 = new ConstantGate(0, 0, false)
  const gate = new AndGate(0, 0)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source0)
  page.add(source1)
  page.add(gate)

  gate.inputs[0].add(source0.output)
  gate.inputs[1].add(source1.output)
  gate.output.add(led.input)

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from sources to wires
  project.simulate()

  // Signal propagates from wires to and gate
  project.simulate()

  // Signal propagates from and gate to wire
  project.simulate()

  // Signal propagates from wire to led
  project.simulate()

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(true)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)
})

test('simulates 0 and 1 and-gate connected to LED', () => {
  const project = new Project()
  const page = new Page()
  const source0 = new ConstantGate(0, 0, false)
  const source1 = new ConstantGate(0, 0, true)
  const gate = new AndGate(0, 0)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source0)
  page.add(source1)
  page.add(gate)

  gate.inputs[0].add(source0.output)
  gate.inputs[1].add(source1.output)
  gate.output.add(led.input)

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from sources to wires
  project.simulate()

  // Signal propagates from wires to and gate
  project.simulate()

  // Signal propagates from and gate to wire
  project.simulate()

  // Signal propagates from wire to led
  project.simulate()

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(true)
  expect(led.isBright()).toBe(false)
})

test('simulates 1 and 1 and-gate connected to LED', () => {
  const project = new Project()
  const page = new Page()
  const source0 = new ConstantGate(0, 0, true)
  const source1 = new ConstantGate(0, 0, true)
  const gate = new AndGate(0, 0)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source0)
  page.add(source1)
  page.add(gate)

  gate.inputs[0].add(source0.output)
  gate.inputs[1].add(source1.output)
  gate.output.add(led.input)

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from sources to wires
  project.simulate()

  // Signal propagates from wires to and gate
  project.simulate()

  // Signal propagates from and gate to wire
  project.simulate()

  // Signal propagates from wire to led
  project.simulate()

  expect(gate.output.isHigh()).toBe(true)
  expect(source0.output.isHigh()).toBe(true)
  expect(source1.output.isHigh()).toBe(true)
  expect(led.isBright()).toBe(true)
})

test('simulates 0 and 0 or-gate connected to LED', () => {
  const project = new Project()
  const page = new Page()
  const source0 = new ConstantGate(0, 0, false)
  const source1 = new ConstantGate(0, 0, false)
  const gate = new OrGate(0, 0)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source0)
  page.add(source1)
  page.add(gate)

  gate.inputs[0].add(source0.output)
  gate.inputs[1].add(source1.output)
  gate.output.add(led.input)

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from sources to wires
  project.simulate()

  // Signal propagates from wires to and gate
  project.simulate()

  // Signal propagates from and gate to wire
  project.simulate()

  // Signal propagates from wire to led
  project.simulate()

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)
})

test('simulates 1 and 0 or-gate connected to LED', () => {
  const project = new Project()
  const page = new Page()
  const source0 = new ConstantGate(0, 0, true)
  const source1 = new ConstantGate(0, 0, false)
  const gate = new OrGate(0, 0)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source0)
  page.add(source1)
  page.add(gate)

  gate.inputs[0].add(source0.output)
  gate.inputs[1].add(source1.output)
  gate.output.add(led.input)

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from sources to wires
  project.simulate()

  // Signal propagates from wires to and gate
  project.simulate()

  // Signal propagates from and gate to wire
  project.simulate()

  // Signal propagates from wire to led
  project.simulate()

  expect(gate.output.isHigh()).toBe(true)
  expect(source0.output.isHigh()).toBe(true)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(true)
})

test('simulates 0 and 1 or-gate connected to LED', () => {
  const project = new Project()
  const page = new Page()
  const source0 = new ConstantGate(0, 0, false)
  const source1 = new ConstantGate(0, 0, true)
  const gate = new OrGate(0, 0)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source0)
  page.add(source1)
  page.add(gate)

  gate.inputs[0].add(source0.output)
  gate.inputs[1].add(source1.output)
  gate.output.add(led.input)

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from sources to wires
  project.simulate()

  // Signal propagates from wires to and gate
  project.simulate()

  // Signal propagates from and gate to wire
  project.simulate()

  // Signal propagates from wire to led
  project.simulate()

  expect(gate.output.isHigh()).toBe(true)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(true)
  expect(led.isBright()).toBe(true)
})

test('simulates 1 and 1 or-gate connected to LED', () => {
  const project = new Project()
  const page = new Page()
  const source0 = new ConstantGate(0, 0, true)
  const source1 = new ConstantGate(0, 0, true)
  const gate = new OrGate(0, 0)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source0)
  page.add(source1)
  page.add(gate)

  gate.inputs[0].add(source0.output)
  gate.inputs[1].add(source1.output)
  gate.output.add(led.input)

  expect(gate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from sources to wires
  project.simulate()

  // Signal propagates from wires to and gate
  project.simulate()

  // Signal propagates from and gate to wire
  project.simulate()

  // Signal propagates from wire to led
  project.simulate()

  expect(gate.output.isHigh()).toBe(true)
  expect(source0.output.isHigh()).toBe(true)
  expect(source1.output.isHigh()).toBe(true)
  expect(led.isBright()).toBe(true)
})

test('simulates ((1 or 0) and 1)', () => {
  const project = new Project()
  const page = new Page()
  const source0 = new ConstantGate(0, 0, true)
  const source1 = new ConstantGate(0, 0, false)
  const source2 = new ConstantGate(0, 0, true)
  const orGate = new OrGate(0, 0)
  const andGate = new AndGate(0, 0)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source0)
  page.add(source1)
  page.add(source2)
  page.add(orGate)
  page.add(andGate)

  orGate.inputs[0].add(source0.output)
  orGate.inputs[1].add(source1.output)

  andGate.inputs[0].add(orGate.output)
  andGate.inputs[1].add(source2.output)

  led.input.add(andGate.output)

  expect(orGate.output.isHigh()).toBe(false)
  expect(andGate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(source2.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from source0, source1, source3, to wires
  project.simulate()

  // Signal propagates from wires to and-gate and or-gate
  project.simulate()

  // Signal propagates from or-gate to wires
  project.simulate()

  // Signal propagates from or-gate to and-gate
  project.simulate()

  // Signal propagates from and-gate to wire
  project.simulate()

  // Signal propagates from wire to LED
  project.simulate()

  expect(orGate.output.isHigh()).toBe(true)
  expect(andGate.output.isHigh()).toBe(true)
  expect(source0.output.isHigh()).toBe(true)
  expect(source1.output.isHigh()).toBe(false)
  expect(source2.output.isHigh()).toBe(true)
  expect(led.isBright()).toBe(true)
})

test('simulates ((0 or 0) and 1)', () => {
  const project = new Project()
  const page = new Page()
  const source0 = new ConstantGate(0, 0, false)
  const source1 = new ConstantGate(0, 0, false)
  const source2 = new ConstantGate(0, 0, true)
  const orGate = new OrGate(0, 0)
  const andGate = new AndGate(0, 0)
  const led = new LedGate(0, 0)

  project.add(page)
  page.add(led)
  page.add(source0)
  page.add(source1)
  page.add(source2)
  page.add(orGate)
  page.add(andGate)

  orGate.inputs[0].add(source0.output)
  orGate.inputs[1].add(source1.output)

  andGate.inputs[0].add(orGate.output)
  andGate.inputs[1].add(source2.output)

  led.input.add(andGate.output)

  expect(orGate.output.isHigh()).toBe(false)
  expect(andGate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(source2.output.isHigh()).toBe(false)
  expect(led.isBright()).toBe(false)

  // Signal propagates from source0, source1, source3, to wires
  project.simulate()

  // Signal propagates from wires to and-gate and or-gate
  project.simulate()

  // Signal propagates from or-gate to wires
  project.simulate()

  // Signal propagates from or-gate to and-gate
  project.simulate()

  // Signal propagates from and-gate to wire
  project.simulate()

  // Signal propagates from wire to LED
  project.simulate()

  expect(orGate.output.isHigh()).toBe(false)
  expect(andGate.output.isHigh()).toBe(false)
  expect(source0.output.isHigh()).toBe(false)
  expect(source1.output.isHigh()).toBe(false)
  expect(source2.output.isHigh()).toBe(true)
  expect(led.isBright()).toBe(false)
})

test('simulates SR-latch', () => {
  const project = new Project()
  const page = new Page()
  const sOr = new OrGate()
  const rOr = new OrGate()
  const sS = new SwitchGate()
  const rS = new SwitchGate()

  project.add(page)
  page.add(sOr)
  page.add(rOr)
  page.add(sS)
  page.add(rS)

  // Turn the gates into nor gates
  sOr.output.setInverted()
  rOr.output.setInverted()

  sOr.inputs[0].add(rOr.output)
  rOr.inputs[0].add(sOr.output)

  // Connect switches to the gates
  sOr.inputs[1].add(sS.output)
  rOr.inputs[1].add(rS.output)

  expect(sS.output.isHigh()).toBe(false)
  expect(rS.output.isHigh()).toBe(false)
  expect(rOr.output.isHigh()).toBe(true)
  expect(sOr.output.isHigh()).toBe(true)

  // Set the latch
  sS.flip()

  // Signal propagates from switch to wire
  project.simulate()

  // Signal propagates from wire to sOr
  project.simulate()

  // Signal propagates from sOr to wire
  project.simulate()

  // Signal propagates from wire to rOr
  project.simulate()

  // Signal propagates from rOr to wire
  project.simulate()

  expect(sS.output.isHigh()).toBe(true)
  expect(rS.output.isHigh()).toBe(false)
  expect(rOr.output.isHigh()).toBe(true)
  expect(sOr.output.isHigh()).toBe(false)

  // Some more simulation steps should not change the output
  for (let i = 0; i < 10; i++) {
    project.simulate()
    expect(sS.output.isHigh()).toBe(true)
    expect(rS.output.isHigh()).toBe(false)
    expect(rOr.output.isHigh()).toBe(true)
    expect(sOr.output.isHigh()).toBe(false)
  }

  // The output should stay the same even after the switch is flipped
  sS.flip()

  for (let i = 0; i < 10; i++) {
    project.simulate()
    expect(sS.output.isHigh()).toBe(false)
    expect(rS.output.isHigh()).toBe(false)
    expect(rOr.output.isHigh()).toBe(true)
    expect(sOr.output.isHigh()).toBe(false)
  }

  // Try flipping the other switch to reset the latch
  rS.flip()

  // Let the signal propagate
  project.simulate()
  project.simulate()
  project.simulate()
  project.simulate()
  project.simulate()

  // Other signal should be set
  expect(sS.output.isHigh()).toBe(false)
  expect(rS.output.isHigh()).toBe(true)
  expect(rOr.output.isHigh()).toBe(false)
  expect(sOr.output.isHigh()).toBe(true)

  // The output should stay the same even after the switch is flipped
  rS.flip()

  for (let i = 0; i < 10; i++) {
    project.simulate()
    expect(sS.output.isHigh()).toBe(false)
    expect(rS.output.isHigh()).toBe(false)
    expect(rOr.output.isHigh()).toBe(false)
    expect(sOr.output.isHigh()).toBe(true)
  }
})

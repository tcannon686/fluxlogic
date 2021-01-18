import packageJson from '../package.json'

/*
 * An object mapping gate types to functions.
 */
const nextOutputFunctions = {
  and: (gate, state) => [getInputs(gate, state).every((x) => x)],
  or: (gate, state) => [getInputs(gate, state).some((x) => x)],
  xor: (gate, state) => [
    getInputs(gate, state).filter((x) => x).length % 2 !== 0
  ],
  constant: (gate, state) => [gate.value],
  led: () => [],
  text: () => [],
  buffer: (gate, state) => getInputs(gate, state),
  switch: (gate, state) => [Boolean(getUserInput(gate, state))],
  sender: () => [],
  receiver: (gate, state, circuit) => getInputs(
    findSender(gate, circuit),
    state
  ),
  mux: (gate, state) => {
    const inputs = getInputs(gate, state)
    const index = inputs
      .slice(0, gate.n)
      .reduce((t, c, i) => t + Number(c) * (1 << i), 0)
    return [inputs[gate.n + index]]
  },
  demux: (gate, state) => {
    const inputs = getInputs(gate, state)
    const index = inputs
      .slice(0, gate.n)
      .reduce((t, c, i) => t + Number(c) * (1 << i), 0)
    const outputs = new Array(1 << gate.n)
    outputs.fill(false)
    outputs[index] = inputs[gate.n]
    return outputs
  },
  sevenSegment: () => [],
  srLatch: (gate, state) => {
    const inputs = getInputs(gate, state)
    const outputs = getOutputs(gate, state)

    const s = inputs[2]
    const e = inputs[1]
    const r = inputs[0]

    const q = outputs[1]

    if (e && s && !r) {
      return [false, true]
    } else if (e && !s && r) {
      return [true, false]
    } else {
      return [!q, q]
    }
  },
  dLatch: (gate, state) => {
    const inputs = getInputs(gate, state)
    const outputs = getOutputs(gate, state)

    const d = inputs[1]
    const e = inputs[0]

    const q = outputs[1]
    if (e) {
      return [!d, d]
    } else {
      return [!q, q]
    }
  },
  dFlipFlop: (gate, state) => {
    const inputs = getInputs(gate, state)
    const outputs = getOutputs(gate, state)

    const cPrev = state.prevState && getInputs(gate, state.prevState)[0]
    const c = inputs[0]
    const d = inputs[1]

    const q = outputs[1]

    const isRisingEdge = cPrev !== c && c === true

    if (isRisingEdge) {
      return [!d, d]
    } else {
      return [!q, q]
    }
  },
  srDFlipFlop: (gate, state) => {
    const inputs = getInputs(gate, state)
    const outputs = getOutputs(gate, state)

    const r = inputs[0]
    const cPrev = state.prevState && getInputs(gate, state.prevState)[1]
    const c = inputs[1]
    const d = inputs[2]
    const s = inputs[3]

    const q = outputs[1]

    const isRisingEdge = cPrev !== c && c === true

    /*
     * Truth table taken from:
     * https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     */
    if (s && !r) {
      return [false, true]
    } else if (!s && r) {
      return [true, false]
    } else if (s && r) {
      return [true, true]
    } else if (isRisingEdge) {
      return [!d, d]
    } else {
      return [!q, q]
    }
  }
}

/** Connect to logic pins by a wire. */
function connect (a, b) {
  a.connections.push(b.id)
  b.connections.push(a.id)
}

/**
 * Creates a circuit with the given gates.
 */
function circuit (gates) {
  return {
    gates
  }
}

/**
 * Creates a logic pin. A pin may be inverted by setting its isInverted field.
 */
function pin () {
  return {
    id: nextId(),
    connections: []
  }
}

/** Creates an and gate. */
function andGate () {
  return {
    id: nextId(),
    type: 'and',
    inputs: [pin(), pin()],
    outputs: Object.seal([pin()])
  }
}

/** Creates an or gate. */
function orGate () {
  return {
    id: nextId(),
    type: 'or',
    inputs: [pin(), pin()],
    outputs: Object.seal([pin()])
  }
}

/** Creates an xor gate. */
function xorGate () {
  return {
    id: nextId(),
    type: 'xor',
    inputs: [pin(), pin()],
    outputs: Object.seal([pin()])
  }
}

/** Creates a constant gate (for simulating ground or 1). */
function constantGate (value) {
  return {
    id: nextId(),
    type: 'constant',
    inputs: Object.seal([]),
    outputs: Object.seal([pin()]),
    value: value || false
  }
}

/** Creates a switch gate that the user can interact with. */
function switchGate () {
  return {
    id: nextId(),
    type: 'switch',
    inputs: Object.seal([]),
    outputs: Object.seal([pin()])
  }
}

/** Creates an LED. */
function led () {
  return {
    id: nextId(),
    type: 'led',
    inputs: Object.seal([pin()]),
    outputs: Object.seal([])
  }
}

/** Creates a buffer (a gate that simply passes its input to its output). */
function buffer () {
  return {
    id: nextId(),
    type: 'buffer',
    inputs: Object.seal([pin()]),
    outputs: Object.seal([pin()])
  }
}

/**
 * Creates a sender with the given label. A receiver with the same label will
 * receive the inputs of the sender.
 */
function sender (label) {
  return {
    id: nextId(),
    type: 'sender',
    label: label || 'A',
    inputs: Object.seal([pin()]),
    outputs: Object.seal([])
  }
}

/**
 * Creates a receiver with the given label. The receiver will have the same
 * input values as the sender with the given label.
 */
function receiver (label) {
  return {
    id: nextId(),
    type: 'receiver',
    label: label || 'A',
    inputs: Object.seal([]),
    outputs: Object.seal([pin()])
  }
}

/**
 * Creates a multiplexor with the given number of select lines. The first n
 * items in gate.inputs are the select lines (least significant bit first), the
 * next n^2 are the data lines. The number of select lines, n, is stored in the
 * n field of the returned object.
 */
function mux (n) {
  const inputs = []
  for (let i = 0; i < n; i++) {
    inputs.push(pin())
  }
  for (let i = 0; i < (1 << n); i++) {
    inputs.push(pin())
  }
  return {
    id: nextId(),
    type: 'mux',
    n,
    inputs: Object.seal(inputs),
    outputs: Object.seal([pin()])
  }
}

/**
 * Creates a demultiplexor with the given number of select lines. The first n
 * items in gates.inputs are the selectl ines (least significant bit first),
 * followed by the data line. The number of select lines, n, is stored in the n
 * field of the returned object. The returned gate has 2^n outputs.
 */
function demux (n) {
  const inputs = [pin()]
  const outputs = []
  for (let i = 0; i < n; i++) {
    inputs.push(pin())
  }
  for (let i = 0; i < (1 << n); i++) {
    outputs.push(pin())
  }
  return {
    id: nextId(),
    type: 'demux',
    n,
    inputs: Object.seal(inputs),
    outputs: Object.seal(outputs)
  }
}

function sevenSegment (n) {
  return {
    id: nextId(),
    type: 'sevenSegment',
    inputs: Object.seal([
      pin(),
      pin(),
      pin(),
      pin()
    ]),
    outputs: Object.seal([])
  }
}

/**
 * Creates a gated SR-latch component, where inputs[0] is R, inputs[1] is E,
 * inputs[2] is S, outputs[0] is !Q, outputs[1] is Q.
 */
function srLatch () {
  return {
    id: nextId(),
    type: 'srLatch',
    inputs: Object.seal([
      pin(),
      pin(),
      pin()
    ]),
    outputs: Object.seal([
      pin(),
      pin()
    ])
  }
}

/**
 * Creates a D-latch, where inputs[0] is E, inputs[1] is D, outputs[0] is !Q,
 * outputs[1] is Q.
 */
function dLatch () {
  return {
    id: nextId(),
    type: 'dLatch',
    inputs: Object.seal([
      pin(),
      pin()
    ]),
    outputs: Object.seal([
      pin(),
      pin()
    ])
  }
}

/**
 * Creates a D-flip-flop, where inputs[0] is C, inputs[1] is D.
 */
function dFlipFlop () {
  return {
    id: nextId(),
    type: 'dFlipFlop',
    inputs: Object.seal([
      pin(),
      pin()
    ]),
    outputs: Object.seal([
      pin(),
      pin()
    ])
  }
}

/**
 * Creates a D-flip-flop with S and R pins, where inputs[0] is R, inputs[1] is
 * C, inputs[2] is D, inputs[3] is S.
 */
function srDFlipFlop () {
  return {
    id: nextId(),
    type: 'srDFlipFlop',
    inputs: Object.seal([
      pin(),
      pin(),
      pin(),
      pin()
    ]),
    outputs: Object.seal([
      pin(),
      pin()
    ])
  }
}

/**
 * Creates a text component, which displays text on the screen. It has a
 * text field, which contains the text to be displayed.
 */
function text (string) {
  return {
    id: nextId(),
    type: 'text',
    inputs: Object.seal([]),
    outputs: Object.seal([]),
    text: string,
    width: 2,
    height: 0.5
  }
}

/**
 * Computes a state object to represent the current state of the simulation for
 * the given circuit. If prevState is passed, returns the next state after the
 * given state.
 *
 * The state object is an object containing an outputs field, which is an object
 * that maps each pin ID to a boolean value. For example, if a pin with ID 2 has
 * an output of true, the state object would look something like this:
 * { outputs: { 2: true } }
 *
 * To calculate the inputs and outputs of individual gates, the getInputs and
 * getOutputs helper functions can be used.
 *
 * The input from the user (for example, whether a switch is switched or not) is
 * stored in the inputs field, that maps a gate ID to a user input object. The
 * format of the input depends on the gate itself.
 *
 * The state also keeps track of its state in the previous simulation frame,
 * stored in the prevState field of the state. This is only used in the flip
 * flop components to keep track of edge triggered events.
 */
function nextState (circuit, prevState) {
  const state = {
    outputs: {},
    inputs: {}
  }

  /* Copy the previous state if it's provided. */
  if (prevState) {
    state.prevState = { ...prevState }
    delete state.prevState.prevState
  }

  if (prevState) {
    for (const gate of circuit.gates) {
      /* Calculate the next output. */
      const nextOutputs = nextOutputFunctions[gate.type](
        gate,
        prevState,
        circuit
      )

      for (let i = 0; i < nextOutputs.length; i++) {
        state.outputs[gate.outputs[i].id] = (
          nextOutputs[i] ^ gate.outputs[i].isInverted) === 1
      }
    }

    Object.assign(state.inputs, prevState.inputs)
  } else {
    /* Initialize all outputs to false. */
    for (const gate of circuit.gates) {
      for (const pin of gate.outputs) {
        state.outputs[pin.id] = false
      }
    }
  }

  return state
}

/**
 * Returns the sender gate for the given receiver gate.
 */
function findSender (receiver, circuit) {
  return circuit.gates.find(
    (gate) => gate.type === 'sender' && gate.label === receiver.label
  )
}

/**
 * Returns a list of input booleans for the gate given the current simulation
 * state.
 */
function getInputs (gate, state) {
  return gate.inputs
    .map((pin) => (state.outputs[pin.connections[0]] ^ pin.isInverted) === 1)
}

/**
 * Returns a list of output booleans for the gate given the current simulation
 * state.
 */
function getOutputs (gate, state) {
  return gate.outputs.map((pin) => state.outputs[pin.id])
}

/**
 * Returns the user input for the gate given the current simulation state.
 */
function getUserInput (gate, state) {
  return state.inputs[gate.id]
}

/**
 * Sets the user input for the gate for the current simulation state.
 */
function setUserInput (gate, state, value) {
  state.inputs[gate.id] = value
}

/**
 * Skip forward n simulation states given a circuit, n, and the (optional)
 * current state. This function simply calls nextState(circuit, state) n times.
 */
function fastForward (circuit, n, state) {
  for (let i = 0; i < n; i++) {
    state = nextState(circuit, state)
  }
  return state
}

/*
 * Function to return a unique id. This should only be used within this JS file.
 * The ID wraps around to 0 once Number.MAX_SAFE_INTEGER is reached. This is
 * assumed to be okay since Number.MAX_SAFE_INTEGER is so large.
 */
let currentId = 0
function nextId () {
  if (currentId >= Number.MAX_SAFE_INTEGER) {
    currentId = 0
  }

  return currentId++
}

/*
 * This function renumbers the IDs of the given circuit so that there are no
 * collisions. This should be called any time a circuit is loaded to avoid
 * collisions. It returns the circuit.
 */
function renumber (circuit) {
  const clone = { ...circuit }
  let maxId = currentId

  const calcNewId = (id) => currentId < (Number.MAX_SAFE_INTEGER - id)
    ? id + currentId
    : (id - Number.MAX_SAFE_INTEGER) + currentId

  const updateId = (object) => {
    const clone = {
      ...object,
      id: calcNewId(object.id)
    }
    if (clone.id > maxId) {
      maxId = clone.id
    }

    if (clone.connections) {
      clone.connections = clone.connections.map(calcNewId)
    }
    return clone
  }

  clone.gates = clone.gates.map((gate) => {
    const r = updateId(gate)
    r.inputs = r.inputs.map(updateId)
    r.outputs = r.outputs.map(updateId)
    return r
  })

  currentId = maxId + 1

  return clone
}

/**
 * Create an object containing the IDs of all valid pins for the given gates.
 */
const getValidPins = (gates) => (
  Object.fromEntries(gates.reduce(
    (t, gate) => t.concat(
      gate.inputs.map((pin) => pin.id),
      gate.outputs.map((pin) => pin.id)),
    []
  ).map((id) => [id, true]))
)

/**
 * Returns a new list of gates from the given list of gates with the
 * connections to invalid pins removed.
 */
const removeInvalidConnections = (gates) => {
  const validPins = getValidPins(gates)

  /* Remove all connections that point to a deleted pin. */
  return gates.map((gate) => {
    const gateClone = { ...gate }
    const updatePin = (pin) => {
      return {
        ...pin,
        connections: pin.connections.filter((id) => validPins[id])
      }
    }

    gateClone.inputs = gateClone.inputs.map(updatePin)
    gateClone.outputs = gateClone.outputs.map(updatePin)
    return gateClone
  })
}

/**
 * Returns a list of all the labels that are used by 2 or more senders in the
 * given list of gates, sorted alphabetically. This is useful as an error check
 * to make sure there are no duplicate senders.
 */
const getDuplicateSenderLabels = (gates) => {
  const senderCounts = {}

  gates.forEach((gate) => {
    if (gate.type === 'sender') {
      senderCounts[gate.label] = (senderCounts[gate.label] || 0) + 1
    }
  })

  return Object.entries(senderCounts)
    .filter((x) => x[1] > 1)
    .map((x) => x[0])
    .sort()
}

/**
 * Stores the project in a string. The project can be loaded using the
 * loadProject function.
 */
const dumpProject = (circuit, currentPage) => {
  return JSON.stringify({
    version: packageJson.version,
    circuit,
    currentPage
  })
}

/**
 * Loads the project from a string. Returns an object with the circuit in the
 * circuit field, the current page in the currentPage field, and the Flux Logic
 * version in the version field.
 */
const loadProject = (data) => {
  return JSON.parse(data)
}

export {
  /* Simulation. */
  nextState,
  getOutputs,
  getInputs,
  getUserInput,
  setUserInput,
  fastForward,

  /* Circuit creation. */
  renumber,
  connect,
  circuit,
  andGate,
  orGate,
  xorGate,
  constantGate,
  switchGate,
  sender,
  receiver,
  led,
  buffer,
  pin,
  mux,
  demux,
  sevenSegment,
  srLatch,
  dLatch,
  srDFlipFlop,
  dFlipFlop,
  text,

  /* Utils. */
  removeInvalidConnections,
  getValidPins,
  findSender,
  getDuplicateSenderLabels,

  /* Saving and loading. */
  loadProject,
  dumpProject
}

/*
 * An object mapping gate types to functions.
 */
const nextOutputFunctions = {
  and: (gate, state) => [getInputs(gate, state).every((x) => x)],
  or: (gate, state) => [getInputs(gate, state).some((x) => x)],
  constant: (gate, state) => [gate.value],
  led: (gate, state) => [],
  buffer: (gate, state) => getInputs(gate, state),
  switch: (gate, state) => [Boolean(getUserInput(gate, state))]
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
 */
function nextState (circuit, prevState) {
  const state = { outputs: {}, inputs: {} }

  if (prevState) {
    for (const gate of circuit.gates) {
      /* Calculate the next output. */
      const nextOutputs = nextOutputFunctions[gate.type](gate, prevState)

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
 */
let currentId = 0
function nextId () {
  return currentId++
}

/*
 * This function renumbers the IDs of the given circuit so that there are no
 * collisions. This should be called any time a circuit is loaded to avoid
 * collisions. It returns the circuit.
 */
function renumber (circuit) {
  let maxId = currentId

  const updateId = (object) => {
    object.id += currentId
    if (object.id > maxId) {
      maxId = object.id
    }

    if (object.connections) {
      object.connections = object.connections.map((id) => id + currentId)
    }
  }

  circuit.gates.forEach((gate) => {
    updateId(gate)
    gate.inputs.forEach(updateId)
    gate.outputs.forEach(updateId)
  })

  currentId = maxId + 1

  return circuit
}

export default {
  connect,
  nextState,
  getOutputs,
  getInputs,
  getUserInput,
  setUserInput,
  fastForward,
  renumber,
  circuit,
  andGate,
  orGate,
  constantGate,
  switchGate,
  led,
  buffer
}

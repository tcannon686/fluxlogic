
/** Connect to logic pins by a wire. */
function connect (a, b) {
  a.connections.push(b.id)
  b.connections.push(a.id)
}

/**
 * Creates a circuit with the given gates. */
function circuit (gates) {
  return {
    gates,

    /**
     * An object mapping gate types to functions. This way, the types of gates
     * can be extended by adding a gate type here.
     */
    nextOutputFunctions: {
      and: (gate, inputs) => [inputs.every((x) => x)],
      or: (gate, inputs) => [inputs.some((x) => x)],
      constant: (gate, inputs) => [gate.value],
      led: (gate, inputs) => [],
      buffer: (gate, inputs) => inputs
    },

    /**
     * Evaluates the next set of outputs for the given gate, given a list of
     * inputs. The advantage of using this function over having a function in
     * each gate object is that we can use a "type" field to specify the gate.
     * This makes it easier to use JSON.stringify() on the data, and makes it
     * easier to put together a UI.
     */
    nextOutputs (gate, inputs) {
      if (this.nextOutputFunctions[gate.type]) {
        return this.nextOutputFunctions[gate.type](gate, inputs)
      } else {
        throw new Error(`Unknown gate type '${gate.type}'`)
      }
    }
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
 * given state. The state object contains the following methods:
 *  - getInputs(gate)
 *  - getOutputs(gate)
 *
 * getInputs(gate) returns a list of booleans representing the inputs to the
 * given gate. getOutputs(gate) returns a list of booleans representing the
 * outputs from the given gate.
 */
function nextState (circuit, prevState) {
  const outputs = {}

  if (prevState) {
    for (const gate of circuit.gates) {
      /* Find the inputs to the gate. */
      const inputs = prevState.getInputs(gate)
      const nextOutputs = circuit.nextOutputs(gate, inputs)

      for (let i = 0; i < nextOutputs.length; i++) {
        outputs[gate.outputs[i].id] = (
          nextOutputs[i] ^ gate.outputs[i].isInverted) === 1
      }
    }
  } else {
    /* Initialize all outputs to false. */
    for (const gate of circuit.gates) {
      for (const pin of gate.outputs) {
        outputs[pin.id] = false
      }
    }
  }

  const ret = {
    circuit,

    /** Returns a list of input booleans for the gate. */
    getInputs (gate) {
      return gate.inputs
        .map((pin) => (outputs[pin.connections[0]] ^ pin.isInverted) === 1)
    },

    /** Returns a list of output booleans for the gate. */
    getOutputs (gate) {
      return gate.outputs.map((pin) => outputs[pin.id])
    }

  }

  return ret
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

export default {
  connect,
  nextState,
  fastForward,
  circuit,
  andGate,
  orGate,
  constantGate,
  led,
  buffer
}

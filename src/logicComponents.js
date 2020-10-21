
/** A project that contains individual pages */
class Project {
  constructor () {
    /** A list of pages in the project. */
    this.__pages = []
  }

  /** Perform one step in the logic simulation */
  simulate () {
    for (const page of this.__pages) {
      page.simulate()
    }
  }

  add (page) {
    this.__pages.push(page)
  }
}

/** A page that contains gates */
class Page {
  constructor () {
    /** A list of gates on the page. */
    this.__gates = []
  }

  /** Add the given gate to the page. */
  add (gate) {
    this.__gates.push(gate)
  }

  remove (gate) {
    const index = this.__gates.indexOf(gate)
    if (index < 0) {
      console.warning('Tried to remove gate not in page.')
    } else {
      this.__gates.splice(index, 1)
    }
  }

  simulate () {
    for (const component of this.__gates) {
      component.simulate()
    }
  }
}

/** A pin that can be connected to logic gates */
class LogicPin {
  /** Create this logic pin connected to the given logic gate */
  constructor (isInverted) {
    this.__connections = []
    this.__isHigh = false
    this.__isInverted = isInverted || false
  }

  /** Connect the pin to another pin */
  add (pin) {
    // Undirected graph
    this.__connections.push(pin)
    pin.__connections.push(this)
  }

  /** Disconnect this pin from the given pin */
  remove (pin) {
    const index = this.__connections.indexOf(pin)
    if (index >= 0) {
      this.__connections.splice(index, 1)
    }
  }

  /**
   * Returns true if the output of this pin is inverted. If this is true,
   * isHigh() returns true if setLow() is called, and false if setHigh() is
   * called.
   */
  isInverted () {
    return this.__isInverted
  }

  /**
   * Set whether the pin is inverted or not
   */
  setIsInverted (isInverted) {
    this.__isInverted = isInverted
  }

  /**
   * Set the pin to be inverted
   */
  setInverted () {
    this.__isInverted = true
  }

  /** Returns a list of LogicPins this LogicPin is connected to */
  getConnections () {
    return this.__connections
  }

  /** Set the pin and its connections to high */
  setHigh () {
    this.__isHigh = true
    this.__connections.forEach((connection) => {
      connection.__isHigh = this.isHigh()
    })
  }

  /** Set the pin and its connections to low */
  setLow () {
    this.__isHigh = false
    this.__connections.forEach((connection) => {
      connection.__isHigh = this.isHigh()
    })
  }

  /** Return true if the pin is outputting high */
  isHigh () {
    return this.__isInverted ? !this.__isHigh : this.__isHigh
  }
}

/** A generic logic gate */
class LogicGate {
  constructor (x, y, size) {
    this.x = x
    this.y = y

    // Default size 64
    this.size = size || 64
  }
}

/** A gate for performing logical or */
class OrGate extends LogicGate {
  constructor (x, y, size) {
    super(x, y, size)
    // Create pins
    this.output = new LogicPin()
    this.inputs = [
      new LogicPin(),
      new LogicPin()
    ]
  }

  simulate () {
    if (this.inputs.some((input) => input.isHigh())) {
      this.output.setHigh()
    } else {
      this.output.setLow()
    }
  }
}

/** A gate for performing logical and */
class AndGate extends LogicGate {
  constructor (x, y, size) {
    super(x, y, size)
    // Create pins
    this.output = new LogicPin()
    this.inputs = [
      new LogicPin(),
      new LogicPin()
    ]
  }

  simulate () {
    // Set the output to high if all inputs are high, otherwise set low
    if (this.inputs.every((input) => input.isHigh())) {
      this.output.setHigh()
    } else {
      this.output.setLow()
    }
  }
}

class ConstantGate extends LogicGate {
  /**
   * Create a ConstantGate with the given value
   */
  constructor (x, y, value, size) {
    super(x, y, size)
    // Create pins
    this.output = new LogicPin()
    this.value = value || false
  }

  simulate () {
    if (this.value) {
      this.output.setHigh()
    } else {
      this.output.setLow()
    }
  }
}

class BufferGate extends LogicGate {
  constructor (x, y, size) {
    super(x, y, size)
    this.output = new LogicPin()
    this.input = new LogicPin()
  }

  simulate () {
    if (this.input.isHigh()) {
      this.output.setHigh()
    } else {
      this.output.setLow()
    }
  }
}

class LedGate extends LogicGate {
  constructor (x, y, size) {
    super(x, y, size)
    this.__isBright = false
    this.input = new LogicPin()
  }

  simulate () {
    if (this.input.isHigh()) {
      this.__isBright = true
    }
  }

  isBright () {
    return this.__isBright
  }
}

class SwitchGate extends LogicGate {
  constructor (x, y, size) {
    super(x, y, size)
    this.__isOn = false
    this.output = new LogicPin()
  }

  simulate () {
    if (this.__isOn) {
      this.output.setHigh()
    } else {
      this.output.setLow()
    }
  }

  isOn () {
    return this.__isOn
  }

  flip () {
    this.__isOn = !this.__isOn
  }

  setOn () {
    this.__isOn = true
  }

  setOff () {
    this.__isOn = false
  }
}

export {
  Project,
  Page,
  LogicPin,
  LogicGate,
  AndGate,
  OrGate,
  LedGate,
  ConstantGate,
  BufferGate,
  SwitchGate
}

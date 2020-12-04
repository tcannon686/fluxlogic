/*
 * Themes are responsible for determining the images to use for each logic gate,
 * as well as the position of the pins.
 */

/* SVGs */
import AndGateSvg from './assets/and-gate.svg'
import OrGateSvg from './assets/or-gate.svg'
import OpenPinSvg from './assets/open-pin.svg'
import OpenPinInvertedSvg from './assets/open-pin-inverted.svg'
import PinSvg from './assets/pin.svg'
import PinInvertedSvg from './assets/pin-inverted.svg'
import BufferGateSvg from './assets/buffer-gate.svg'
import OneGateSvg from './assets/one-gate.svg'
import ZeroGateSvg from './assets/zero-gate.svg'

const defaultThemeSvgs = {
  and: AndGateSvg,
  or: OrGateSvg,
  buffer: BufferGateSvg
}

const defaultTheme = {
  /* Returns an SVG for the given pin. */
  getPinSvg: (pin) => (
    pin.connections.length === 0
      ? (pin.isInverted
        ? OpenPinInvertedSvg
        : OpenPinSvg)
      : (pin.isInverted
        ? PinInvertedSvg
        : PinSvg)),

  /* Returns an SVG for the given gate. */
  getGateSvg (gate) {
    if (defaultThemeSvgs[gate.type]) {
      return defaultThemeSvgs[gate.type]
    } else if (gate.type === 'constant') {
      return gate.value ? OneGateSvg : ZeroGateSvg
    }
  },

  /* Returns an object mapping a pin ID to a pin position. */
  getPinPositions (gate, x, y) {
    /* Maps a pin ID to a position */
    const ret = {}

    gate.inputs.forEach((pin, index) => {
      ret[pin.id] = {
        x: x,
        y: y + 0.25 + (index - (gate.inputs.length - 1) / 2) * 0.2
      }
    })

    gate.outputs.forEach((pin, index) => {
      ret[pin.id] = {
        x: x + 0.5,
        y: y + 0.25
      }
    })

    return ret
  },

  getWidth (gate) {
    return 0.5
  },

  getHeight (gate) {
    return 0.5
  }
}

export {
  defaultTheme
}

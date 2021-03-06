/*
 * Themes are responsible for determining the images to use for each logic gate,
 * as well as the position of the pins.
 */

import React, { useState, useEffect } from 'react'

import { BehaviorSubject } from 'rxjs'
import { map } from 'rxjs/operators'
import { useSubscription } from './hooks'

/* SVGs */
import AndGateSvg from './assets/and-gate.svg'
import OrGateSvg from './assets/or-gate.svg'
import XorGateSvg from './assets/xor-gate.svg'
import OpenPinSvg from './assets/open-pin.svg'
import OpenPinInvertedSvg from './assets/open-pin-inverted.svg'
import PinSvg from './assets/pin.svg'
import PinInvertedSvg from './assets/pin-inverted.svg'
import BufferGateSvg from './assets/buffer-gate.svg'
import OneGateSvg from './assets/one-gate.svg'
import ZeroGateSvg from './assets/zero-gate.svg'
import LedSvg from './assets/led.svg'
import LedGlowSvg from './assets/led-glow.svg'
import SwitchOffSvg from './assets/switch-off.svg'
import SwitchOnSvg from './assets/switch-on.svg'
import SenderSvg from './assets/sender.svg'
import ReceiverSvg from './assets/receiver.svg'
import MuxSvg from './assets/mux.svg'
import DemuxSvg from './assets/demux.svg'
import SrLatchSvg from './assets/sr-latch.svg'
import DLatchSvg from './assets/d-latch.svg'
import DFlipFlopSvg from './assets/d-flip-flop.svg'
import SrDFlipFlopSvg from './assets/sr-d-flip-flop.svg'

import SevenSegmentSvg from './assets/seven-segment.svg'
import SevenSegment0Svg from './assets/seven-segment-0.svg'
import SevenSegment1Svg from './assets/seven-segment-1.svg'
import SevenSegment2Svg from './assets/seven-segment-2.svg'
import SevenSegment3Svg from './assets/seven-segment-3.svg'
import SevenSegment4Svg from './assets/seven-segment-4.svg'
import SevenSegment5Svg from './assets/seven-segment-5.svg'
import SevenSegment6Svg from './assets/seven-segment-6.svg'
import SevenSegment7Svg from './assets/seven-segment-7.svg'
import SevenSegment8Svg from './assets/seven-segment-8.svg'
import SevenSegment9Svg from './assets/seven-segment-9.svg'
import SevenSegment10Svg from './assets/seven-segment-10.svg'
import SevenSegment11Svg from './assets/seven-segment-11.svg'
import SevenSegment12Svg from './assets/seven-segment-12.svg'
import SevenSegment13Svg from './assets/seven-segment-13.svg'
import SevenSegment14Svg from './assets/seven-segment-14.svg'
import SevenSegment15Svg from './assets/seven-segment-15.svg'

import { LogicGate, Text } from './LogicGate'

const sevenSegmentSvgs = [
  SevenSegment0Svg,
  SevenSegment1Svg,
  SevenSegment2Svg,
  SevenSegment3Svg,
  SevenSegment4Svg,
  SevenSegment5Svg,
  SevenSegment6Svg,
  SevenSegment7Svg,
  SevenSegment8Svg,
  SevenSegment9Svg,
  SevenSegment10Svg,
  SevenSegment11Svg,
  SevenSegment12Svg,
  SevenSegment13Svg,
  SevenSegment14Svg,
  SevenSegment15Svg
]

function Switch (props) {
  const [isOn, setIsOn] = useState(false)
  const { gate, simulation } = props
  const subject = new BehaviorSubject(isOn)

  useEffect(() => {
    if (simulation) {
      simulation.setUserInput(gate, subject)
      const subscription = subject.subscribe(x => {
        setIsOn(x)
      })
      return () => subscription.unsubscribe()
    } else {
      setIsOn(false)
    }
  }, [subject, simulation, gate])

  return (
    <LogicGate
      svg={isOn ? SwitchOnSvg : SwitchOffSvg}
      {...props}
      onGateClick={() => {
        if (simulation) {
          subject.next(!isOn)
        }
      }}
    />
  )
}

function Led (props) {
  const { gate, simulation } = props
  const isGlowing = useSubscription((
    simulation && simulation.getInputs(gate).pipe(map(x => x[0]))
  ))

  return (
    <LogicGate
      svg={(isGlowing && simulation) ? LedGlowSvg : LedSvg}
      {...props}
    />
  )
}

function SevenSegment (props) {
  const { gate, simulation } = props
  const toNumber = x => (
    x.reduce((a, c, i) => a + Number(c) * (1 << i))
  )
  const value = useSubscription(
    simulation && simulation.getInputs(gate).pipe(map(toNumber))
  )
  return (
    <LogicGate
      svg={
        simulation
          ? sevenSegmentSvgs[value]
          : SevenSegmentSvg
      }
      {...props}
    />
  )
}

const defaultThemeComponents = {
  and: (props) => <LogicGate {...props} svg={AndGateSvg} />,
  or: (props) => <LogicGate svg={OrGateSvg} {...props} />,
  xor: (props) => <LogicGate svg={XorGateSvg} {...props} />,
  buffer: (props) => <LogicGate svg={BufferGateSvg} {...props} />,
  led: (props) => <Led {...props} />,
  constant: (props) => (
    <LogicGate
      svg={props.gate.value ? OneGateSvg : ZeroGateSvg}
      {...props}
    />
  ),
  switch: (props) => <Switch {...props} />,
  sender: (props) => <LogicGate svg={SenderSvg} {...props} />,
  receiver: (props) => <LogicGate svg={ReceiverSvg} {...props} />,
  mux: (props) => <LogicGate svg={MuxSvg} {...props} />,
  demux: (props) => <LogicGate svg={DemuxSvg} {...props} />,
  sevenSegment: (props) => <SevenSegment {...props} />,
  srLatch: (props) => <LogicGate svg={SrLatchSvg} {...props} />,
  dLatch: (props) => <LogicGate svg={DLatchSvg} {...props} />,
  dFlipFlop: (props) => <LogicGate svg={DFlipFlopSvg} {...props} />,
  srDFlipFlop: (props) => <LogicGate svg={SrDFlipFlopSvg} {...props} />,
  text: (props) => <Text {...props} />
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

  getGateComponent (gate) {
    return defaultThemeComponents[gate.type]
  },

  /*
   * Returns an object mapping a pin ID to a pin position. Each key maps a pin
   * ID to an object with an x and y field. The object may also have a x1 and y1
   * field, which represents where the wire connecting the pin to the gate
   * should go.
   */
  getPinPositions (gate, x, y, state) {
    const distribute = (index, length) => (index - (length - 1) / 2) /
        Math.max(length - 1, 1)

    /* Maps a pin ID to a position */
    if (gate.type === 'mux' || gate.type === 'demux') {
      const ret = {}
      gate.inputs.forEach((pin, index) => {
        if (index < gate.n) {
          const pinX = x + 0.25 - distribute(index, gate.n) * 0.075
          ret[pin.id] = {
            x: pinX,
            y: y + 0.5,
            x1: pinX,
            y1: y + 0.25
          }
        } else {
          ret[pin.id] = {
            x: x,
            y: y + 0.25 - distribute(
              index - gate.n,
              gate.inputs.length - gate.n) * 0.225
          }
        }
      })

      gate.outputs.forEach((pin, index) => {
        ret[pin.id] = {
          x: x + 0.5,
          y: y + 0.25 - distribute(index, gate.outputs.length) * 0.225
        }
      })
      return ret
    } else if (gate.type === 'srDFlipFlop') {
      const ret = {}
      const r = gate.inputs[0]
      const c = gate.inputs[1]
      const d = gate.inputs[2]
      const s = gate.inputs[3]

      const f = (pin, index) => {
        ret[pin.id] = {
          x: x,
          y: y + 0.25 - distribute(index, 2) * 0.225
        }
      }

      f(c, 0)
      f(d, 1)

      ret[s.id] = {
        x: x + 0.25,
        y: y - 0.05,
        x1: x + 0.25,
        y1: y
      }

      ret[r.id] = {
        x: x + 0.25,
        y: y + 0.55,
        x1: x + 0.25,
        y1: y
      }

      gate.outputs.forEach((pin, index) => {
        ret[pin.id] = {
          x: x + 0.5,
          y: y + 0.25 - distribute(index, gate.outputs.length) * 0.225
        }
      })

      return ret
    } else {
      const ret = {}

      gate.inputs.forEach((pin, index) => {
        ret[pin.id] = {
          x: x,
          y: y + 0.25 - distribute(index, gate.inputs.length) * 0.225
        }
      })

      gate.outputs.forEach((pin, index) => {
        ret[pin.id] = {
          x: x + 0.5,
          y: y + 0.25 - distribute(index, gate.outputs.length) * 0.225
        }
      })

      return ret
    }
  },

  getWidth (gate, state) {
    return gate.width || 0.5
  },

  getHeight (gate, state) {
    return gate.height || 0.5
  }
}

export {
  defaultTheme
}

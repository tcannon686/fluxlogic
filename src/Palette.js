import React from 'react'

import Tooltip from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import AndGateSvg from './assets/and-gate.svg'
import OrGateSvg from './assets/or-gate.svg'
import XorGateSvg from './assets/xor-gate.svg'
import OneGateSvg from './assets/one-gate.svg'
import ZeroGateSvg from './assets/zero-gate.svg'
import LedSvg from './assets/led.svg'
import BufferGateSvg from './assets/buffer-gate.svg'
import SwitchOffSvg from './assets/switch-off.svg'
import SenderSvg from './assets/sender.svg'
import ReceiverSvg from './assets/receiver.svg'
import MuxSvg from './assets/mux.svg'
import DemuxSvg from './assets/demux.svg'

import PinInvertedSvg from './assets/pin-inverted.svg'

import Wire from './Wire'

import logic from './logic'

function PaletteItem (props) {
  return (
    <Grid item xs={3}>
      <Tooltip title={`Add ${props.text}`}>
        <Button onClick={props.onClick}>
          <div
            style={{
              position: 'relative',
              width: '0.5in',
              height: '0.5in',
              overflow: 'hidden'
            }}
          >
            {
              props.inverted && (
                <Wire
                  x0={0.25}
                  y0={0.25}
                  x1={0.5 - 0.0625}
                  y1={0.25}
                />
              )
            }

            {
              props.inverted && (
                <img
                  src={PinInvertedSvg}
                  alt=''
                  style={{
                    position: 'absolute',
                    left: `${0.5 - 0.125}in`,
                    top: `${0.25 - 0.0625}in`
                  }}
                />
              )
            }

            <img
              src={props.svg}
              alt=''
              style={{
                position: 'absolute',
                left: props.inverted ? '-0.0625in' : 0,
                top: 0
              }}
            />
          </div>
        </Button>
      </Tooltip>
    </Grid>
  )
}

/**
 * A palette for placing components.
 * Props:
 *     - onSelect(factory)
 *           A callback called when the user selects an item. The factory
 *           parameter is a function that constructs a new logic gate.
 */
function Palette (props) {
  const invert = (gate) => {
    gate.outputs[0].isInverted = true
    return gate
  }
  return (
    <Grid container className={props.className}>
      <PaletteItem
        svg={AndGateSvg}
        text='AND gate'
        onClick={() => props.onSelect(logic.andGate)}
      />
      <PaletteItem
        svg={AndGateSvg}
        text='NAND gate'
        onClick={() => props.onSelect(() => invert(logic.andGate()))}
        inverted
      />
      <PaletteItem
        svg={OrGateSvg}
        text='OR gate'
        onClick={() => props.onSelect(logic.orGate)}
      />
      <PaletteItem
        svg={OrGateSvg}
        text='NOR gate'
        onClick={() => props.onSelect(() => invert(logic.orGate()))}
        inverted
      />
      <PaletteItem
        svg={XorGateSvg}
        text='XOR gate'
        onClick={() => props.onSelect(logic.xorGate)}
      />
      <PaletteItem
        svg={ZeroGateSvg}
        text='ground'
        onClick={() => props.onSelect(() => logic.constantGate(false))}
      />
      <PaletteItem
        svg={OneGateSvg}
        text='+1'
        onClick={() => props.onSelect(() => logic.constantGate(true))}
      />
      <PaletteItem
        svg={BufferGateSvg}
        text='buffer'
        onClick={() => props.onSelect(() => logic.buffer())}
      />
      <PaletteItem
        svg={BufferGateSvg}
        text='inverter'
        onClick={() => props.onSelect(() => invert(logic.buffer()))}
        inverted
      />
      <PaletteItem
        svg={LedSvg}
        text='LED'
        onClick={() => props.onSelect(() => logic.led())}
      />
      <PaletteItem
        svg={SwitchOffSvg}
        text='switch'
        onClick={() => props.onSelect(logic.switchGate)}
      />
      <PaletteItem
        svg={SenderSvg}
        text='sender'
        onClick={() => props.onSelect(logic.sender)}
      />
      <PaletteItem
        svg={ReceiverSvg}
        text='receiver'
        onClick={() => props.onSelect(logic.receiver)}
      />
      <PaletteItem
        svg={MuxSvg}
        text='2 to 1 mux'
        onClick={() => props.onSelect(() => logic.mux(1))}
      />
      <PaletteItem
        svg={MuxSvg}
        text='4 to 1 mux'
        onClick={() => props.onSelect(() => logic.mux(2))}
      />
      <PaletteItem
        svg={DemuxSvg}
        text='1 to 2 demux'
        onClick={() => props.onSelect(() => logic.demux(1))}
      />
      <PaletteItem
        svg={DemuxSvg}
        text='1 to 4 demux'
        onClick={() => props.onSelect(() => logic.demux(2))}
      />
    </Grid>
  )
}

export default Palette

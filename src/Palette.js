import React from 'react'

import Tooltip from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import AndGateSvg from './assets/and-gate.svg'
import OrGateSvg from './assets/or-gate.svg'
import OneGateSvg from './assets/one-gate.svg'
import ZeroGateSvg from './assets/zero-gate.svg'

import logic from './logic'

function PaletteItem (props) {
  return (
    <Grid item xs={3}>
      <Tooltip title={`Add ${props.text}`}>
        <Button onClick={props.onClick}>
          <img className='paletteItemImage' src={props.svg} alt='' />
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
  return (
    <Grid container className={props.className}>
      <PaletteItem
        svg={AndGateSvg}
        text='and gate'
        onClick={() => props.onSelect(logic.andGate)}
      />
      <PaletteItem
        svg={OrGateSvg}
        text='or gate'
        onClick={() => props.onSelect(logic.orGate)}
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
    </Grid>
  )
}

export default Palette

import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'

import Wire from './Wire'

const useStyles = makeStyles((theme) => ({
  selectedGate: {
    position: 'absolute',
    margin: '-1px',
    left: 0,
    top: 0,
    border: `1px solid ${theme.palette.primary.main}`,
    background: fade(theme.palette.primary.main, 0.25),
    borderRadius: '4px',
    cursor: 'move'
  },

  gate: {
    position: 'absolute',
    left: 0,
    top: 0
  },

  pin: {
    position: 'absolute',
    left: 0,
    top: 0
  },

  editableGate: {
    position: 'absolute',
    left: 0,
    top: 0,
    margin: '-1px',
    border: '1px solid #ffffff00',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      border: `1px solid ${theme.palette.primary.main}`
    }
  },

  editablePin: {
    position: 'absolute',
    margin: 0,
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      border: `1px solid ${theme.palette.primary.main}`,
      margin: '-1px'
    }
  }
}))

/*
 * A react component representing a single logic gate.
 */
function LogicGate (props) {
  /*
   * The object responsible for placing the pins and choosing the SVGs. Note
   * that this is not related to the material-ui theme.
   */
  const theme = props.theme

  const classes = useStyles()

  /* The position of the gate. */
  const x = props.x
  const y = props.y

  const width = theme.getWidth(props.gate)
  const height = theme.getWidth(props.gate)

  /* The positions of the pins. */
  const pinPositions = theme.getPinPositions(props.gate, x, y)

  const isSelected = props.selection[props.gate.id]

  const Pin = (pinProps) => (
    <img
      alt=''
      src={theme.getPinSvg(pinProps.pin, props.simState)}
      onMouseDown={
        (e) => props.onPinMouseDown(e, pinProps.pin.id, pinProps.isOutput)
      }
      onMouseUp={
        (e) => props.onPinMouseUp(e, pinProps.pin.id, pinProps.isOutput)
      }
      style={{
        left: `${pinPositions[pinProps.pin.id].x - x - 0.0625}in`,
        top: `${pinPositions[pinProps.pin.id].y - y - 0.0625}in`
      }}
      className={props.editable ? classes.editablePin : classes.pin}
    />
  )

  return (
    <div
      style={{
        left: `${x}in`,
        top: `${y}in`,
        width: `${width}in`,
        height: `${height}in`
      }}
      className={
        isSelected
          ? classes.selectedGate
          : (props.editable ? classes.editableGate : classes.gate)
      }
    >

      {
        /* Input pin wires */
        props.gate.outputs.map((pin) =>
          <Wire
            key={`${pin.id}-`}
            x0={pinPositions[pin.id].x - x}
            y0={pinPositions[pin.id].y - y}
            x1={pinPositions[pin.id].x - x - 0.25}
            y1={pinPositions[pin.id].y - y}
          />)
      }

      {
        /* Output pin wires */
        props.gate.inputs.map((pin) =>
          <Wire
            key={`${pin.id}-`}
            x0={pinPositions[pin.id].x - x}
            y0={pinPositions[pin.id].y - y}
            x1={pinPositions[pin.id].x - x + 0.25}
            y1={pinPositions[pin.id].y - y}
          />)
      }

      {/* The gate itself */}
      <img
        alt={props.gate.type}
        src={theme.getGateSvg(props.gate, props.simState)}
        style={{ position: 'absolute' }}
        onClick={props.onClick}
        onMouseDown={props.onMouseDown}
      />

      {
        /* Input pins */
        props.gate.inputs.map((pin) =>
          <Pin pin={pin} isOutput={false} key={pin.id} />
        )
      }

      {
        /* Output pins */
        props.gate.outputs.map((pin) =>
          <Pin pin={pin} isOutput key={pin.id} />
        )
      }
    </div>
  )
}

export default LogicGate

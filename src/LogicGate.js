import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'

import Wire from './Wire'

const useStyles = makeStyles((theme) => ({
  selectedGate: {
    position: 'absolute',
    left: 0,
    top: 0,
    background: fade(theme.palette.primary.main, 0.3),
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
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      background: fade(theme.palette.primary.main, 0.15)
    }
  },

  editablePin: {
    position: 'absolute',
    margin: 0,
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      background: fade(theme.palette.primary.main, 0.3)
    }
  },

  label: {
    position: 'relative',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    width: '1in',
    top: '-.1in',
    pointerEvents: 'none'
  }
}))

/*
 * A react component representing a single logic gate.
 */
const LogicGate = React.memo((props) => {
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
  const height = theme.getHeight(props.gate)

  /* The positions of the pins. */
  const pinPositions = theme.getPinPositions(props.gate, x, y)

  const isSelected = props.selected

  const Pin = (pinProps) => (
    <img
      alt=''
      src={theme.getPinSvg(pinProps.pin)}
      onMouseDown={
        (e) => props.onPinMouseDown(e, pinProps.pin, pinProps.isOutput)
      }
      onMouseUp={
        (e) => props.onPinMouseUp(e, pinProps.pin, pinProps.isOutput)
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
        props.editable
          ? (isSelected ? classes.selectedGate : classes.editableGate)
          : classes.gate
      }
    >

      {
        /* Input pin wires */
        props.gate.outputs.map((pin) =>
          <Wire
            key={`${pin.id}-`}
            x0={pinPositions[pin.id].x - x}
            y0={pinPositions[pin.id].y - y}
            x1={(pinPositions[pin.id].x1 || pinPositions[pin.id].x - 0.25) - x}
            y1={(pinPositions[pin.id].y1 || pinPositions[pin.id].y) - y}
          />)
      }

      {
        /* Output pin wires */
        props.gate.inputs.map((pin) =>
          <Wire
            key={`${pin.id}-`}
            x0={pinPositions[pin.id].x - x}
            y0={pinPositions[pin.id].y - y}
            x1={(pinPositions[pin.id].x1 || pinPositions[pin.id].x + 0.25) - x}
            y1={(pinPositions[pin.id].y1 || pinPositions[pin.id].y) - y}
          />)
      }

      {/* The gate itself */}
      <img
        alt={props.gate.type}
        src={props.svg}
        style={{ position: 'absolute' }}
        onClick={(e) => props.onGateClick(e, props.gate)}
        onMouseDown={(e) => props.onGateMouseDown(e, props.gate)}
      />

      {
        props.gate.label && (
          <p
            className={classes.label}
            style={{ left: `${theme.getWidth(props.gate) / 2}in` }}
          >
            {props.gate.label}
          </p>
        )
      }

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
})

export default LogicGate

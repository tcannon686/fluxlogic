import React, { useState, useEffect, useMemo } from 'react'

import logic from './logic'

/* Icons. */
import DeleteIcon from '@material-ui/icons/Delete'

/* Material UI components. */
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  form: {
    '& > *': {
      margin: theme.spacing(1)
    }
  }
}))

function PinProperties (props) {
  return (
    <ListItem>
      <ListItemIcon>
        <Tooltip title='Invert pin'>
          <Checkbox
            checked={Boolean(props.pin.isInverted)}
            onChange={(e) => {
              const clone = { ...props.pin }
              if (e.target.checked) {
                clone.isInverted = true
              } else {
                delete clone.isInverted
              }
              props.onChange(clone)
            }}
          />
        </Tooltip>
      </ListItemIcon>
      <ListItemText> Pin {props.index + 1} </ListItemText>
      {
        props.deletable && (
          <Button
            onClick={props.onPinDeleted}
          >
            <DeleteIcon />
          </Button>
        )
      }
    </ListItem>
  )
}

/**
 * A react component for the inspector. The inspector allows the user to modify
 * the properties of each logic gate through a forms-style user interface.
 */
export default function Inspector (props) {
  const { circuit, selection } = props
  const classes = useStyles()

  const selectedGates = useMemo(
    () => circuit.gates.filter((gate) => selection[gate.id]),
    [circuit, selection]
  )

  const minX = useMemo(
    () => selectedGates.reduce((min, gate) => Math.min(min, gate.x), Infinity),
    [selectedGates]
  )

  const minY = useMemo(
    () => selectedGates.reduce((min, gate) => Math.min(min, gate.y), Infinity),
    [selectedGates]
  )

  const sharedLabel = useMemo(
    () => selectedGates.reduce((label, gate) =>
      label === undefined
        ? gate.label || ''
        : (gate.label === label && gate.label !== undefined ? label : ''),
    undefined) || '',
    [selectedGates]
  )

  const allHaveLabels = useMemo(
    () => selectedGates.every((gate) => gate.label !== undefined),
    [selectedGates]
  )

  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [label, setLabel] = useState('')

  useEffect(() => {
    setX(minX)
    setY(minY)
  }, [minX, minY])

  useEffect(() => {
    setLabel(sharedLabel)
  }, [sharedLabel])

  const updateGates = (callback) => {
    const clone = { ...circuit }
    clone.gates = circuit.gates.map((gate) => {
      if (selection[gate.id]) {
        return callback(gate)
      } else {
        return gate
      }
    })
    props.onCircuitChanged(clone)
  }

  const gate = selectedGates[0]

  const updatePin = (index, pin, isOutput) => {
    const clone = { ...circuit }
    clone.gates = [...circuit.gates]
    const gateClone = {
      ...gate
    }
    clone.gates[clone.gates.indexOf(gate)] = gateClone

    if (isOutput) {
      gateClone.outputs = [...gateClone.outputs]
      gateClone.outputs[index] = pin
    } else {
      gateClone.inputs = [...gateClone.inputs]
      gateClone.inputs[index] = pin
    }
    props.onCircuitChanged(clone)
  }

  const addPin = (isOutput) => {
    const clone = { ...circuit }
    clone.gates = [...circuit.gates]
    const gateClone = {
      ...gate
    }
    clone.gates[clone.gates.indexOf(gate)] = gateClone

    if (isOutput) {
      gateClone.outputs = [...gateClone.outputs, logic.pin()]
    } else {
      gateClone.inputs = [...gateClone.inputs, logic.pin()]
    }
    props.onCircuitChanged(clone)
  }

  const deletePin = (index, isOutput) => {
    const clone = { ...circuit }
    clone.gates = [...circuit.gates]
    const gateClone = {
      ...gate
    }
    clone.gates[clone.gates.indexOf(gate)] = gateClone

    if (isOutput) {
      gateClone.outputs = gateClone.outputs.filter((v, i) => i !== index)
    } else {
      gateClone.inputs = gateClone.inputs.filter((v, i) => i !== index)
    }

    clone.gates = logic.removeInvalidConnections(clone.gates)

    props.onCircuitChanged(clone)
  }

  if (selectedGates.length === 0) {
    return (
      <Typography variant='body1'>
        Make a selection, then its properties will be available here.
      </Typography>
    )
  } else {
    const gateProps = (
      <>
        <Typography variant='h5'>Inputs</Typography>
        <List>
          {
            gate.inputs.map((pin, i) =>
              <PinProperties
                key={i}
                index={i}
                pin={pin}
                onChange={(newPin) => updatePin(i, newPin, false)}
                onPinDeleted={() => deletePin(i, false)}
                deletable={gate.inputs.length > 2}
              />
            )
          }
          {
            (gate.type === 'and' || gate.type === 'or' || gate.type === 'xor') &&
        (gate.inputs.length < 4) &&
        (
          <ListItem>
            <Button
              variant='contained'
              fullWidth
              onClick={() => addPin(false)}
            >
              Add Pin
            </Button>
          </ListItem>
        )
          }
        </List>

        <Typography variant='h5'>Outputs</Typography>
        <List>
          {
            gate.outputs.map((pin, i) =>
              <PinProperties
                key={i}
                index={i}
                pin={pin}
                onChange={(newPin) => updatePin(i, newPin, true)}
                onPinDeleted={() => deletePin(i, true)}
              />
            )
          }
        </List>
      </>
    )

    return (
      <form className={classes.form} noValidate>
        <TextField
          label='X'
          variant='filled'
          value={x}
          onChange={(e) => setX(e.target.value)}
          onBlur={(e) => {
            if (!isNaN(e.target.value)) {
              updateGates((gate) => ({
                ...gate,
                x: Number(e.target.value) - minX + gate.x
              }))
            }
          }}
        />

        <TextField
          label='Y'
          variant='filled'
          onChange={(e) => setY(e.target.value)}
          value={y}
          onBlur={(e) => {
            if (!isNaN(e.target.value)) {
              updateGates((gate) => ({
                ...gate,
                y: Number(e.target.value) - minY + gate.y
              }))
            }
          }}
        />

        <TextField
          label='Label'
          variant='filled'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={!allHaveLabels}
          onBlur={(e) => {
            if (e.target.value.length > 0) {
              updateGates((gate) => ({
                ...gate,
                label: e.target.value
              }))
            }
          }}
        />

        {
          selectedGates.length === 1 && gateProps
        }
      </form>
    )
  }
}

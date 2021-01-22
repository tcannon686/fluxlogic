import React, { useState, useEffect, useMemo } from 'react'

import * as logic from './logic'

/* Icons. */
import DeleteIcon from '@material-ui/icons/Delete'

/* Material UI components. */
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'

import ListSection from './ListSection'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  evenlySpaced: {
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
      <ListItemText> {props.label || `Pin ${props.index + 1}`} </ListItemText>
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

  const alignX = () => {
    const clone = { ...circuit }
    clone.gates = circuit.gates.map((gate) =>
      selection[gate.id]
        ? { ...gate, x: minX }
        : gate)
    props.onCircuitChanged(clone)
  }

  const alignY = () => {
    const clone = { ...circuit }
    clone.gates = circuit.gates.map((gate) =>
      selection[gate.id]
        ? { ...gate, y: minY }
        : gate)
    props.onCircuitChanged(clone)
  }

  const distributeX = () => {
    const clone = { ...circuit }
    const order = [...selectedGates].sort((a, b) => a.x - b.x)
    clone.gates = circuit.gates.map((gate) =>
      selection[gate.id]
        ? { ...gate, x: order.indexOf(gate) * 0.75 + minX }
        : gate)
    props.onCircuitChanged(clone)
  }

  const distributeY = () => {
    const clone = { ...circuit }
    const order = [...selectedGates].sort((a, b) => a.y - b.y)
    clone.gates = circuit.gates.map((gate) =>
      selection[gate.id]
        ? { ...gate, y: order.indexOf(gate) * 0.5 + minY }
        : gate)
    props.onCircuitChanged(clone)
  }

  const gate = selectedGates[0]

  /* Properties only editable for a single gate. */
  const [text, setText] = useState('')
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (gate) {
      setText(gate.text || '')
      setWidth(gate.width || 0)
      setHeight(gate.height || 0)
    }
  }, [gate])

  if (selectedGates.length === 0) {
    return (
      <Box p={3}>
        <Typography variant='body1'>
          Make a selection, then its properties will be available here.
        </Typography>
      </Box>
    )
  } else {
    const isLogicGate = (
      gate.type === 'and' ||
      gate.type === 'or' ||
      gate.type === 'xor')

    const inputProps = (
      <ListSection title='Inputs'>
        <List>
          {
            gate.inputs.map((pin, i) =>
              <PinProperties
                key={i}
                index={i}
                pin={pin}
                label={
                  gate.type === 'mux' &&
                    (i < gate.n ? `Select ${i + 1}` : `Data ${i - gate.n + 1}`)
                }
                onChange={(newPin) => updatePin(i, newPin, false)}
                onPinDeleted={() => deletePin(i, false)}
                deletable={gate.inputs.length > 2 && isLogicGate}
              />
            )
          }
          {
            isLogicGate &&
        (gate.inputs.length < 4) &&
        (
          <ListItem>
            <Button
              fullWidth
              onClick={() => addPin(false)}
            >
              Add Pin
            </Button>
          </ListItem>
        )
          }
        </List>
      </ListSection>
    )

    const outputProps = (
      <ListSection title='Outputs'>
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
      </ListSection>
    )

    const textProps = (
      <ListSection title='Text'>
        <TextField
          multiline
          fullWidth
          label='Text'
          variant='filled'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => {
            if (e.target.value.length > 0) {
              updateGates((gate) => ({
                ...gate,
                text: e.target.value
              }))
            }
          }}
        />
      </ListSection>
    )

    const sizeProps = (
      <ListSection title='Size'>
        <Box class={classes.evenlySpaced}>
          <TextField
            fullWidth
            label='Width'
            variant='filled'
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            onBlur={(e) => {
              if (!isNaN(e.target.value)) {
                updateGates((gate) => ({
                  ...gate,
                  width: Number(e.target.value)
                }))
              }
            }}
          />

          <TextField
            fullWidth
            label='Height'
            variant='filled'
            onChange={(e) => setHeight(e.target.value)}
            value={height}
            onBlur={(e) => {
              if (!isNaN(e.target.value)) {
                updateGates((gate) => ({
                  ...gate,
                  height: Number(e.target.value)
                }))
              }
            }}
          />
        </Box>
      </ListSection>
    )

    /* Properties only editable for an individual gate. */
    const gateProps = (
      <>
        {gate.inputs.length > 0 && inputProps}
        {gate.outputs.length > 0 && outputProps}
        {gate.width !== undefined && gate.height !== undefined && sizeProps}
        {gate.text !== undefined && textProps}
      </>
    )

    const positionProps = (
      <ListSection title='Position'>
        <Box class={classes.evenlySpaced}>
          <TextField
            fullWidth
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
            fullWidth
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

          {
            selectedGates.length > 1 && (
              <>
                <ButtonGroup
                  fullWidth
                >
                  <Button onClick={alignX}>
                    Align X
                  </Button>
                  <Button onClick={alignY}>
                    Align Y
                  </Button>
                </ButtonGroup>
                <ButtonGroup
                  fullWidth
                >
                  <Button onClick={distributeX}>
                    Distribute X
                  </Button>
                  <Button onClick={distributeY}>
                    Distribute Y
                  </Button>
                </ButtonGroup>
              </>
            )
          }
        </Box>
      </ListSection>
    )

    const labelProps = (
      <>
        <ListSection title='Label'>
          <TextField
            fullWidth
            label='Label'
            variant='filled'
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={(e) => {
              if (e.target.value.length > 0) {
                updateGates((gate) => ({
                  ...gate,
                  label: e.target.value
                }))
              }
            }}
          />
        </ListSection>
      </>
    )

    return (
      <form noValidate>
        <List>
          {positionProps}
          {allHaveLabels && labelProps}
          {selectedGates.length === 1 && gateProps}
        </List>
      </form>
    )
  }
}

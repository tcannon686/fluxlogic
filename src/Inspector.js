import React, { useState, useEffect, useMemo } from 'react'

/* Material UI components. */
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  form: {
    '& > *': {
      margin: theme.spacing(1)
    }
  }
}))

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

  if (selectedGates.length === 0) {
    return (
      <Typography variant='body1'>
        Make a selection, then its properties will be available here.
      </Typography>
    )
  } else {
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
      </form>
    )
  }
}

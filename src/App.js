import React, { useState } from 'react'

/* Material UI components. */
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import Container from '@material-ui/core/Container'
import Drawer from '@material-ui/core/Drawer'
import Typography from '@material-ui/core/Typography'

/* Icons. */
import PlayIcon from '@material-ui/icons/PlayArrow'
import DeleteIcon from '@material-ui/icons/Delete'
import RedoIcon from '@material-ui/icons/Redo'
import UndoIcon from '@material-ui/icons/Undo'
import PauseIcon from '@material-ui/icons/Pause'
import HelpIcon from '@material-ui/icons/Help'

import { makeStyles } from '@material-ui/core/styles'

/* Page components. */
import Page from './Page'
import Palette from './Palette'

/* Logic components. */
import logic from './logic'
import { defaultTheme } from './themes'

const drawerWidth = 256

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  menuButtonGroup: {
    marginRight: theme.spacing(2)
  },
  hide: {
    display: 'none'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerContent: {
    width: drawerWidth
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  title: {
    flexGrow: 1
  }
}))

function App () {
  const [circuit, setCircuit] = useState(() => logic.circuit([]))
  const [selection, setSelection] = useState(false)

  /* Refs used for calculating the center of the page. */
  const appBarRef = React.createRef()
  const pageRef = React.createRef()

  const classes = useStyles()

  const deleteSelection = () => {
    const clone = { ...circuit }

    /* Remove the selected gates. */
    clone.gates = clone.gates.filter((gate) => !selection[gate.id])

    /* Create an object containing the IDs of all valid pins. */
    const validPins = Object.fromEntries(clone.gates.reduce(
      (t, gate) => t.concat(
        gate.inputs.map((pin) => pin.id),
        gate.outputs.map((pin) => pin.id)),
      []
    ).map((id) => [id, true]))

    /* Remove all connections that point to a deleted pin. */
    clone.gates = clone.gates.map((gate) => {
      const gateClone = { ...gate }
      const updatePin = (pin) => {
        return {
          ...pin,
          connections: pin.connections.filter((id) => validPins[id])
        }
      }

      gateClone.inputs = gateClone.inputs.map(updatePin)
      gateClone.outputs = gateClone.outputs.map(updatePin)
      return gateClone
    })

    setCircuit(clone)
  }

  const addWire = (from, to) => {
    const clone = { ...circuit }

    /*
     * Function that takes in a pin, clones it and adds a connection if it is
     * the from or to pin. Returns the pin otherwise.
     */
    const updatePin = (pin) => {
      if (pin.id === from && pin.connections.length === 0) {
        return { ...pin, connections: [to] }
      } else if (pin.id === to && pin.connections.length === 0) {
        return { ...pin, connections: [from] }
      } else {
        return pin
      }
    }

    /* Only update if the input pin has no connections. */
    let shouldUpdate = false

    clone.gates = clone.gates.map((gate) => {
      let hasPin = false
      const inputs = gate.inputs.map((pin) => {
        const r = updatePin(pin)
        if (r !== pin) { hasPin = true }
        return r
      })

      /* If the gate has the pin, clone the gate. */
      if (hasPin) {
        shouldUpdate = true
        return { ...gate, inputs }
      } else {
        return gate
      }
    })

    if (shouldUpdate) {
      /* Update output pin. */
      clone.gates = clone.gates.map((gate) => {
        let hasPin = false
        const outputs = gate.outputs.map((pin) => {
          const r = updatePin(pin)
          if (r !== pin) { hasPin = true }
          return r
        })

        /* If the gate has the pin, clone it. */
        if (hasPin) {
          return { ...gate, outputs }
        } else {
          return gate
        }
      })

      setCircuit(clone)
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />

      <Drawer variant='persistent' className={classes.drawer} open>
        <Toolbar />
        <Palette
          className={classes.drawerContent}
          onSelect={(factory) => {
            /* Clone the circuit. */
            const clone = { ...circuit }
            clone.gates = [...clone.gates]

            /* Place the gate. */
            const gate = factory()
            clone.gates.push(gate)

            /* Calculate the gate position. */
            const appBarRect = appBarRef.current.getBoundingClientRect()
            const pageRect = pageRef.current.getBoundingClientRect()

            gate.x = ((appBarRect.width + drawerWidth) / 2 - pageRect.left) / 96
            gate.y = (
              (window.innerHeight + appBarRect.height) / 2 - pageRect.top) / 96

            /* Update with the new circuit. */
            setCircuit(clone)
          }}
        />
      </Drawer>

      <AppBar position='fixed' className={classes.appBar} ref={appBarRef}>
        <Toolbar>

          <Typography variant='h6' className={classes.title}>MML2</Typography>

          <ButtonGroup className={classes.menuButtonGroup}>
            <Tooltip title='Undo'>
              <Button aria-label='undo'>
                <UndoIcon />
              </Button>
            </Tooltip>
            <Tooltip title='Redo'>
              <Button aria-label='redo'>
                <RedoIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <ButtonGroup className={classes.menuButtonGroup}>
            <Tooltip title='Start simulation'>
              <Button aria-label='play'>
                <PlayIcon />
              </Button>
            </Tooltip>
            <Tooltip title='Pause simulation'>
              <Button aria-label='pause'>
                <PauseIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Tooltip title='Delete selection'>
            <Button
              aria-label='delete'
              onClick={deleteSelection}
              className={classes.menuButton}
            >
              <DeleteIcon />
            </Button>
          </Tooltip>

          <Tooltip title='Help'>
            <Button
              aria-label='help'
              className={classes.menuButton}
            >
              <HelpIcon />
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Toolbar />
      <main className={classes.content}>
        <Toolbar />
        <Container>
          <Page
            circuit={circuit}
            theme={defaultTheme}
            ref={pageRef}
            selection={selection}
            onSelectionChanged={(selection) => {
              setSelection(selection)
            }}
            onMove={(moveAmount) => {
              const clone = { ...circuit }
              clone.gates = clone.gates.map((gate) => {
                if (selection[gate.id]) {
                  /* Copy the gate. */
                  gate = { ...gate }
                  gate.x += moveAmount[0]
                  gate.y += moveAmount[1]
                }
                return gate
              })
              setCircuit(clone)
            }}
            onWireAdded={addWire}
          />
        </Container>
      </main>
    </div>
  )
}

export default App

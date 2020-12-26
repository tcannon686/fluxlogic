import React, { useState, useEffect, useRef } from 'react'

import packageJson from '../package.json'

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
import Snackbar from '@material-ui/core/Snackbar'

/* Icons. */
import StopIcon from '@material-ui/icons/Stop'
import PlayIcon from '@material-ui/icons/PlayArrow'
import DeleteIcon from '@material-ui/icons/Delete'
import RedoIcon from '@material-ui/icons/Redo'
import UndoIcon from '@material-ui/icons/Undo'
import PauseIcon from '@material-ui/icons/Pause'
import HelpIcon from '@material-ui/icons/Help'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'

import { makeStyles } from '@material-ui/core/styles'

/* Page components. */
import Page from './Page'
import Palette from './Palette'

/* Logic components. */
import logic from './logic'
import { defaultTheme } from './themes'

import { upload, download } from './utils'

import { useUndoable } from './hooks'

// eslint-disable-next-line import/no-webpack-loader-syntax
import SimWorker from 'workerize-loader!./sim.worker'

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
  const [circuit, setCircuit, undo, redo] = useUndoable(() => logic.circuit([]))
  const [selection, setSelection] = useState(false)
  const [simState, setSimState] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const simWorker = useRef(new SimWorker())

  /* For opening and closing the upload error snackbar. */
  const [openUploadError, setOpenUploadError] = useState(false)

  /* Refs used for calculating the center of the page. */
  const appBarRef = React.createRef()
  const pageRef = React.createRef()

  const classes = useStyles()

  const onPlayButtonClicked = () => {
    if (!isPlaying) {
      simWorker.current.startSimulation(circuit)
      setIsPlaying(true)
    } else {
      simWorker.current.stopSimulation()
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    let shouldLoop = isPlaying

    const loop = (state) => {
      if (shouldLoop) {
        setSimState(state)
        simWorker.current.getState().then(loop)
      } else {
        setSimState(null)
      }
    }
    loop(null)

    return () => { shouldLoop = false }
  }, [isPlaying])

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
    const updatePin = (pin, isOutputPin) => {
      if (isOutputPin || pin.connections.length === 0) {
        if (pin.id === from) {
          return { ...pin, connections: [...pin.connections, to] }
        } else if (pin.id === to) {
          return { ...pin, connections: [...pin.connections, from] }
        }
      }
      return pin
    }

    /* Only update if the input pin has no connections. */
    let shouldUpdate = false

    clone.gates = clone.gates.map((gate) => {
      let hasPin = false
      const inputs = gate.inputs.map((pin) => {
        const r = updatePin(pin)
        if (r !== pin) {
          hasPin = true
        }
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
          const r = updatePin(pin, true)
          if (r !== pin) {
            hasPin = true
          }
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

          <ButtonGroup
            className={classes.menuButtonGroup}
            color='inherit'
          >
            <Tooltip title='Upload project'>
              <Button
                aria-label='upload'
                onClick={
                  () => upload()
                    .then((data) => {
                      setCircuit(logic.renumber(data.circuit))
                    })
                    .catch((error) => {
                      setOpenUploadError(true)
                      console.error(error)
                    })
                }
              >
                <CloudUploadIcon />
              </Button>
            </Tooltip>
            <Tooltip title='Download project'>
              <Button
                aria-label='download'
                onClick={() => {
                  download('circuit.json', {
                    version: packageJson.version,
                    circuit
                  })
                }}
              >
                <CloudDownloadIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <ButtonGroup
            className={classes.menuButtonGroup}
            color='inherit'
          >
            <Tooltip title='Undo'>
              <Button aria-label='undo' onClick={undo}>
                <UndoIcon />
              </Button>
            </Tooltip>
            <Tooltip title='Redo'>
              <Button aria-label='redo' onClick={redo}>
                <RedoIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <ButtonGroup
            className={classes.menuButtonGroup}
            color='inherit'
          >
            <Tooltip title={isPlaying ? 'Stop simulation' : 'Start simulation'}>
              <Button
                aria-label={isPlaying ? 'stop' : 'start'}
                onClick={onPlayButtonClicked}
              >
                {
                  isPlaying ? <StopIcon /> : <PlayIcon />
                }
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
              color='inherit'
            >
              <DeleteIcon />
            </Button>
          </Tooltip>

          <Tooltip title='Help'>
            <Button
              aria-label='help'
              className={classes.menuButton}
              color='inherit'
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
            simState={simState}
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
            onUserInputChanged={(gate, value) => {
              simWorker.current.setUserInput(gate, value)
            }}
            editable={!simState}
          />
        </Container>
      </main>
      <Snackbar
        open={openUploadError}
        autoHideDuration={10000}
        onClose={() => { setOpenUploadError(false) }}
        message="Uh oh! We weren't able to load that file."
      />
    </div>
  )
}

export default App

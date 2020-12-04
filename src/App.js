import React, { useState } from 'react'
import './App.css'

/* Material UI components. */
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import Container from '@material-ui/core/Container'
import Drawer from '@material-ui/core/Drawer'

/* Icons. */
import StopIcon from '@material-ui/icons/Stop'
import PlayIcon from '@material-ui/icons/PlayArrow'
import DeleteIcon from '@material-ui/icons/Delete'
import RedoIcon from '@material-ui/icons/Redo'
import UndoIcon from '@material-ui/icons/Undo'
import PauseIcon from '@material-ui/icons/Pause'

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
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth
  },
  menuButton: {
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
  }
}))

function App () {
  const [circuit, setCircuit] = useState(() => logic.circuit([]))
  const [selection, setSelection] = useState(false)

  /* Refs used for calculating the center of the page. */
  const appBarRef = React.createRef()
  const pageRef = React.createRef()

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position='fixed' className={classes.appBar} ref={appBarRef}>
        <Toolbar>

          <ButtonGroup>
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

          <ButtonGroup>
            <Tooltip title='Stop simulation'>
              <Button aria-label='stop'>
                <StopIcon />
              </Button>
            </Tooltip>
            <Tooltip title='Pause simulation'>
              <Button aria-label='pause'>
                <PauseIcon />
              </Button>
            </Tooltip>
            <Tooltip title='Start simulation'>
              <Button aria-label='play'>
                <PlayIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Tooltip title='Delete selection'>
            <Button
              aria-label='delete'
              onClick={() => {
                const clone = { ...circuit }
                clone.gates = clone.gates.filter(
                  (gate) => !selection[gate.id])
                setCircuit(clone)
              }}
            >
              <DeleteIcon />
            </Button>
          </Tooltip>

        </Toolbar>
      </AppBar>

      <Drawer variant='persistent' className={classes.drawer} open>
        <Palette
          className={classes.drawerContent}
          onSelect={(factory) => {
            /* Clone the circuit. */
            const clone = Object.assign({}, circuit)

            /* Place the gate. */
            const gate = factory()
            clone.gates.push(gate)

            /* Calculate the gate position. */
            const appBarRect = appBarRef.current.getBoundingClientRect()
            const pageRect = pageRef.current.getBoundingClientRect()

            gate.x = (appBarRect.width / 2 - pageRect.left + drawerWidth) / 96
            gate.y = (
              (window.innerHeight + appBarRect.height) / 2 - pageRect.top) / 96

            /* Update with the new circuit. */
            setCircuit(clone)
          }}
        />
      </Drawer>

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
          />
        </Container>
      </main>
    </div>
  )
}

export default App

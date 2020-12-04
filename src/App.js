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

  return (
    <div className={classes.root}>
      <CssBaseline />

      <Drawer variant='persistent' className={classes.drawer} open>
        <Toolbar />
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
              onClick={() => {
                const clone = { ...circuit }
                clone.gates = clone.gates.filter(
                  (gate) => !selection[gate.id])
                setCircuit(clone)
              }}
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
              clone.gates.forEach((gate) => {
                if (selection[gate.id]) {
                  gate.x += moveAmount[0]
                  gate.y += moveAmount[1]
                }
              })
              setCircuit(clone)
            }}
          />
        </Container>
      </main>
    </div>
  )
}

export default App

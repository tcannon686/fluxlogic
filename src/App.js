import React, { useState, useEffect, useRef, useCallback } from 'react'

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
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'
import Fade from '@material-ui/core/Fade'

/* Icons. */
import StopIcon from '@material-ui/icons/Stop'
import PlayIcon from '@material-ui/icons/PlayArrow'
import DeleteIcon from '@material-ui/icons/Delete'
import RedoIcon from '@material-ui/icons/Redo'
import UndoIcon from '@material-ui/icons/Undo'
import HelpIcon from '@material-ui/icons/Help'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { makeStyles } from '@material-ui/core/styles'

/* Editor components. */
import Page from './Page'
import Palette from './Palette'
import Inspector from './Inspector'

/* Logic components. */
import * as logic from './logic'
import { defaultTheme } from './themes'

import { upload, download } from './utils'

import { useUndoable } from './hooks'

// eslint-disable-next-line import/no-webpack-loader-syntax
import SimWorker from 'workerize-loader!./sim.worker'

const drawerWidth = 320

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
    width: drawerWidth,
    overflowX: 'hidden'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  title: {
    flexGrow: 1
  }
}))

function PageChanger (props) {
  const [anchorEl, setAnchorEl] = useState(null)

  const classes = useStyles()

  const onClose = () => setAnchorEl(null)
  const onClick = (e) => setAnchorEl(e.currentTarget)

  const menuItems = []
  for (let i = 0; i <= props.pageCount; i++) {
    menuItems.push(
      <MenuItem
        key={i}
        onClick={() => {
          props.onChangedPage(i)
          onClose()
        }}
      >
        Page {i + 1}
      </MenuItem>
    )
  }

  return (
    <>
      <Tooltip title='Change page'>
        <Button
          aria-controls='simple-menu'
          aria-haspopup='true'
          aria-label='change page'
          className={classes.menuButton}
          color='inherit'
          onClick={onClick}
        >
          Page {1 + props.page}
          <ExpandMoreIcon />
        </Button>
      </Tooltip>

      <Menu
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorEl={anchorEl}
      >
        {menuItems}
      </Menu>
    </>
  )
}

function TabPanel (props) {
  const { children, value, index, ...other } = props

  return (
    <Fade
      in={value === index}
    >
      <div
        role='tabpanel'
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            {children}
          </Box>
        )}
      </div>
    </Fade>
  )
}

function App () {
  const [circuit, setCircuit, undo, redo] = useUndoable(() => logic.circuit([]))
  const [selection, setSelection] = useState(false)
  const [simState, setSimState] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [copiedGates, setCopiedGates] = useState(null)
  const [contextMenuPos, setContextMenuPos] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [tab, setTab] = useState(0)

  const simWorker = useRef(new SimWorker())

  /* For opening and closing the error snackbar. */
  const [errorMessage, setErrorMessage] = useState(null)

  /* Refs used for calculating the center of the page. */
  const appBarRef = useRef()
  const pageRef = useRef()

  const classes = useStyles()

  const closeContextMenu = () => setContextMenuPos(null)

  const downloadProject = () => {
    download('circuit.json', logic.dumpProject(circuit, currentPage))
  }

  const uploadProject = () =>
    upload()
      .then(logic.loadProject)
      .then((data) => {
        setCircuit(logic.renumber(data.circuit))

        const maxPage = data.circuit.gates.reduce(
          (maxPage, gate) => gate.page ? Math.max(maxPage, gate.page) : maxPage,
          0
        )

        const page = data.currentPage || 0

        /* Set the number of pages available to the user. */
        setPageCount(Math.max(page, maxPage + 1))

        /* Goto the first page, or the current page that was saved. */
        setCurrentPage(page)
      })
      .catch((error) => {
        setErrorMessage("Uh oh! We weren't able to load that file.")
        console.error(error)
      })

  const selectAll = () => {
    setSelection(
      Object.fromEntries(
        circuit.gates
          .filter((gate) => (gate.page || 0) === currentPage)
          .map((gate) => [gate.id, true]))
    )
    closeContextMenu()
  }

  const copy = () => {
    /* Copy the selection. */
    setCopiedGates(
      logic.removeInvalidConnections(
        circuit.gates.filter((gate) => selection[gate.id])
      )
    )
    closeContextMenu()
  }

  const paste = () => {
    if (copiedGates) {
      /* Renumber the circuit so we have no ID collisions. */
      const clone = logic.renumber(circuit)
      /* Append the copied gates to the circuit. */
      clone.gates = [
        ...clone.gates,
        ...copiedGates.map((gate) => ({
          ...gate,
          page: currentPage
        }))
      ]
      setCircuit(clone)
    }
    closeContextMenu()
  }

  const onPaletteSelect = useCallback((factory) => {
    /* Clone the circuit. */
    const clone = { ...circuit }
    clone.gates = [...clone.gates]

    /* Place the gate. */
    const gate = factory()
    clone.gates.push(gate)

    /* Calculate the gate position. */
    const appBarRect = appBarRef.current.getBoundingClientRect()
    const pageRect = pageRef.current.getBoundingClientRect()

    gate.x = ((appBarRect.width + drawerWidth) / 2 -
      pageRect.left) / 96
    gate.y = (
      (window.innerHeight + appBarRect.height) / 2 -
      pageRect.top) / 96

    gate.page = currentPage

    /* Update with the new circuit. */
    setCircuit(clone)
  }, [appBarRef, pageRef, circuit, currentPage, setCircuit])

  const onPlayButtonClicked = () => {
    if (!isPlaying) {
      /* Check for repeated senders. */
      const duplicates = logic.getDuplicateSenderLabels(circuit.gates)

      if (duplicates.length === 0) {
        simWorker.current.startSimulation(circuit)
        setIsPlaying(true)
      } else {
        setErrorMessage(
          `Uh oh! Multiple senders for labels: ${duplicates.join(', ')}`
        )
      }
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
    clone.gates = logic.removeInvalidConnections(clone.gates)
    setCircuit(clone)

    /* Clear selection. */
    setSelection({})
  }

  const cut = () => {
    copy()
    deleteSelection()
    closeContextMenu()
  }

  const changePage = (page) => {
    if (page >= 0) {
      setCurrentPage(page)
      if (page >= pageCount) {
        setPageCount(page + 1)
      }
    }
  }

  /* Attach key bindings to document body. */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target === document.body) {
        const uppercase = e.key.toUpperCase()

        let isValidShortcut = true
        if (e.getModifierState('Control')) {
          if (uppercase === 'C') {
            copy()
          } else if (uppercase === 'V') {
            paste()
          } else if (uppercase === 'X') {
            cut()
          } else if (uppercase === 'A') {
            selectAll()
          } else if (uppercase === 'Z') {
            undo()
          } else if (uppercase === 'Y') {
            redo()
          } else {
            isValidShortcut = false
          }
        } else if (e.key === 'Delete') {
          deleteSelection()
        } else if (uppercase === 'P') {
          onPlayButtonClicked()
        } else if (!isNaN(e.key)) {
          changePage(Number(e.key) - 1)
        } else if (e.key === '+') {
          changePage(currentPage + 1)
        } else if (e.key === '-') {
          changePage(currentPage - 1)
        } else {
          isValidShortcut = false
        }

        if (isValidShortcut) {
          e.preventDefault()
        }
      }
    }
    document.body.addEventListener('keydown', onKeyDown)
    return () => document.body.removeEventListener('keydown', onKeyDown)
  })

  return (
    <div
      className={classes.root}
      onContextMenu={(event) => {
        event.preventDefault()
        setContextMenuPos([event.clientX - 2, event.clientY - 4])
      }}
    >
      <CssBaseline />

      <Drawer variant='persistent' className={classes.drawer} open>
        <Toolbar />
        <div
          className={classes.drawerContent}
        >
          <Tabs
            onChange={(e, value) => setTab(value)}
            value={tab}
            variant='fullWidth'
          >
            <Tab label='Palette' />
            <Tab label='Properties' />
          </Tabs>
          <TabPanel value={tab} index={0}>
            <Palette
              onSelect={onPaletteSelect}
            />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <Inspector
              circuit={circuit}
              selection={selection}
              onCircuitChanged={(circuit) => setCircuit(circuit)}
            />
          </TabPanel>
        </div>
      </Drawer>

      <AppBar position='fixed' className={classes.appBar} ref={appBarRef}>
        <Toolbar>

          <Typography variant='h6' className={classes.title}>Flux Logic</Typography>

          <PageChanger
            page={currentPage}
            pageCount={pageCount}
            onChangedPage={changePage}
          />

          <ButtonGroup
            className={classes.menuButtonGroup}
            color='inherit'
          >
            <Tooltip title='Upload project'>
              <Button
                aria-label='upload'
                onClick={uploadProject}
              >
                <CloudUploadIcon />
              </Button>
            </Tooltip>
            <Tooltip title='Download project'>
              <Button
                aria-label='download'
                onClick={downloadProject}
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

          <Tooltip title={isPlaying ? 'Stop simulation' : 'Start simulation'}>
            <Button
              aria-label={isPlaying ? 'stop' : 'start'}
              onClick={onPlayButtonClicked}
              className={classes.menuButton}
              color='inherit'
            >
              {
                isPlaying ? <StopIcon /> : <PlayIcon />
              }
            </Button>
          </Tooltip>

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
              onClick={() => {
                window.open(
                  'https://github.com/tcannon686/fluxlogic#usage',
                  '_blank')
              }}
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
            page={currentPage}
            circuit={circuit}
            theme={defaultTheme}
            ref={pageRef}
            selection={selection}
            simState={simState}
            onSelectionChanged={(selection) => {
              setSelection(selection)
            }}
            onCircuitChanged={(circuit) => {
              setCircuit(circuit)
            }}
            onUserInputChanged={(gate, value) => {
              simWorker.current.setUserInput(gate, value)
            }}
            editable={!simState}
          />
        </Container>
      </main>
      <Snackbar
        open={errorMessage !== null}
        autoHideDuration={10000}
        onClose={() => { setErrorMessage(null) }}
        message={errorMessage}
      />
      <Menu
        keepMounted
        open={contextMenuPos !== null}
        onClose={closeContextMenu}
        anchorReference='anchorPosition'
        anchorPosition={
          contextMenuPos && { left: contextMenuPos[0], top: contextMenuPos[1] }
        }
      >
        <MenuItem onClick={cut}>Cut</MenuItem>
        <MenuItem onClick={copy}>Copy</MenuItem>
        <MenuItem onClick={paste}>Paste</MenuItem>
        <MenuItem onClick={selectAll}>Select all</MenuItem>
      </Menu>
    </div>
  )
}

export default App

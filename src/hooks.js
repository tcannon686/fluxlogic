import { useState } from 'react'

export const useUndoable = (state, max) => {
  const [present, setPresent] = useState(state)
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  const undo = () => {
    if (canUndo) {
      setFuture([present, ...future])
      setPresent(past[0])
      setPast(past.slice(1))
    }
  }

  const redo = () => {
    if (canRedo) {
      setPast([present, ...past])
      setPresent(future[0])
      setFuture(future.slice(1))
    }
  }

  const setState = (state) => {
    setPast([present, ...past].splice(-(max || 1000)))
    setPresent(state)
    setFuture([])
  }

  return [present, setState, undo, redo]
}

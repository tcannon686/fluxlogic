import { useRef, useEffect, useCallback, useState } from 'react'

/**
 * Creates a callback function that calls the given callback by reference. This
 * is useful when multiple components need to use the same callback, and you
 * don't want to trigger a rerender of all the components when the callback
 * changes. Returns the memoized callback.
 */
export const useRefCallback = (callback) => {
  const ref = useRef(null)
  const memoizedCallback = useCallback(
    (...args) => ref.current(...args),
    []
  )

  useEffect(() => {
    ref.current = callback
  }, [callback])

  return memoizedCallback
}

export const useUndoable = (state, max) => {
  const [present, setPresent] = useState(state)
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])

  const undo = useCallback(() => {
    const canUndo = past.length > 0
    if (canUndo) {
      setFuture([present, ...future])
      setPresent(past[0])
      setPast(past.slice(1))
    }
  }, [present, past, future, setPresent, setPast, setFuture])

  const redo = useCallback(() => {
    const canRedo = future.length > 0
    if (canRedo) {
      setPast([present, ...past])
      setPresent(future[0])
      setFuture(future.slice(1))
    }
  }, [present, past, future, setPresent, setPast, setFuture])

  const setState = useCallback((state) => {
    setPast([present, ...past].splice(-(max || 1000)))
    setPresent(state)
    setFuture([])
  }, [present, past, setPresent, setPast, setFuture, max])

  return [present, setState, undo, redo]
}

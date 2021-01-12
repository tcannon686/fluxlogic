import * as logic from './logic'

let state = null
let callback = null
let handle = null

export function startSimulation (circuit, initialState) {
  if (!state && !callback && !handle) {
    state = initialState || logic.nextState(circuit)
    callback = () => {
      state = logic.nextState(circuit, state)
    }
    handle = setInterval(callback, 1)
  } else {
    throw new Error('simulation already started')
  }
}

export function getState () {
  return state
}

export function stopSimulation () {
  clearInterval(handle)
  state = null
  callback = null
  handle = null
}

export function setUserInput (gate, value) {
  logic.setUserInput(gate, state, value)
}

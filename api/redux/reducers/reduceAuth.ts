import Auth from '../state/Auth'
import {AnyAction, CombinedState} from 'redux'
import InternalActionTypes from '../actions/InternalActionTypes'

const reduceAuth = (
  state: CombinedState<Auth> = {
    initialized: false,
  },
  action: AnyAction
): CombinedState<Auth> => {
  switch (action.type) {
    case InternalActionTypes.SET_INITIALIZED: {
      return {
        ...state,
        initialized: action.payload,
      }
    }
    case InternalActionTypes.SET_TOKEN:
      const {token} = action.payload as { token?: string, staySignedIn?: boolean }
      return {
        ...state,
        token: token
      }
    case InternalActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
      }
    case InternalActionTypes.LOGOUT:
      return {
        ...state,
        user: undefined,
        token: undefined,
      }
    default:
      return state
  }
}
export default reduceAuth

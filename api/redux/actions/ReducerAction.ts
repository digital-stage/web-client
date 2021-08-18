import { AnyAction } from 'redux'
import InternalActionTypes from './InternalActionTypes'

interface ReducerAction extends AnyAction {
    type: string | InternalActionTypes
    payload?: any
}

export default ReducerAction

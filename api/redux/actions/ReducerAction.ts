import { AnyAction } from 'redux'
import { InternalActionTypes } from './InternalActionTypes'

export interface ReducerAction extends AnyAction {
    type: string | InternalActionTypes
    payload?: any
}

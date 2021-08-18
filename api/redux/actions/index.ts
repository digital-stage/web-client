import { Action } from 'redux'
import serverActions from './serverActions'
import InternalActionTypes from './InternalActionTypes'
import clientActions from './clientActions'
import ReducerAction from './ReducerAction'
import AppThunk from './AppThunk'

const actions = {
    client: clientActions,
    server: serverActions,
}
export * from '../../AuthAction'
export * from './clientActions'

export { InternalActionTypes }
export type { AppThunk, ReducerAction }
export default actions

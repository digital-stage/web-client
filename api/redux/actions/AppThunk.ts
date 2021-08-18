import { ThunkAction } from '@reduxjs/toolkit'
import { RootState } from '@digitalstage/api-client-react'
import ReducerAction from './ReducerAction'

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, ReducerAction>

export default AppThunk

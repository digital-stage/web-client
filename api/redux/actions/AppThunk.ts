import { ThunkAction } from '@reduxjs/toolkit'
import { RootState } from '@digitalstage/api-client-react'
import { ReducerAction } from './ReducerAction'

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, ReducerAction>

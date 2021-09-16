import { ThunkAction } from '@reduxjs/toolkit'
import { RootState } from '../state'
import { ReducerAction } from './ReducerAction'

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, ReducerAction>

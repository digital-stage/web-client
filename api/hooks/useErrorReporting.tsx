import { useDispatch } from 'react-redux'
import React from 'react'
import { reportError } from '../redux/actions/clientActions'

const useErrorReporting = () => {
    const dispatch = useDispatch()
    return React.useCallback(
        (err: any) => {
            if (err instanceof Error) {
                dispatch(reportError(err))
            } else {
                dispatch(reportError(new Error(err)))
            }
        },
        [dispatch]
    )
}
export { useErrorReporting }

import { useDispatch } from 'react-redux'
import React from 'react'
import { reportError } from '../redux/actions/clientActions'

const useErrorReporting = () => {
    const dispatch = useDispatch()
    return React.useCallback(
        (err: any) => {
            if (err instanceof Error) {
                console.error(err)
                dispatch(reportError(err))
            } else {
                const error = new Error(err)
                console.error(error)
                dispatch(reportError(error))
            }
        },
        [dispatch]
    )
}
export { useErrorReporting }

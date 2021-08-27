import { useDispatch } from 'react-redux'
import { reportError } from '@digitalstage/api-client-react'
import React from 'react'

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

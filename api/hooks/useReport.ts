import { useDispatch } from 'react-redux'
import React, { useCallback } from 'react'
import { addNotification } from '../redux/actions/clientActions'
import { v4 as uuidv4 } from 'uuid'
import { KIND } from '../redux/state/Notifications'

interface ReportContext {
    report: (kind: KIND[keyof KIND], message: React.ReactNode, permanent?: boolean) => void
}

const useReport = (): ReportContext => {
    const dispatch = useDispatch()
    const report = useCallback(
        (kind: KIND[keyof KIND] = 'info', message: React.ReactNode, permanent?: boolean) => {
            dispatch(
                addNotification({
                    id: uuidv4(),
                    date: new Date().getTime(),
                    kind: kind,
                    message: message,
                    permanent: permanent,
                    featured: true,
                })
            )
        },
        [dispatch]
    )

    return {
        report,
    }
}
export default useReport

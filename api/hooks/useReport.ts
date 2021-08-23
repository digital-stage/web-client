import { useCallback } from 'react'
import { KIND } from '../redux/state/Notifications'
import useReporting from './useReporting'

interface ReportContextT {
    report: (kind: KIND[keyof KIND], message: string, link?: string, permanent?: boolean) => void
}

const useReport = (): ReportContextT => {
    const { addNotification } = useReporting()

    const report = useCallback(
        (kind: KIND[keyof KIND] = 'info', message: string, link?: string, permanent?: boolean) => {
            addNotification({
                date: new Date().getTime(),
                kind: kind,
                message: message,
                permanent: permanent,
                featured: true,
            })
        },
        [addNotification]
    )

    return {
        report,
    }
}
export default useReport

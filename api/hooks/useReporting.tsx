import { useContext } from 'react'
import { ReportingContext, ReportingContextT } from '../provider/ReportingProvider'

const useReporting = (): ReportingContextT => useContext<ReportingContextT>(ReportingContext)
export default useReporting

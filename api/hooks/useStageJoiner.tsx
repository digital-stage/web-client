import * as React from 'react'
import { StageHandlingContext, StageHandlingContextT } from '../provider/StageHandlingProvider'

const useStageJoiner = (): StageHandlingContextT =>
    React.useContext<StageHandlingContextT>(StageHandlingContext)

export default useStageJoiner

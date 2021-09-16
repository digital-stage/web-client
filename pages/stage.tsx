import React from 'react'
import {StageView} from 'components/stage/StageView'
import {Loading} from "../components/global/Loading";
import {useStageAvailable} from "../components/global/useStageAvailable";

const Stage = () => {
    const stageAvailable = useStageAvailable()
    if (stageAvailable) {
        return <StageView/>
    }
    return <Loading/>
}
export default Stage

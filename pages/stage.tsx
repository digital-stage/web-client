import { useStageSelector } from '@digitalstage/api-client-react'
import React, { useEffect } from 'react'
import {StageView} from 'components/stage/StageView'
import { useRouter } from 'next/router'

const Stage = () => {
    const { replace } = useRouter()
    const ready = useStageSelector((state) => state.globals.ready)
    const stageId = useStageSelector((state) => state.globals.stageId)

    useEffect(() => {
        if (ready && !stageId) {
            replace('/stages')
        }
    }, [replace, ready, stageId])

    if (stageId) {
        return <StageView stageId={stageId} />
    }
    return null
}
export default Stage

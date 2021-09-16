import {useSpatialAudioSelector, useStageSelector} from '@digitalstage/api-client-react'
import {useRouter} from 'next/router'
import React from 'react'
import {RoomEditor} from '../../components/room/RoomEditor'
import {Loading} from "../../components/global/Loading";

const Room = () => {
    const {push} = useRouter()
    const ready = useStageSelector((state) => state.globals.ready)
    const stageId = useStageSelector<string | undefined>((state) => state.globals.stageId)
    const renderSpatialAudio = useSpatialAudioSelector()
    React.useEffect(() => {
        if (ready) {
            if (!stageId) {
                push('/stages')
            } else if (!renderSpatialAudio) {
                push('/stage')
            }
        }
    }, [push, stageId, ready, renderSpatialAudio])

    if (ready && stageId && renderSpatialAudio) {
        return (
            <div className="roomWrapper">
                {stageId && process.browser ? <RoomEditor stageId={stageId}/> : null}
            </div>
        )
    }
    return <Loading/>
}
export default Room

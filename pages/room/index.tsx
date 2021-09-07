import { useSpatialAudioSelector, useStageSelector } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import {RoomEditor} from '../../components/room/RoomEditor'

const Room = () => {
    const { push } = useRouter()
    const ready = useStageSelector((state) => state.globals.ready)
    const stageId = useStageSelector<string | undefined>((state) => state.globals.stageId)
    const renderSpatialAudio = useSpatialAudioSelector()
    useEffect(() => {
        if (ready) {
            if (!stageId) {
                push('/stages')
            } else if (!renderSpatialAudio) {
                push('/stage')
            }
        }
    }, [push, stageId, ready, renderSpatialAudio])
    return (
        <div className="roomWrapper">
            {stageId && process.browser ? <RoomEditor stageId={stageId} /> : null}
        </div>
    )
}
export default Room

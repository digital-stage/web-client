import {
    useEmit,
    useNotification,
    useStageJoiner,
    useStageSelector,
} from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'

const JoinPage = () => {
    const { query } = useRouter()
    const { join } = useStageJoiner()
    const notify = useNotification()
    const emit = useEmit()
    const ready = useStageSelector((state) => state.globals.ready)

    useEffect(() => {
        if (emit && query && ready && notify) {
            const code = Array.isArray(query.code) ? query.code[0] : query.code
            emit(
                ClientDeviceEvents.DecodeInviteCode,
                code as ClientDevicePayloads.DecodeInviteCode,
                (
                    error: string | null,
                    result?: { stageId: string; groupId: string; code: string }
                ) => {
                    if (error) {
                        return notify({ kind: 'error', message: error })
                    }
                    const { stageId, groupId } = result
                    return join({
                        stageId,
                        groupId,
                        password: null,
                    })
                }
            )
        }
    }, [emit, query, ready, notify, join])

    return <div>Trete bei ...</div>
}
export default JoinPage

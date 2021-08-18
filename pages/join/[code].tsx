import {
    useConnection,
    useReport,
    useStageJoiner,
    useStageSelector,
} from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'

const JoinPage = () => {
    const { query } = useRouter()
    const { requestJoin } = useStageJoiner()
    const { report } = useReport()
    const { emit } = useConnection()
    const ready = useStageSelector((state) => state.globals.ready)

    useEffect(() => {
        if (emit && query && ready) {
            const code = Array.isArray(query.code) ? query.code[0] : query.code
            emit(
                ClientDeviceEvents.DecodeInviteCode,
                code as ClientDevicePayloads.DecodeInviteCode,
                (
                    error: string | null,
                    result?: { stageId: string; groupId: string; code: string }
                ) => {
                    if (error) {
                        return report('error', error)
                    }
                    const { stageId, groupId } = result
                    console.log(stageId, groupId)
                    return requestJoin({
                        stageId,
                        groupId,
                        password: null,
                    })
                }
            )
        }
    }, [emit, query, ready, report, requestJoin])

    return <div>Trete bei ...</div>
}
export default JoinPage

import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { ClientDeviceEvents } from '@digitalstage/api-types'
import { useEmit } from 'api/services/ConnectionService'
import { requestJoin } from 'api/redux/actions/clientActions'

const useStageJoiner = (): {
    join: (payload: { stageId: string; groupId?: string; password?: string }) => void
    leave: () => void
    resetJoin: () => void
} => {
    const emit = useEmit()
    const dispatch = useDispatch()

    const join = useCallback(
        (payload: { stageId: string; groupId?: string; password?: string }) => {
            dispatch(requestJoin(payload))
        },
        [dispatch]
    )

    const leave = useCallback(() => {
        emit(ClientDeviceEvents.LeaveStage)
    }, [emit])

    const resetJoin = useCallback(() => {
        dispatch(requestJoin())
    }, [dispatch])

    return {
        join,
        leave,
        resetJoin,
    }
}
export { useStageJoiner }

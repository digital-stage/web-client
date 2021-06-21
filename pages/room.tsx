import React from 'react'
import { useRouter } from 'next/router'
import { useAuth, useStageSelector } from '@digitalstage/api-client-react'
import dynamic from 'next/dynamic'

const DynamicRoomManager = dynamic(() => import('../components/room/RoomManager'), { ssr: false })

const Room = (): JSX.Element => {
    const router = useRouter()
    const ready = useStageSelector<boolean>((state) => state.globals.ready)
    const stageId = useStageSelector<string>((state) => state.globals.stageId)
    const { loading, user } = useAuth()

    if (!loading && !user) {
        router.replace('/account/login')
    }

    if (ready && !stageId) {
        router.replace('/stages')
    }

    return <DynamicRoomManager />
}
export default Room

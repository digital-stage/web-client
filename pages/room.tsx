import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth, useStageSelector } from '@digitalstage/api-client-react'
import RoomManager from '../components2/room/RoomManager'
import Block from '../components/ui/Block'

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

    return (
        <Block padding={2} vertical height="full">
            <RoomManager />
        </Block>
    )
}
export default Room

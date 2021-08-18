import { useStageSelector } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import RoomEditor from '../../components/room/RoomEditor'
import styles from './Room.module.scss'

const Room = () => {
    const { push } = useRouter()
    const ready = useStageSelector((state) => state.globals.ready)
    const stageId = useStageSelector<string | undefined>((state) => state.globals.stageId)
    useEffect(() => {
        if (ready && !stageId) {
            push('/stages')
        }
    }, [push, stageId, ready])
    return (
        <div className={styles.wrapper}>
            {stageId && process.browser ? <RoomEditor stageId={stageId} /> : null}
        </div>
    )
}
export default Room

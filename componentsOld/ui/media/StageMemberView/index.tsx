import { StageMember, User, useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import styles from './StageMemberView.module.css'

const StageMemberView = (props: { id: string }) => {
    const { id } = props
    const stageMember = useStageSelector<StageMember>((state) => state.stageMembers.byId[id])
    const remoteUser = useStageSelector<User>((state) => state.remoteUsers.byId[stageMember.userId])

    return (
        <div className={styles.wrapper}>
            <div className={styles.inner}>
                <div className={styles.banner}>{remoteUser.name}</div>
            </div>
        </div>
    )
}
export default StageMemberView

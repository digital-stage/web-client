import React, { useState } from 'react'
import styles from './StageView.module.scss'
import Image from 'next/image'
import landscapeIcon from '../../public/icons/landscape.svg'
import portraitIcon from '../../public/icons/portrait.svg'
import MembersGrid from './MembersGrid'
import { useStageSelector } from '@digitalstage/api-client-react'

const StageView = ({ stageId }: { stageId: string }) => {
    const [showLanes, setShowLanes] = useState<boolean>(false)
    const hasAdminRights = useStageSelector<boolean>((state) =>
        state.globals.localUserId
            ? state.stages.byId[stageId].admins.some((id) => id === state.globals.localUserId)
            : false
    )
    return (
        <div className={`${styles.wrapper} `}>
            <MembersGrid stageId={stageId} showLanes={showLanes} hasAdminRights={hasAdminRights} />
            <div className={styles.control}>
                <button className="round" onClick={() => setShowLanes(false)}>
                    <Image src={landscapeIcon} alt="Auf Breitbilddarstellung umschalten" />
                </button>
                <button className="round" onClick={() => setShowLanes(true)}>
                    <Image src={portraitIcon} alt="Auf Hochkantdarstellung umschalten" />
                </button>
            </div>
        </div>
    )
}
export default StageView

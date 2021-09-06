import React from 'react'
import styles from './StageView.module.scss'
import Image from 'next/image'
import landscapeIcon from '../../public/icons/landscape.svg'
import portraitIcon from '../../public/icons/portrait.svg'
import { MembersGrid } from './MembersGrid'

// TODO: TypeError: Cannot read property 'name' of undefined
// return e.users.byId[e.stageMembers.byId[r].userId].name

const StageView = ({ stageId }: { stageId: string }) => {
    const [showLanes, setShowLanes] = React.useState<boolean>(false)
    return (
        <div className={`${styles.wrapper} `}>
            <MembersGrid stageId={stageId} showLanes={showLanes} />
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
